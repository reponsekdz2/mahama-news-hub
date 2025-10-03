const db = require('../config/db');
const { logUserAction, logAdminAction } = require('../services/logService');

// Helper function to manage article tags within a transaction
const handleArticleTags = async (connection, articleId, tagsString) => {
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

const getArticles = async (req, res, next) => {
    try {
        const { topic, dateRange = 'all', sortBy = 'newest' } = req.query;
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
        let whereClauses = ['a.status = "published"'];
        if (req.user?.role === 'admin') {
           whereClauses = []; // Admin can see all articles including drafts
        }

        if (topic && topic !== 'Top Stories') {
            whereClauses.push('(a.category = ? OR a.title LIKE ? OR a.content LIKE ? OR t.name = ?)');
            const searchTerm = `%${topic}%`;
            queryParams.push(topic, searchTerm, searchTerm, topic);
        }

        // Date range filtering
        if (dateRange === '24h') {
            whereClauses.push('a.createdAt >= NOW() - INTERVAL 1 DAY');
        } else if (dateRange === '7d') {
            whereClauses.push('a.createdAt >= NOW() - INTERVAL 7 DAY');
        } else if (dateRange === '30d') {
            whereClauses.push('a.createdAt >= NOW() - INTERVAL 30 DAY');
        }


        if (whereClauses.length > 0) query += ' WHERE ' + whereClauses.join(' AND ');
        
        query += ' GROUP BY a.id';

        // Sorting
        switch(sortBy) {
            case 'oldest':
                query += ' ORDER BY a.createdAt ASC';
                break;
            case 'views':
                query += ' ORDER BY viewCount DESC';
                break;
            case 'likes':
                query += ' ORDER BY likeCount DESC';
                break;
            case 'newest':
            default:
                 query += ' ORDER BY a.createdAt DESC';
                 break;
        }


        const [articles] = await db.query(query, queryParams);
        
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

const getSearchSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const searchTerm = `%${q}%`;
        const [articles] = await db.query(
            `SELECT id, title FROM articles WHERE status = 'published' AND title LIKE ? ORDER BY createdAt DESC LIMIT 5`,
            [searchTerm]
        );
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

const getRandomArticle = async (req, res, next) => {
    try {
        // This query is optimized for performance on large tables
        const [articles] = await db.query(`
            SELECT 
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl, a.status,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                GROUP_CONCAT(t.name SEPARATOR ', ') as tags
            FROM articles AS a 
            JOIN (SELECT id FROM articles WHERE status = 'published' ORDER BY RAND() LIMIT 1) AS r ON a.id = r.id
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
            GROUP BY a.id;
        `);

        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found' });
        }
        res.json(articles[0]);
    } catch (error) {
        next(error);
    }
};

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
            WHERE a.id = ? GROUP BY a.id
        `, [req.params.id]);

        if (articles.length === 0) return res.status(404).json({ message: 'Article not found' });
        res.json(articles[0]);
    } catch (error) {
        next(error);
    }
};

const getRelatedArticles = async (req, res, next) => {
    try {
        const [current] = await db.query('SELECT category FROM articles WHERE id = ?', [req.params.id]);
        if (current.length === 0) return res.json([]);
        const [related] = await db.query(`
            SELECT id, title, image_url as imageUrl, category FROM articles 
            WHERE category = ? AND id != ? AND status = 'published'
            ORDER BY createdAt DESC LIMIT 3
        `, [current[0].category, req.params.id]);
        res.json(related);
    } catch (error) {
        next(error);
    }
};

const createArticle = async (req, res, next) => {
    const { title, content, category, status, tags } = req.body;
    const author_id = req.user.id;
    const imageUrl = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : null;
    if (!title || !content || !category || !imageUrl) return res.status(400).json({ message: 'Title, content, category, and image are required.' });

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
        
        logAdminAction(req.user.id, 'create', 'article', articleId, { title, category });
        res.status(201).json({ id: articleId, title, content, category, imageUrl, videoUrl, author_id, status, tags });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

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

        logAdminAction(req.user.id, 'update', 'article', articleId, { title, category });
        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const deleteArticle = async (req, res, next) => {
    try {
        await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        logAdminAction(req.user.id, 'delete', 'article', req.params.id, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const likeArticle = async (req, res, next) => {
    try {
        await db.query('INSERT IGNORE INTO article_likes (user_id, article_id) VALUES (?, ?)', [req.user.id, req.params.id]);
        logUserAction(req.user.id, 'like', req.params.id);
        res.status(201).json({ message: 'Article liked' });
    } catch (error) {
        next(error);
    }
};

const unlikeArticle = async (req, res, next) => {
    try {
        await db.query('DELETE FROM article_likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.params.id]);
        logUserAction(req.user.id, 'unlike', req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const recordView = async (req, res, next) => {
    const articleId = req.params.id;
    const userId = req.user ? req.user.id : null;
    try {
        await db.query('INSERT INTO article_views (article_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE createdAt = CURRENT_TIMESTAMP', [articleId, userId]);
        if(userId) logUserAction(userId, 'view', articleId);
        res.status(201).json({ message: 'View recorded' });
    } catch (error) {
        next(error);
    }
};

const recordShare = async (req, res, next) => {
    const articleId = req.params.id;
    const { platform } = req.body;
    try {
        logUserAction(req.user.id, 'share_article', articleId, { platform });
        res.status(201).json({ message: 'Share recorded' });
    } catch (error) {
        next(error);
    }
};

const getCommentsForArticle = async (req, res, next) => {
    try {
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.createdAt, u.name as userName FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ? ORDER BY c.createdAt DESC
        `, [req.params.id]);
        res.json(comments);
    } catch (error) {
        next(error);
    }
}

const addCommentToArticle = async (req, res, next) => {
    const { content } = req.body;
    const { id: article_id } = req.params;
    const { id: user_id, name: actor_name } = req.user;
    if (!content) return res.status(400).json({ message: 'Comment content cannot be empty' });

    try {
        const [result] = await db.query('INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)', [article_id, user_id, content]);
        const [newComment] = await db.query(`
            SELECT c.id, c.content, c.createdAt, u.name as userName FROM comments c
            JOIN users u ON c.user_id = u.id WHERE c.id = ?
        `, [result.insertId]);

        const [commenters] = await db.query(
            'SELECT DISTINCT c.user_id FROM comments c JOIN user_preferences up ON c.user_id = up.user_id WHERE c.article_id = ? AND c.user_id != ? AND up.comment_notifications_enabled = 1',
            [article_id, user_id]
        );
        if (commenters.length > 0) {
            const promises = commenters.map(c => db.query(
                'INSERT INTO notifications (user_id, actor_name, type, related_article_id) VALUES (?, ?, ?, ?)',
                [c.user_id, actor_name, 'new_comment', article_id]
            ));
            await Promise.all(promises);
        }
        
        logUserAction(user_id, 'comment', article_id, { commentId: result.insertId });
        res.status(201).json(newComment[0]);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getArticles, getArticleById, createArticle, updateArticle, deleteArticle,
    likeArticle, unlikeArticle, recordView, getCommentsForArticle, addCommentToArticle,
    getRelatedArticles, recordShare, getSearchSuggestions, getRandomArticle
};
