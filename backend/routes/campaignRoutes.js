const express = require('express');
const router = express.Router();
// FIX: Import sendNewsletterCampaign controller.
const {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendNewsletterCampaign
} = require('../controllers/campaignController');
const { adminProtect } = require('../middleware/authMiddleware');

// All campaign routes are admin-protected
router.use(adminProtect);

// FIX: Add route for sending newsletter campaigns.
router.post('/send-newsletter', sendNewsletterCampaign);

router.route('/')
    .get(getCampaigns)
    .post(createCampaign);

router.route('/:id')
    .put(updateCampaign)
    .delete(deleteCampaign);

module.exports = router;