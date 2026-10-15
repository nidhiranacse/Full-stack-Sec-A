/**
 * Authentication Middleware
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 * Reusable JWT verification middleware.
 * Guarantees missing, malformed, or expired tokens return 401 and never crash the server.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'btcs303t_jwt_super_secret_key_2025';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Authentication token is missing' });
    }

    // Extract Bearer token
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader.startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is empty' });
    }

    // Verify token safely
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Covers JsonWebTokenError (malformed), TokenExpiredError, NotBeforeError
        return res.status(401).json({ error: 'Invalid, malformed, or expired token' });
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    // Failsafe: never crash the server on unexpected header format
    return res.status(401).json({ error: 'Authentication verification failed' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
