const express = require('express');
const router = express.Router();
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { adminProtect } = require('../middleware/authMiddleware');

/**
 * @route   GET api/analytics
 * @desc    Get a summary of site analytics
 * @access  Admin
 */
router.get('/', adminProtect, getAnalyticsSummary);

module.exports = router;