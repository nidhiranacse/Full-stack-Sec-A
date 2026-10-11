// Author: Radha Pandey, CSE - CampusConnect
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { User } = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const { authenticate } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../utils/validators');

const router = express.Router();

// Bonus: rate limit on login - only FAILED attempts count (5 per minute per IP)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.loginRateLimit,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many failed login attempts. Try again in a minute.' }),
});

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const signToken = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpires,
  });

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const errors = validateSignup(req.body);
    if (errors.length) throw new HttpError(400, 'Validation failed', errors);

    const email = req.body.email.trim().toLowerCase();
    if (await User.findOne({ where: { email } })) throw new HttpError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ name: req.body.name.trim(), email, passwordHash, role: 'student' });
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  })
);

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const errors = validateLogin(req.body);
    if (errors.length) throw new HttpError(400, 'Validation failed', errors);

    const user = await User.findOne({ where: { email: req.body.email.trim().toLowerCase() } });
    const ok = user ? await bcrypt.compare(req.body.password, user.passwordHash) : false;
    if (!ok) throw new HttpError(401, 'Invalid email or password');
    res.json({ user: publicUser(user), token: signToken(user) });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new HttpError(401, 'User no longer exists');
    res.json({ user: publicUser(user) });
  })
);

module.exports = router;
