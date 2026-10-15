const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'practical_b1_jwt_super_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend UI at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-memory user store: [{ username: string, passwordHash: string }]
const users = [];

/**
 * POST /register
 * Body: { username, password }
 * - 400 { "error": "Invalid input" } if username missing/empty or password < 6 chars
 * - 409 { "error": "Username already exists" } if user already registered
 * - 201 { "message": "User registered" } upon success
 */
app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};

  // Validation: username missing or empty, or password shorter than 6 characters
  if (
    !username ||
    typeof username !== 'string' ||
    username.trim() === '' ||
    !password ||
    typeof password !== 'string' ||
    password.length < 6
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const normalizedUsername = username.trim();

  // Check if username already exists (case-insensitive comparison for robust UX)
  const existingUser = users.find(
    (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  try {
    // Hash password with salt rounds = 10
    const passwordHash = await bcrypt.hash(password, 10);
    users.push({
      username: normalizedUsername,
      passwordHash,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /login
 * Body: { username, password }
 * - 401 { "error": "Invalid credentials" } if user unknown or password wrong
 * - 200 { "token": "<jwt>" } upon success (expires in 1h, payload contains username)
 */
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const normalizedUsername = username.trim();
  const user = users.find(
    (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token: payload contains username, expires in 1 hour
    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Authentication Middleware for protected routes
 * Validates header 'Authorization: Bearer <token>'
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Token is valid, attach decoded payload to request
    req.user = decoded;
    next();
  });
}

/**
 * GET /profile
 * Header: Authorization: Bearer <token>
 * - 401 { "error": "Unauthorized" } if header missing, malformed, signature invalid, or expired
 * - 200 { "username": "<username>" } if valid
 */
app.get('/profile', authenticateToken, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

// Helper endpoint to check API status & registered user count (useful for evaluation/testing)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    aim: 'Practical B1: JWT Authentication API',
    totalUsers: users.length,
    users: users.map((u) => u.username)
  });
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
