const express = require('express');
const router = express.Router();
const { getNews, getPersonalizedNews } = require('../controllers/newsController');

// A protected route example would look like this:
// const { protect } = require('../middleware/authMiddleware');
// router.post('/personalized', protect, getPersonalizedNews);

/**
 * @route   GET api/news/:topic
 * @desc    Get news for a specific topic
 * @access  Public
 */
router.get('/:topic', getNews);

/**
 * @route   POST api/news/personalized
 * @desc    Get personalized news for logged-in user
 * @access  Private (example, currently public)
 */
router.post('/personalized', getPersonalizedNews);


module.exports = router;
