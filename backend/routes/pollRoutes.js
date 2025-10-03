const express = require('express');
const router = express.Router();
const { createOrUpdatePollForArticle, voteOnPoll } = require('../controllers/pollController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router.post('/', adminProtect, createOrUpdatePollForArticle);
router.post('/:pollId/vote', protect, voteOnPoll);

module.exports = router;
