const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user
 * @access  Public
 */
router.post('/login', loginUser);

module.exports = router;
