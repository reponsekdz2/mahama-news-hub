

const db = require('../config/db');
const { logUserAction } = require('../services/logService');

// @desc    Get user's search history
// @route   GET /api/search
// @access  Protected
const getSearchHistory = async (req, res, next) => {
    try {
        const [history] = await db.query(
            `SELECT DISTINCT query FROM user_search_history WHERE user_id = ? ORDER BY createdAt DESC LIMIT 5`,
            [req.user.id]
        );
        res.json(history);
    } catch (error) {
        next(error);
    }
};

// @desc    Log a user's search query
// @route   POST /api/search
// @access  Protected
const logSearchQuery = async (req, res, next) => {
    const { query } = req.body;
    if (!query || !query.trim()) {
        return res.status(400).json({ message: 'Query is required.' });
    }
    try {
        await db.query(
            'INSERT INTO user_search_history (user_id, query) VALUES (?, ?)',
            [req.user.id, query.trim()]
        );
        logUserAction(req.user.id, 'search', null, { query: query.trim() });
        res.status(201).json({ message: 'Search logged.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSearchHistory,
    logSearchQuery,
};