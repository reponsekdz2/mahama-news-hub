const express = require('express');
const router = express.Router();
const { getPendingComments, updateCommentStatus } = require('../controllers/moderationController');
const { adminProtect } = require('../middleware/authMiddleware');

// All routes in this file are for admins only.
router.use(adminProtect);

router.get('/comments', getPendingComments);
router.put('/comments/:id', updateCommentStatus);

module.exports = router;
