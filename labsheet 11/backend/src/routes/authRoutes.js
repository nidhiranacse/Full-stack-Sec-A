import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validate, registerSchema, loginSchema } from '../middleware/validator.js';

const router = Router();

// Registration
router.post('/register', validate(registerSchema), register);

// Login (with rate limiting bonus)
router.post('/login', loginLimiter, validate(loginSchema), login);

// Current user profile
router.get('/me', authenticate, getMe);

export default router;
