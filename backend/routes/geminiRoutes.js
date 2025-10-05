const express = require('express');
const router = express.Router();
const { summarizeArticle } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST api/gemini/summarize
 * @desc    Summarize article content using Gemini
 * @access  Protected
 */
router.post('/summarize', protect, summarizeArticle);

module.exports = router;