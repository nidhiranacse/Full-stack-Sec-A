const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// In-memory user store: username -> { salt, hash }
const users = new Map();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// ---------- POST /register ----------
app.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof password !== 'string' ||
    password.length < 6
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (users.has(username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  users.set(username, { salt, hash: hashPassword(password, salt) });

  return res.status(201).json({ message: 'User registered' });
});

// ---------- POST /login ----------
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const invalid = () => res.status(401).json({ error: 'Invalid credentials' });

  if (typeof username !== 'string' || typeof password !== 'string') return invalid();

  const user = users.get(username);
  if (!user) return invalid();

  const attempt = Buffer.from(hashPassword(password, user.salt), 'hex');
  const stored = Buffer.from(user.hash, 'hex');
  if (!crypto.timingSafeEqual(attempt, stored)) return invalid();

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ token });
});

// ---------- Auth middleware ----------
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Covers malformed token, bad signature and expiry
    req.user = jwt.verify(parts[1], JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ---------- GET /profile ----------
app.get('/profile', authenticate, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

module.exports = app;
