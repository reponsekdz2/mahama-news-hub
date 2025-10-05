const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateMyProfile,
    deleteMyAccount,
    getUserPreferences,
    updateUserPreferences,
    getReadingHistory,
    clearReadingHistory,
    subscribeToNewsletter,
    getNotifications,
    markNotificationsAsRead,
    updateUserSubscription,
} = require('../controllers/userController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// --- Public Routes ---
// This route is public so guests can subscribe from the footer
router.post('/subscribe-newsletter', subscribeToNewsletter);

// --- Admin Routes ---
router.get('/', adminProtect, getAllUsers);
router.put('/:id/role', adminProtect, updateUserRole);
router.put('/:id/subscription', adminProtect, updateUserSubscription); // New route
router.delete('/:id', adminProtect, deleteUser);

// --- Protected User Routes (for "me") ---
router.get('/me/preferences', protect, getUserPreferences);
router.put('/me/preferences', protect, updateUserPreferences);
router.put('/me', protect, updateMyProfile);
router.delete('/me', protect, deleteMyAccount);

router.get('/me/history', protect, getReadingHistory);
router.delete('/me/history', protect, clearReadingHistory);

router.get('/me/notifications', protect, getNotifications);
router.post('/me/notifications/mark-as-read', protect, markNotificationsAsRead);


module.exports = router;