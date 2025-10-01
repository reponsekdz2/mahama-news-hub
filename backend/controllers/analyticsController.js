const db = require('../config/db');

// @desc    Get site analytics summary
// @route   GET /api/analytics
// @access  Admin
const getAnalyticsSummary = async (req, res, next) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
        const [articleCount] = await db.query('SELECT COUNT(*) as total FROM articles');
        const [viewCount] = await db.query('SELECT COUNT(*) as total FROM article_views');
        const [likeCount] = await db.query('SELECT COUNT(*) as total FROM article_likes');

        const [topViewed] = await db.query(`
            SELECT a.id, a.title, COUNT(v.id) as views
            FROM articles a
            LEFT JOIN article_views v ON a.id = v.article_id
            GROUP BY a.id
            ORDER BY views DESC
            LIMIT 5
        `);

        const [topLiked] = await db.query(`
            SELECT a.id, a.title, COUNT(l.id) as likes
            FROM articles a
            LEFT JOIN article_likes l ON a.id = l.article_id
            GROUP BY a.id
            ORDER BY likes DESC
            LIMIT 5
        `);
        
        const [viewsLast30Days] = await db.query(`
            SELECT DATE(createdAt) as date, COUNT(*) as views
            FROM article_views
            WHERE createdAt >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(createdAt)
            ORDER BY date ASC
        `);

        res.json({
            totalUsers: userCount[0].total,
            totalArticles: articleCount[0].total,
            totalViews: viewCount[0].total,
            totalLikes: likeCount[0].total,
            topViewed,
            topLiked,
            viewsLast30Days
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get trending articles
// @route   GET /api/analytics/trending
// @access  Public
const getTrendingArticles = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT a.id, a.title, COUNT(v.id) as views
            FROM articles a
            JOIN article_views v ON a.id = v.article_id
            WHERE v.createdAt >= CURDATE() - INTERVAL 7 DAY
            GROUP BY a.id
            ORDER BY views DESC
            LIMIT 5
        `);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalyticsSummary,
    getTrendingArticles,
};