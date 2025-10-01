const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUserPreferences,
    updateUserPreference,
    updateUserProfile,
    changeUserPassword
} = require('../controllers/userController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Admin routes
router.get('/', adminProtect, getAllUsers);
router.put('/:id/role', adminProtect, updateUserRole);
router.delete('/:id', adminProtect, deleteUser);

// Protected routes
router.get('/preferences', protect, getUserPreferences);
router.put('/preferences', protect, updateUserPreference);
router.put('/:id/profile', protect, updateUserProfile);
router.put('/:id/password', protect, changeUserPassword);


module.exports = router;
