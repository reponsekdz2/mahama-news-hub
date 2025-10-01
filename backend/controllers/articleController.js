const db = require('../config/db');

// @desc    Get articles, optionally by topic/search
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res, next) => {
    try {
        const { topic } = req.query;
        let query = `
            SELECT 
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount
            FROM articles a
            JOIN users u ON a.author_id = u.id
        `;
        const queryParams = [];

        if (topic && topic !== 'Top Stories') {
            query += ' WHERE a.category = ? OR a.title LIKE ? OR a.content LIKE ?';
            queryParams.push(topic, `%${topic}%`, `%${topic}%`);
        }

        query += ' ORDER BY a.createdAt DESC';

        const [articles] = await db.query(query, queryParams);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT 
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.id = ?
        `, [req.params.id]);

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(articles[0]);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new article
// @route   POST /api/articles
// @access  Admin
const createArticle = async (req, res, next) => {
    const { title, content, category } = req.body;
    const author_id = req.user.id;

    // Get file paths from multer
    const imageUrl = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : null;

    if (!title || !content || !category || !imageUrl) {
        return res.status(400).json({ message: 'Please provide all required fields (title, content, category, image).' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO articles (title, content, category, image_url, video_url, author_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content, category, imageUrl, videoUrl, author_id]
        );
        res.status(201).json({ id: result.insertId, title, content, category, imageUrl, videoUrl, author_id });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Admin
const updateArticle = async (req, res, next) => {
    const { title, content, category } = req.body;
    const articleId = req.params.id;

    const imageUrl = req.files.image ? `/uploads/${req.files.image[0].filename}` : req.body.imageUrl;
    const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : req.body.videoUrl;

    try {
        await db.query(
            'UPDATE articles SET title = ?, content = ?, category = ?, image_url = ?, video_url = ? WHERE id = ?',
            [title, content, category, imageUrl, videoUrl, articleId]
        );
        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Admin
const deleteArticle = async (req, res, next) => {
    try {
        await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Like an article
// @route   POST /api/articles/:id/like
// @access  Protected
const likeArticle = async (req, res, next) => {
    try {
        // Check if already liked
        const [existingLike] = await db.query('SELECT id FROM article_likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.params.id]);
        if (existingLike.length > 0) {
            return res.status(400).json({ message: 'Article already liked' });
        }
        await db.query('INSERT INTO article_likes (user_id, article_id) VALUES (?, ?)', [req.user.id, req.params.id]);
        res.status(201).json({ message: 'Article liked' });
    } catch (error) {
        next(error);
    }
};

// @desc    Unlike an article
// @route   DELETE /api/articles/:id/like
// @access  Protected
const unlikeArticle = async (req, res, next) => {
    try {
        await db.query('DELETE FROM article_likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.params.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Record a view for an article
// @route   POST /api/articles/:id/view
// @access  Public
const recordView = async (req, res, next) => {
    try {
        // Here you might add logic to prevent multiple views from the same user in a short time
        await db.query('INSERT INTO article_views (article_id) VALUES (?)', [req.params.id]);
        res.status(201).json({ message: 'View recorded' });
    } catch (error) {
        next(error);
    }
};

// @desc Get comments for an article
// @route GET /api/articles/:id/comments
// @access Public
const getCommentsForArticle = async (req, res, next) => {
    try {
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.createdAt, u.name as userName 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.createdAt DESC
        `, [req.params.id]);
        res.json(comments);
    } catch (error) {
        next(error);
    }
}

// @desc Add a comment to an article
// @route POST /api/articles/:id/comments
// @access Protected
const addCommentToArticle = async (req, res, next) => {
    const { content } = req.body;
    const { id: article_id } = req.params;
    const { id: user_id } = req.user;

    if (!content) {
        return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    try {
        const [result] = await db.query('INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)', [article_id, user_id, content]);
        const [newComment] = await db.query(`
            SELECT c.id, c.content, c.createdAt, u.name as userName
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);
        res.status(201).json(newComment[0]);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    unlikeArticle,
    recordView,
    getCommentsForArticle,
    addCommentToArticle
};
