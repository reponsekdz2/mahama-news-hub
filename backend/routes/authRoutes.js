const express = require('express');
const router = express.Router();
const { loginUser, registerUser, googleSignIn } = require('../controllers/authController');

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

/**
 * @route   POST api/auth/google-signin
 * @desc    Authenticate or register user via Google
 * @access  Public
 */
router.post('/google-signin', googleSignIn);


module.exports = router;