/**
 * Auth Routes
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 * 
 * POST /auth/register -> 201 Created | 400 Invalid Input | 409 Email Exists
 * POST /auth/login    -> 200 OK | 401 Wrong Credentials | 429 Rate Limited
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const store = require('../store');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Email validation helper
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Basic robust regex for email validation
  return trimmed.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    // 1. Input Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid input: valid email is required' });
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid input: password is required' });
    }

    const assignedRole = role !== undefined ? role : 'user';
    if (assignedRole !== 'user' && assignedRole !== 'admin') {
      return res.status(400).json({ error: 'Invalid input: role must be "user" or "admin"' });
    }

    // 2. Check if email exists
    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Store user
    const newUser = store.createUser({
      email,
      password: hashedPassword,
      role: assignedRole
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /auth/login
// Apply loginRateLimiter first
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Basic input check
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      if (email && typeof email === 'string') {
        store.recordFailedAttempt(email);
      }
      return res.status(401).json({ error: 'Wrong credentials: email and password are required' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      // Record failed attempt for rate limiting
      store.recordFailedAttempt(email);
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed attempt for rate limiting
      store.recordFailedAttempt(email);
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    // Generate JWT token expiring in 15 minutes
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

module.exports = router;
