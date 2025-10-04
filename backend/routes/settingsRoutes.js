const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings } = require('../controllers/settingsController');
const { adminProtect } = require('../middleware/authMiddleware');

router.get('/site', getSiteSettings);
router.put('/site', adminProtect, updateSiteSettings);

module.exports = router;
