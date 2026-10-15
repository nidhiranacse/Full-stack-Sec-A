const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key';
const PORT = process.env.PORT || 3000;

// In-memory user store: { username: hashedPassword }
const users = new Map();

// Handle malformed JSON bodies gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  next(err);
});

// ---------- POST /register ----------
app.post('/register', async (req, res) => {
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

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, hashedPassword);

  return res.status(201).json({ message: 'User registered' });
});

// ---------- POST /login ----------
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const storedHash = users.get(username);
  if (!storedHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, storedHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ token });
});

// ---------- Auth Middleware ----------
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    // Malformed, invalid signature, or expired token
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ---------- GET /profile ----------
app.get('/profile', authenticate, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
