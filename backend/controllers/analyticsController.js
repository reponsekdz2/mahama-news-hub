const db = require('../config/db');

// @desc    Get advanced site analytics summary
// @route   GET /api/analytics/advanced
// @access  Admin
const getAdvancedAnalytics = async (req, res, next) => {
    try {
        const { range = '30d' } = req.query; // '7d', '30d', 'all'
        
        let dateFilter = '';
        if (range === '7d') {
            dateFilter = `WHERE ua.createdAt >= CURDATE() - INTERVAL 7 DAY`;
        } else if (range === '30d') {
            dateFilter = `WHERE ua.createdAt >= CURDATE() - INTERVAL 30 DAY`;
        }
        
        const [dau] = await db.query(`SELECT COUNT(DISTINCT user_id) as count FROM user_actions WHERE DATE(createdAt) = CURDATE()`);
        const [mau] = await db.query(`SELECT COUNT(DISTINCT user_id) as count FROM user_actions WHERE createdAt >= CURDATE() - INTERVAL 30 DAY`);
        
        const [newUsers] = await db.query(`SELECT COUNT(*) as count FROM users ${dateFilter.replace('ua.','users.')}`);

        const [totalActions] = await db.query(`SELECT COUNT(*) as count FROM user_actions ${dateFilter}`);

        const [engagementTrends] = await db.query(`
            SELECT
                DATE(createdAt) as date,
                SUM(CASE WHEN action_type = 'view' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN action_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN action_type = 'comment' THEN 1 ELSE 0 END) as comments
            FROM user_actions
            ${dateFilter}
            GROUP BY DATE(createdAt)
            ORDER BY date ASC
        `);

        const [topArticles] = await db.query(`
            SELECT 
                a.id, a.title,
                COUNT(ua.id) as total_actions,
                SUM(CASE WHEN ua.action_type = 'view' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN ua.action_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN ua.action_type = 'comment' THEN 1 ELSE 0 END) as comments
            FROM articles a
            JOIN user_actions ua ON a.id = ua.target_id
            ${dateFilter}
            GROUP BY a.id, a.title
            ORDER BY total_actions DESC
            LIMIT 10
        `);
        
        const [topCategories] = await db.query(`
            SELECT a.category, COUNT(ua.id) as total_actions
            FROM articles a
            JOIN user_actions ua ON a.id = ua.target_id
            ${dateFilter}
            GROUP BY a.category
            ORDER BY total_actions DESC
            LIMIT 10
        `);
        
        const [topAuthors] = await db.query(`
             SELECT u.name as authorName, COUNT(ua.id) as total_actions
             FROM users u
             JOIN articles a ON u.id = a.author_id
             JOIN user_actions ua ON a.id = ua.target_id
             ${dateFilter}
             GROUP BY u.name
             ORDER BY total_actions DESC
             LIMIT 10
        `);

        res.json({
            dau: dau[0].count,
            mau: mau[0].count,
            newUsers: newUsers[0].count,
            totalActions: totalActions[0].count,
            engagementTrends,
            topArticles,
            topCategories,
            topAuthors
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Get trending articles
const getTrendingArticles = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT a.id, a.title, COUNT(v.id) as views
            FROM articles a
            JOIN article_views v ON a.id = v.article_id
            WHERE v.createdAt >= CURDATE() - INTERVAL 7 DAY
            GROUP BY a.id ORDER BY views DESC LIMIT 5
        `);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdvancedAnalytics,
    getTrendingArticles,
};