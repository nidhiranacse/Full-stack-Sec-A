/**
 * Security Hardening: Rate Limiter Middleware (Task 5)
 * Enforces maximum 5 attempts per 15 minutes per IP on sensitive routes
 */

const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

module.exports = {
  loginRateLimiter
};
