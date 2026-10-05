import rateLimit from 'express-rate-limit';

// Strict rate limiter for login endpoint (max 5 attempts / 15 min per IP)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes for security.'
  },
  skip: (req) => process.env.NODE_ENV === 'test' // Skip rate limiting in automated tests
});

// General API rate limiter for other endpoints
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});
