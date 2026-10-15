// Author: Radha Pandey, CSE - CampusConnect
const jwt = require('jsonwebtoken');
const config = require('../config');
const { HttpError } = require('./errors');

// Verifies the Bearer token and attaches req.user = { id, role, name }
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }
  try {
    const p = jwt.verify(header.slice(7).trim(), config.jwtSecret, { algorithms: ['HS256'] });
    req.user = { id: p.id, role: p.role, name: p.name };
    return next();
  } catch (e) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

// Role-based access control: authorize('admin'), authorize('student'), ...
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new HttpError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action'));
  }
  return next();
};

module.exports = { authenticate, authorize };
