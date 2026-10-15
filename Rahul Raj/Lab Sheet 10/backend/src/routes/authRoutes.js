/**
 * Authentication Routes (Task 1)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { users, nextUserId } = require('../config/db');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Helper to find user by email
function findUserByEmail(email) {
  for (const user of users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

// Seed initial admin and student
(async () => {
  if (users.size === 0) {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const adminId = nextUserId();
    users.set(adminId, {
      id: adminId,
      name: 'System Administrator',
      email: 'admin@campus.edu',
      passwordHash: adminHash,
      role: 'ADMIN',
      createdAt: new Date()
    });

    const studentHash = await bcrypt.hash('Student@123', 10);
    const studentId = nextUserId();
    users.set(studentId, {
      id: studentId,
      name: 'Rahul Raj',
      email: 'cu24250116@campus.edu',
      passwordHash: studentHash,
      role: 'STUDENT',
      createdAt: new Date()
    });
  }
})();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const assignedRole = (role && role.toUpperCase() === 'ADMIN') ? 'ADMIN' : 'STUDENT';

    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = nextUserId();
    const newUser = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: assignedRole,
      createdAt: new Date()
    };

    users.set(id, newUser);

    const tokens = generateTokens(newUser);

    // Set httpOnly cookie for refresh token (7 days)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login (with rate limiting - Task 5)
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: user not found'
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: incorrect password'
      });
    }

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = users.get(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with refresh token no longer exists'
      });
    }

    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
