const express = require('express');
const router = express.Router();
const { 
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle
} = require('../controllers/articleController');
const { adminProtect } = require('../middleware/authMiddleware');

// @route   GET api/articles
// @desc    Get all articles (public)
router.get('/', getArticles);

// @route   POST api/articles
// @desc    Create a new article (admin only)
router.post('/', adminProtect, createArticle);

// @route   PUT api/articles/:id
// @desc    Update an article (admin only)
router.put('/:id', adminProtect, updateArticle);

// @route   DELETE api/articles/:id
// @desc    Delete an article (admin only)
router.delete('/:id', adminProtect, deleteArticle);


module.exports = router;
