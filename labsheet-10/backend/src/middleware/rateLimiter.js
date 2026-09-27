const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 5, // max 5 attempts / 15 min per IP in production/dev
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  statusCode: 429,
});

module.exports = {
  loginRateLimiter,
};
