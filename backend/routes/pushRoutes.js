const express = require('express');
const router = express.Router();
const { subscribe, sendNotification } = require('../controllers/pushController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Protected route for a user to subscribe to notifications
router.post('/subscribe', protect, subscribe);

// Admin-only route to send a test notification
router.post('/send-notification', adminProtect, sendNotification);

module.exports = router;