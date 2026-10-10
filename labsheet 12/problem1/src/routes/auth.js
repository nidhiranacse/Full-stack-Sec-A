// ─── Auth Routes (/auth) ─────────────────────────────────────────────
// POST /auth/register — create a new user with hashed password
// POST /auth/login    — issue a JWT (15-min expiry) with rate limiting

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, loginAttempts, generateUserId } = require("../store");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const SALT_ROUNDS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_FAILED_ATTEMPTS = 5;

// ── POST /auth/register ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already exists
    if (users.has(email)) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Validate role
    const validRoles = ["user", "admin"];
    const userRole = role || "user";
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const id = generateUserId();
    users.set(email, { id, email, passwordHash, role: userRole });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id, email, role: userRole },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: "Wrong credentials" });
    }

    // ── Rate-limit check ────────────────────────────────────────────
    const now = Date.now();
    let attempts = loginAttempts.get(email) || [];

    // Keep only attempts within the last minute
    attempts = attempts.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    loginAttempts.set(email, attempts);

    if (attempts.length >= MAX_FAILED_ATTEMPTS) {
      const oldestInWindow = attempts[0];
      const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({ error: "Too many failed login attempts. Try again later." });
    }

    // ── Credential check ────────────────────────────────────────────
    const user = users.get(email);
    if (!user) {
      attempts.push(now);
      loginAttempts.set(email, attempts);
      return res.status(401).json({ error: "Wrong credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      attempts.push(now);
      loginAttempts.set(email, attempts);
      return res.status(401).json({ error: "Wrong credentials" });
    }

    // Successful login — reset the counter
    loginAttempts.delete(email);

    // Issue token (15 min)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
