const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Handle malformed JSON input gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  next();
});

// Secret key for signing and verifying JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_practical_b1';

// In-memory data store for registered users
// Format: [{ username: '...', password: '...' }]
const users = [];

// Helper functions for testing/debugging
app.resetUsers = () => {
  users.length = 0;
};
app.getUsers = () => users;

/**
 * Requirement 1:
 * POST /register with body { username, password }
 * - Success: 201 with { "message": "User registered" }
 * - username missing or empty, or password shorter than 6 characters: 400 with { "error": "Invalid input" }
 * - Username already taken: 409 with { "error": "Username already exists" }
 */
app.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  // Check username missing, empty, or not a string
  const isUsernameInvalid =
    !username || typeof username !== 'string' || username.trim() === '';

  // Check password missing, shorter than 6 chars, or not a string
  const isPasswordInvalid =
    !password || typeof password !== 'string' || password.length < 6;

  if (isUsernameInvalid || isPasswordInvalid) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Check if username already exists
  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Save new user in memory
  users.push({ username, password });
  return res.status(201).json({ message: 'User registered' });
});

/**
 * Requirement 2:
 * POST /login with body { username, password }
 * - Success: 200 with { "token": "<jwt>" }
 *   The token payload must contain username and it expires in 1 hour.
 * - Unknown user or wrong password: 401 with { "error": "Invalid credentials" }
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Find user matching username and password
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token with payload containing username and 1 hour expiration
  const token = jwt.sign(
    { username: user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({ token });
});

/**
 * Requirement 3:
 * GET /profile with header Authorization: Bearer <token>
 * - Valid token: 200 with { "username": "<username>" }
 * - Header missing, token malformed, signature invalid or token expired: 401 with { "error": "Unauthorized" }
 */
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Check if Authorization header is missing or does not start with 'Bearer '
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ username: decoded.username });
  } catch (err) {
    // Covers token malformed, invalid signature, or token expired
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// Export app for test suites
module.exports = app;

// Listen on port if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`JWT Auth API Server running on http://localhost:${PORT}`);
  });
}
