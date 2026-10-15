/**
 * Login Rate Limiter Middleware
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 * 
 * Hard Requirement:
 * Allow at most 5 failed login attempts per minute for each email.
 * After that, return 429 with a Retry-After header, even if the correct password is supplied.
 * The counter resets after the one-minute window.
 */

const store = require('../store');

function loginRateLimiter(req, res, next) {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    // If email is missing, proceed to route handler which will validate and reject with 401 or 400
    return next();
  }

  const now = Date.now();
  const recentAttempts = store.getRecentFailedAttempts(email, now);

  if (recentAttempts.length >= 5) {
    const oldestAttempt = recentAttempts[0];
    const remainingMs = (oldestAttempt + 60000) - now;
    const retryAfter = Math.max(1, Math.ceil(remainingMs / 1000));

    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many failed login attempts. Please try again later.',
      retryAfter
    });
  }

  return next();
}

module.exports = {
  loginRateLimiter
};
