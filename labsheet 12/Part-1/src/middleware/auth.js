// ──────────────────────────────────────────────────────────────
// Authentication Middleware  –  verifies JWT on protected routes
// ──────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Reusable auth middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to `req.user`.
 *
 * Returns 401 for missing / malformed / expired tokens
 * without crashing the server.
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Malformed authorization header. Use: Bearer <token>' });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Catch-all – never crash
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware factory: restricts access to specific roles.
 * Must be placed AFTER `authenticate`.
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
