const express = require('express');
const router = express.Router();
const { 
    handleTranslation,
    handleSummarization,
    handleAnswerQuestion,
    handleGenerateArticle,
    handlePersonalizedNews
} = require('../controllers/geminiController');

const { protect, adminProtect } = require('../middleware/authMiddleware');

router.post('/translate', protect, handleTranslation);
router.post('/summarize', protect, handleSummarization);
router.post('/answer', protect, handleAnswerQuestion);
router.post('/generate-article', adminProtect, handleGenerateArticle);
router.post('/personalized-news', protect, handlePersonalizedNews);

module.exports = router;