const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validate');

// User Registration
router.post('/register', validateRegister, authController.register);

// User Login (Protected by rate limiting bonus challenge)
router.post('/login', loginRateLimiter, validateLogin, authController.login);

// Current User Profile
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
