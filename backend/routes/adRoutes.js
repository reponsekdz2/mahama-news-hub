const express = require('express');
const router = express.Router();
const {
    getAds,
    getSidebarAds,
    createAd,
    updateAd,
    deleteAd,
    trackAdImpression,
    trackAdClick,
} = require('../controllers/adController');
const { adminProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/sidebar', getSidebarAds);
router.post('/:id/impression', trackAdImpression);
router.post('/:id/click', trackAdClick);

// Admin routes for Ads
router.get('/', adminProtect, getAds);
router.post('/', adminProtect, upload.single('asset'), createAd);
router.put('/:id', adminProtect, upload.single('asset'), updateAd);
router.delete('/:id', adminProtect, deleteAd);

module.exports = router;