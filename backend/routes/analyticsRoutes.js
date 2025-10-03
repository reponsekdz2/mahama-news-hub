const express = require('express');
const router = express.Router();
const { getAdvancedAnalytics, getTrendingArticles } = require('../controllers/analyticsController');
const { adminProtect } = require('../middleware/authMiddleware');

/**
 * @route   GET api/analytics/advanced
 * @desc    Get a summary of advanced site analytics with a date range
 * @access  Admin
 */
router.get('/advanced', adminProtect, getAdvancedAnalytics);

/**
 * @route   GET api/analytics/trending
 * @desc    Get top 5 trending articles from the last 7 days
 * @access  Public
 */
router.get('/trending', getTrendingArticles);


module.exports = router;