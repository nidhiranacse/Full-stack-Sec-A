const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { ACCESS_SECRET } = require('../middleware/auth');

const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const SALT_ROUNDS = 10;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'STUDENT']).optional(),
});
const loginSchema = z.object({ email: z.string().email('Invalid email address'), password: z.string().min(1, 'Password is required') });

const signAccess = (u) => jwt.sign({ id: u._id, role: u.role, name: u.name }, ACCESS_SECRET(), { expiresIn: '15m' });
const signRefresh = (u) => jwt.sign({ id: u._id }, REFRESH_SECRET(), { expiresIn: '7d' });
const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' };
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// max 5 login attempts / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: Number(process.env.LOGIN_MAX || 5),
  standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again after 15 minutes.' },
});

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role: role || 'STUDENT' });
  res.status(201).json({ message: 'Registered successfully', user: publicUser(user) });
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  res.cookie('refreshToken', signRefresh(user), cookieOpts);
  res.json({ accessToken: signAccess(user), user: publicUser(user) });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const { id } = jwt.verify(token, REFRESH_SECRET());
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ accessToken: signAccess(user), user: publicUser(user) });
  } catch (e) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => { res.clearCookie('refreshToken', { path: '/api/auth' }); res.json({ message: 'Logged out' }); });
module.exports = router;
