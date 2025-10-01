const express = require('express');
const router = express.Router();
const {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addArticleToCollection,
    removeArticleFromCollection
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(protect);

router.route('/')
    .get(getCollections)
    .post(createCollection);

router.route('/:id')
    .put(updateCollection)
    .delete(deleteCollection);

router.post('/:id/articles', addArticleToCollection);
router.delete('/:id/articles/:articleId', removeArticleFromCollection);

module.exports = router;