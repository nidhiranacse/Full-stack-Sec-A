const rateLimit = require("express-rate-limit");

// Max 5 login attempts per 15 minutes per IP (Task 5).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
});

module.exports = { loginLimiter };
