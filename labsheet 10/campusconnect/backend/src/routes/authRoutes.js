const express = require('express');
const { register, login, refresh } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);

module.exports = router;
