const express = require('express');
const router = express.Router();
const { getSubscriptionStatus, createSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/status', getSubscriptionStatus);
router.post('/', createSubscription);

module.exports = router;