const express = require('express');
const router = express.Router();
const {
    getAllAds,
    createAd,
    updateAd,
    deleteAd,
    recordImpression,
    recordClick
} = require('../controllers/adController');
const { adminProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public tracking routes
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Admin routes
router.get('/', adminProtect, getAllAds);
router.post('/', adminProtect, upload.single('image'), createAd);
router.put('/:id', adminProtect, upload.single('image'), updateAd);
router.delete('/:id', adminProtect, deleteAd);

module.exports = router;
