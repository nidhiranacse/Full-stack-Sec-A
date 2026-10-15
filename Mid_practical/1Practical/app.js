const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

// In-memory user store
const users = [];

// Helper function to reset users (useful for testing)
function clearUsers() {
  users.length = 0;
}

// POST /register
app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};

  // Check username missing or empty, or password shorter than 6 characters
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

  // Check if username already exists
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Hash password and store user
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  return res.status(201).json({ message: 'User registered' });
});

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token with username payload and 1h expiration
  const token = jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });

  return res.status(200).json({ token });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || !decoded.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
}

// GET /profile
app.get('/profile', authenticateToken, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

module.exports = { app, users, clearUsers, JWT_SECRET };
