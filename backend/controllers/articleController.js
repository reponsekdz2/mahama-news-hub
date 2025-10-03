const db = require('../config/db');

// Helper function to manage article tags within a transaction
const handleArticleTags = async (connection, articleId, tagsString) => {
    // Clear existing tags for the article
    await connection.query('DELETE FROM article_tags WHERE article_id = ?', [articleId]);
    if (!tagsString) return;

    const tagNames = tagsString.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tagNames.length === 0) return;

    for (const name of tagNames) {
        let [tags] = await connection.query('SELECT id FROM tags WHERE name = ?', [name]);
        let tagId;
        if (tags.length === 0) {
            const [result] = await connection.query('INSERT INTO tags (name) VALUES (?)', [name]);
            tagId = result.insertId;
        } else {
            tagId = tags[0].id;
        }
        await connection.query('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
    }
};


// @desc    Get articles, optionally by topic/search, and include active ads
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res, next) => {
    try {
        const { topic } = req.query;
        let query = `
            SELECT 
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl, a.status,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                GROUP_CONCAT(t.name SEPARATOR ', ') as tags
            FROM articles a
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
        `;
        const queryParams = [];

        let whereClauses = [];
        // Non-admins can only see published articles. Admins see all.
        if (req.user?.role !== 'admin') {
            whereClauses.push('a.status = "published"');
        }

        if (topic && topic !== 'Top Stories') {
            whereClauses.push('(a.category = ? OR a.title LIKE ? OR a.content LIKE ?)');
            queryParams.push(topic, `%${topic}%`, `%${topic}%`);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
        
        query += ' GROUP BY a.id ORDER BY a.createdAt DESC';

        const [articles] = await db.query(query, queryParams);
        
        // Fetch active ads
        const [ads] = await db.query(`
            SELECT id, title, image_url as imageUrl, link_url as linkUrl, status, placement
            FROM advertisements
            WHERE status = 'active' AND placement = 'in-feed'
        `);

        res.json({ articles, ads });
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
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl, a.status,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                GROUP_CONCAT(t.name SEPARATOR ', ') as tags
            FROM articles a
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
            WHERE a.id = ?
            GROUP BY a.id
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
    const { title, content, category, status, tags } = req.body;
    const author_id = req.user.id;
    const imageUrl = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : null;

    if (!title || !content || !category || !imageUrl) {
        return res.status(400).json({ message: 'Please provide all required fields (title, content, category, image).' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO articles (title, content, category, image_url, video_url, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, content, category, imageUrl, videoUrl, author_id, status || 'published']
        );
        const articleId = result.insertId;

        await handleArticleTags(connection, articleId, tags);
        
        await connection.commit();
        res.status(201).json({ id: articleId, title, content, category, imageUrl, videoUrl, author_id, status, tags });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Admin
const updateArticle = async (req, res, next) => {
    const { title, content, category, status, tags } = req.body;
    const articleId = req.params.id;
    const imageUrl = req.files.image ? `/uploads/${req.files.image[0].filename}` : req.body.imageUrl;
    const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : req.body.videoUrl;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE articles SET title = ?, content = ?, category = ?, image_url = ?, video_url = ?, status = ? WHERE id = ?',
            [title, content, category, imageUrl, videoUrl, status, articleId]
        );
        
        await handleArticleTags(connection, articleId, tags);

        await connection.commit();
        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
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

// ... (like, unlike, recordView, comments functions remain the same)
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

// @desc Add a comment to an article and notify other commenters
// @route POST /api/articles/:id/comments
// @access Protected
const addCommentToArticle = async (req, res, next) => {
    const { content } = req.body;
    const { id: article_id } = req.params;
    const { id: user_id, name: actor_name } = req.user;

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

        // --- Notification Logic ---
        // Find all other unique users who have commented on this article
        const [commenters] = await db.query(
            'SELECT DISTINCT c.user_id FROM comments c JOIN user_preferences up ON c.user_id = up.user_id WHERE c.article_id = ? AND c.user_id != ? AND up.comment_notifications_enabled = 1',
            [article_id, user_id]
        );

        if (commenters.length > 0) {
            const notificationPromises = commenters.map(commenter => {
                return db.query(
                    'INSERT INTO notifications (user_id, actor_name, type, related_article_id) VALUES (?, ?, ?, ?)',
                    [commenter.user_id, actor_name, 'new_comment', article_id]
                );
            });
            await Promise.all(notificationPromises);
        }
        // --- End Notification Logic ---
        
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