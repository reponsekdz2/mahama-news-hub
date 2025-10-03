const express = require('express');
const router = express.Router();
const { getAllTags, createTag, deleteTag } = require('../controllers/tagController');
const { adminProtect } = require('../middleware/authMiddleware');

router.get('/', getAllTags);
router.post('/', adminProtect, createTag);
router.delete('/:id', adminProtect, deleteTag);

module.exports = router;
