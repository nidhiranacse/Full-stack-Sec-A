require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';
if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET env var not set, using dev secret');

const STATUSES = ['todo', 'doing', 'done'];
const ROLES = ['user', 'admin'];
const WINDOW_MS = 60 * 1000;
const MAX_FAILS = 5;

const app = express();
app.use(express.json());

// ---- in-memory stores ----
const users = new Map();          // email -> {id, email, passwordHash, role}
const tasks = new Map();          // id -> {id, ownerId, title, status}
const failedLogins = new Map();   // email -> [timestamps of failed attempts]

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---- reusable auth middleware ----
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  try {
    const payload = jwt.verify(header.slice(7).trim(), JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---- helper: recent failed attempts (prunes old ones) ----
function recentFails(email) {
  const now = Date.now();
  const list = (failedLogins.get(email) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length) failedLogins.set(email, list); else failedLogins.delete(email);
  return list;
}

// ---- auth routes ----
app.post('/auth/register', async (req, res) => {
  const { email, password, role = 'user' } = req.body || {};
  if (!isEmail(email) || typeof password !== 'string' || password.length < 6 || !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const key = email.toLowerCase();
  if (users.has(key)) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  if (users.has(key)) return res.status(409).json({ error: 'Email already exists' }); // race guard
  const user = { id: crypto.randomUUID(), email: key, passwordHash, role };
  users.set(key, user);
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!isEmail(email) || typeof password !== 'string') {
    return res.status(401).json({ error: 'Wrong credentials' });
  }
  const key = email.toLowerCase();

  // Check the limit BEFORE verifying the password
  const fails = recentFails(key);
  if (fails.length >= MAX_FAILS) {
    const retryAfter = Math.max(1, Math.ceil((fails[0] + WINDOW_MS - Date.now()) / 1000));
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many failed attempts' });
  }

  const user = users.get(key);
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    fails.push(Date.now());
    failedLogins.set(key, fails);
    return res.status(401).json({ error: 'Wrong credentials' });
  }

  failedLogins.delete(key);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  res.status(200).json({ token });
});

// ---- task routes ----
app.post('/tasks', auth, (req, res) => {
  const { title, status } = req.body || {};
  if (!isNonEmptyString(title) || !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const task = { id: crypto.randomUUID(), ownerId: req.user.id, title: title.trim(), status };
  tasks.set(task.id, task);
  res.status(201).json(task);
});

app.get('/tasks', auth, (req, res) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (!(page >= 1)) page = 1;
  if (!(limit >= 1)) limit = 10;
  const { status } = req.query;

  let mine = [...tasks.values()].filter((t) => t.ownerId === req.user.id);
  if (typeof status === 'string' && STATUSES.includes(status)) mine = mine.filter((t) => t.status === status);

  const start = (page - 1) * limit;
  res.status(200).json({ data: mine.slice(start, start + limit), page, total: mine.length });
});

// loads task + enforces owner-or-admin rule (reused by PATCH and DELETE)
function loadOwnedTask(req, res, next) {
  const task = tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.task = task;
  next();
}

app.patch('/tasks/:id', auth, loadOwnedTask, (req, res) => {
  const body = req.body || {};
  const hasTitle = 'title' in body;
  const hasStatus = 'status' in body;
  if (!hasTitle && !hasStatus) return res.status(400).json({ error: 'Nothing to update' });
  if (hasTitle && !isNonEmptyString(body.title)) return res.status(400).json({ error: 'Invalid title' });
  if (hasStatus && !STATUSES.includes(body.status)) return res.status(400).json({ error: 'Invalid status' });
  if (hasTitle) req.task.title = body.title.trim();
  if (hasStatus) req.task.status = body.status;
  res.status(200).json(req.task);
});

app.delete('/tasks/:id', auth, loadOwnedTask, (req, res) => {
  tasks.delete(req.task.id);
  res.status(204).end();
});

// ---- error handling: bad JSON etc. must never crash the server ----
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
