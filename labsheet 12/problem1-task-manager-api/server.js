const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT secret comes from the environment (fallback only for local dev)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const TOKEN_TTL = '15m';
const VALID_STATUS = ['todo', 'doing', 'done'];
const VALID_ROLES = ['user', 'admin'];

const MAX_FAILED = 5;
const WINDOW_MS = 60 * 1000;

// ---------- in-memory stores ----------
const users = new Map();        // email -> { id, email, passwordHash, role }
const tasks = new Map();        // id -> { id, ownerId, title, status }
const failedLogins = new Map(); // email -> [timestamps of failed attempts]

const app = express();
app.use(express.json());

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const normEmail = (e) => e.trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- reusable auth middleware ----------
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
  const token = header.slice(7).trim();
  try {
    // verify() throws on malformed / tampered / expired tokens -> caught, never crashes
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- AUTH ----------
app.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, role = 'user' } = req.body || {};
    if (!isNonEmptyString(email) || !EMAIL_RE.test(email.trim()) ||
        typeof password !== 'string' || password.length < 6 ||
        !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const key = normEmail(email);
    if (users.has(key)) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    // re-check after the await so two parallel registrations cannot both succeed
    if (users.has(key)) return res.status(409).json({ error: 'Email already exists' });

    const user = { id: crypto.randomUUID(), email: key, passwordHash, role };
    users.set(key, user);
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) { next(e); }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!isNonEmptyString(email) || typeof password !== 'string') {
      return res.status(401).json({ error: 'Wrong credentials' });
    }
    const key = normEmail(email);
    const now = Date.now();

    // 1) rate-limit check BEFORE verifying the password
    const recent = (failedLogins.get(key) || []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_FAILED) {
      failedLogins.set(key, recent);
      const retryAfter = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many failed attempts' });
    }

    // 2) verify credentials
    const user = users.get(key);
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!ok) {
      recent.push(Date.now());
      failedLogins.set(key, recent);
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    failedLogins.delete(key); // success clears the counter
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: TOKEN_TTL }
    );
    return res.status(200).json({ token });
  } catch (e) { next(e); }
});

// ---------- TASKS (all routes protected by the middleware) ----------
app.use('/tasks', authenticate);

app.post('/tasks', (req, res) => {
  const { title, status } = req.body || {};
  if (!isNonEmptyString(title) || !VALID_STATUS.includes(status)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const task = { id: crypto.randomUUID(), ownerId: req.user.id, title: title.trim(), status };
  tasks.set(task.id, task);
  return res.status(201).json(task);
});

app.get('/tasks', (req, res) => {
  const { status } = req.query;
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  limit = Math.min(limit, 100);

  // only the caller's tasks (isolation)
  let mine = [...tasks.values()].filter((t) => t.ownerId === req.user.id);
  if (typeof status === 'string' && status) mine = mine.filter((t) => t.status === status);

  const total = mine.length;
  const data = mine.slice((page - 1) * limit, page * limit);
  return res.status(200).json({ data, page, total });
});

// finds task + checks permission; returns the task or sends 404/403
function loadAuthorizedTask(req, res) {
  const task = tasks.get(req.params.id);
  if (!task) { res.status(404).json({ error: 'Task not found' }); return null; }
  if (task.ownerId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return null;
  }
  return task;
}

app.patch('/tasks/:id', (req, res) => {
  const task = loadAuthorizedTask(req, res);
  if (!task) return;
  const { title, status } = req.body || {};
  const hasTitle = title !== undefined;
  const hasStatus = status !== undefined;
  if (!hasTitle && !hasStatus) return res.status(400).json({ error: 'Nothing to update' });
  if (hasTitle && !isNonEmptyString(title)) return res.status(400).json({ error: 'Invalid title' });
  if (hasStatus && !VALID_STATUS.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  if (hasTitle) task.title = title.trim();
  if (hasStatus) task.status = status;
  return res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const task = loadAuthorizedTask(req, res);
  if (!task) return;
  tasks.delete(task.id);
  return res.status(204).send();
});

// ---------- error handling ----------
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// helper so tests can start from a clean state
app.resetState = () => { users.clear(); tasks.clear(); failedLogins.clear(); };

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
