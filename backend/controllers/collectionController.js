const db = require('../config/db');
const { logUserAction } = require('../services/logService');

// @desc    Get all collections for a user
const getCollections = async (req, res, next) => {
    try {
        const [collections] = await db.query(`
            SELECT c.id, c.name, COUNT(ca.article_id) as articleCount
            FROM collections c
            LEFT JOIN collection_articles ca ON c.id = ca.collection_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.name ASC
        `, [req.user.id]);
        
        for(let collection of collections) {
            const [articles] = await db.query(`
                 SELECT 
                    a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                    u.name as authorName,
                    (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                    (SELECT COUNT(*) > 0 FROM article_likes WHERE article_id = a.id AND user_id = ?) as isLiked
                FROM collection_articles ca
                JOIN articles a ON ca.article_id = a.id
                