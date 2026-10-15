const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for authentication endpoints
 * Limits requests to prevent brute force password guessing
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // limit each IP to 15 login attempts per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes for security.'
  }
});

module.exports = {
  loginRateLimiter
};
