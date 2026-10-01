// ──────────────────────────────────────────────────────────────
// Rate Limiter Middleware  –  tracks failed login attempts
// ──────────────────────────────────────────────────────────────

/**
 * In-memory store for tracking failed login attempts.
 * Structure:  email → { count, windowStart }
 *
 * Rule: max 5 failed attempts per email per 60-second window.
 * After that, return 429 with a Retry-After header.
 */

const failedAttempts = new Map(); // email → { count, windowStart }

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Call BEFORE validating credentials.
 * If the email has exceeded the limit, respond with 429.
 */
function loginRateLimiter(req, res, next) {
  const email = (req.body.email || '').toLowerCase().trim();

  if (!email) {
    // No email → let validation in the route handler deal with it
    return next();
  }

  const now = Date.now();
  const record = failedAttempts.get(email);

  if (record) {
    // Reset window if it's expired
    if (now - record.windowStart > WINDOW_MS) {
      failedAttempts.delete(email);
      return next();
    }

    if (record.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again later.',
        retryAfterSeconds: retryAfter,
      });
    }
  }

  next();
}

/**
 * Call this after a failed login to increment the counter.
 */
function recordFailedAttempt(email) {
  email = email.toLowerCase().trim();
  const now = Date.now();
  const record = failedAttempts.get(email);

  if (!record || now - record.windowStart > WINDOW_MS) {
    failedAttempts.set(email, { count: 1, windowStart: now });
  } else {
    record.count += 1;
  }
}

/**
 * Call this after a successful login to reset the counter.
 */
function resetAttempts(email) {
  failedAttempts.delete(email.toLowerCase().trim());
}

module.exports = { loginRateLimiter, recordFailedAttempt, resetAttempts, failedAttempts };
