const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026';

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db.prepare('SELECT id, name, email, role, department, semester, created_at FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
}

// Optional auth for public views that can also identify logged-in users (e.g. checking if already registered)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, department, semester, created_at FROM users WHERE id = ?').get(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
}

module.exports = {
  verifyToken,
  optionalAuth,
  JWT_SECRET
};
