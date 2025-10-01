const express = require('express');
const router = express.Router();
const { 
    handleImproveWriting,
    handleGenerateImageIdea
} = require('../controllers/aiController');
const { adminProtect } = require('../middleware/authMiddleware');

// All routes in this file are protected and only accessible by admins.
router.use(adminProtect);

router.post('/improve-writing', handleImproveWriting);
router.post('/generate-image-idea', handleGenerateImageIdea);

module.exports = router;