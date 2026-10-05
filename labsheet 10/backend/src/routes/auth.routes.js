import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', loginRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
