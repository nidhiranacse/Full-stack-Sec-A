const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/db');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} = require('../config/auth');

// ── Helpers ────────────────────────────────────────────────────────────────

function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const accessToken  = jwt.sign(payload, ACCESS_TOKEN_SECRET,  { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

function safeUser(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

// ── Controllers ────────────────────────────────────────────────────────────

async function register(req, res) {
  try {
    const { name, email, password, role = 'STUDENT' } = req.body;
    const db = getDb();

    const existing = db.get('users').find({ email }).value();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const id     = uuidv4();
    const now    = new Date().toISOString();

    const user = { id, name, email, password: hashed, role, refreshToken: null, createdAt: now };
    db.get('users').push(user).write();

    const { accessToken, refreshToken } = generateTokens(user);
    db.get('users').find({ id }).assign({ refreshToken }).write();

    res.status(201).json({ user: safeUser(user), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const db   = getDb();
    const user = db.get('users').find({ email }).value();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    db.get('users').find({ id: user.id }).assign({ refreshToken }).write();

    res.json({ user: safeUser(user), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const db      = getDb();
    const user    = db.get('users').find({ id: decoded.id, refreshToken }).value();
    if (!user) return res.status(403).json({ error: 'Invalid refresh token' });

    const tokens = generateTokens(user);
    db.get('users').find({ id: user.id }).assign({ refreshToken: tokens.refreshToken }).write();

    res.json(tokens);
  } catch {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}

function logout(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const db   = getDb();
    const user = db.get('users').find({ refreshToken }).value();
    if (user) db.get('users').find({ id: user.id }).assign({ refreshToken: null }).write();
  }
  res.json({ message: 'Logged out successfully' });
}

module.exports = { register, login, refreshToken, logout };
