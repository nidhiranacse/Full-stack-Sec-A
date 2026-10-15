const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register a new user (Student or Admin)
 */
function register(req, res) {
  try {
    const { name, email, password, role = 'student', department, semester } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const userRole = role === 'admin' ? 'admin' : 'student';

    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password, role, department, semester)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      userRole,
      department || 'Computer Science',
      semester || '6th Sem'
    );

    const newUser = db.prepare('SELECT id, name, email, role, department, semester, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.',
      error: error.message
    });
  }
}

/**
 * Login user with email and password
 */
function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      semester: user.semester,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while logging in.',
      error: error.message
    });
  }
}

/**
 * Get current authenticated user profile
 */
function getProfile(req, res) {
  res.status(200).json({
    success: true,
    data: req.user
  });
}

module.exports = {
  register,
  login,
  getProfile
};
