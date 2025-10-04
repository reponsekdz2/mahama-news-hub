const express = require('express');
const router = express.Router();
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

router.post('/send-newsletter', sendNewsletterCampaign);

router.route('/')
    .get(getCampaigns)
    .post(createCampaign);

router.route('/:id')
    .put(updateCampaign)
    .delete(deleteCampaign);

module.exports = router;