
const express = require('express');
const router = express.Router();
const { getSearchHistory, logSearchQuery } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

// All search history routes are protected
router.use(protect);

router.route('/')
    .get(getSearchHistory)
    .post(logSearchQuery);

module.exports = router;
