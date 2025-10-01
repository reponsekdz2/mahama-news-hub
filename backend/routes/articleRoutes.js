const express = require('express');
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    unlikeArticle,
    recordView,
    getCommentsForArticle,
    addCommentToArticle
} = require('../controllers/articleController');
const { protect, adminProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getArticles); 
router.get('/:id', getArticleById);
router.post('/:id/view', recordView);
router.get('/:id/comments', getCommentsForArticle);

// Protected routes (user must be logged in)
router.post('/:id/like', protect, likeArticle);
router.delete('/:id/like', protect, unlikeArticle);
router.post('/:id/comments', protect, addCommentToArticle);

// Admin routes (user must be an admin)
router.post('/', adminProtect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createArticle);
router.put('/:id', adminProtect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateArticle);
router.delete('/:id', adminProtect, deleteArticle);

module.exports = router;
