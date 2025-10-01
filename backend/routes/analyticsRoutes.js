const express = require('express');
const router = express.Router();
const { getAnalyticsSummary, getTrendingArticles } = require('../controllers/analyticsController');
const { adminProtect } = require('../middleware/authMiddleware');

/**
 * @route   GET api/analytics
 * @desc    Get a summary of site analytics
 * @access  Admin
 */
router.get('/', adminProtect, getAnalyticsSummary);

/**
 * @route   GET api/analytics/trending
 * @desc    Get top 5 trending articles from the last 7 days
 * @access  Public
 */
router.get('/trending', getTrendingArticles);


module.exports = router;