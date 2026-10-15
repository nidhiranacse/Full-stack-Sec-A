/**
 * Authentication Routes (JWT + Bcrypt)
 * Lab Sheet 11 - Core Module: Authentication
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET, authenticateUser } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin } = require('../middleware/validator');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new student or admin user
 * @access  Public
 */
router.post('/signup', validateSignup, (req, res) => {
  const { name, email, password, role = 'student', department, semester } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password, role, department, semester)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      role,
      department || 'Computer Science & Engineering',
      semester || (role === 'admin' ? 'Faculty' : 'Semester 6')
    );

    const userId = Number(result.lastInsertRowid);
    const user = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role,
      department: department || 'Computer Science & Engineering',
      semester: semester || (role === 'admin' ? 'Faculty' : 'Semester 6')
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during user registration',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token (Rate Limited)
 * @access  Public
 */
router.post('/login', loginRateLimiter, validateLogin, (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (JWT)
 */
router.get('/me', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
