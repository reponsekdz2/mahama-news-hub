const express = require('express');
const router = express.Router();
const { summarizeArticle, analyzeContent } = require('../controllers/geminiController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

/**
 * @route   POST api/gemini/summarize
 * @desc    Summarize article content using Gemini
 * @access  Protected
 */
router.post('/summarize', protect, summarizeArticle);


/**
 * @route   POST api/gemini/analyze-content
 * @desc    Analyze article content for SEO and suggestions
 * @access  Admin
 */
router.post('/analyze-content', adminProtect, analyzeContent);


module.exports = router;