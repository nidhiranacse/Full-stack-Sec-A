// ──────────────────────────────────────────────────────────────
// Auth Routes  –  POST /auth/register  &  POST /auth/login
// ──────────────────────────────────────────────────────────────

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { users, emailIndex } = require('../store');
const { loginRateLimiter, recordFailedAttempt, resetAttempts } = require('../middleware/rateLimiter');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// ─── Register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Validate required fields ──
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'name, email, and password must be strings' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // ── Check for duplicate email ──
    const normalizedEmail = email.toLowerCase().trim();
    if (emailIndex.has(normalizedEmail)) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // ── Validate role ──
    const validRoles = ['user', 'admin'];
    const assignedRole = role && validRoles.includes(role) ? role : 'user';

    // ── Hash password & store user ──
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const id = uuidv4();
    const user = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };

    users.set(id, user);
    emailIndex.set(normalizedEmail, id);

    // Return user info (exclude password)
    const { password: _, ...safeUser } = user;
    return res.status(201).json({ message: 'User registered successfully', user: safeUser });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Login ───────────────────────────────────────────────────
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate required fields ──
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Find user ──
    const userId = emailIndex.get(normalizedEmail);
    if (!userId) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users.get(userId);

    // ── Compare password ──
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ── Success: reset rate-limiter & issue JWT ──
    resetAttempts(normalizedEmail);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
