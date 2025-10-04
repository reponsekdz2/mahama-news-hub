const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings, uploadSiteAsset } = require('../controllers/settingsController');
const { adminProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/site', getSiteSettings);
router.put('/site', adminProtect, updateSiteSettings);
router.post('/site/asset', adminProtect, upload.single('asset'), uploadSiteAsset);


module.exports = router;