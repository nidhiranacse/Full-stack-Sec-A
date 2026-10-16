const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// In-memory users
const users = [];

// Login attempts:
// email -> { count, firstAttempt }
const loginAttempts = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 1;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    const normalizedEmail = normalizeEmail(email);

    if (!validEmail(normalizedEmail) || !validPassword(password)) {
      return res.status(400).json({
        error: "Invalid email or password"
      });
    }

    if (role !== undefined && role !== "user" && role !== "admin") {
      return res.status(400).json({
        error: "Role must be user or admin"
      });
    }

    const existingUser = users.find(
      user => user.email === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: users.length + 1,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user"
    };

    users.push(user);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = normalizeEmail(email);

    if (!validEmail(normalizedEmail) || typeof password !== "string") {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const now = Date.now();

    let attempt = loginAttempts.get(normalizedEmail);

    // Reset window after one minute
    if (attempt && now - attempt.firstAttempt >= WINDOW_MS) {
      loginAttempts.delete(normalizedEmail);
      attempt = null;
    }

    // Rate-limit BEFORE checking password.
    // This ensures the correct password also gets 429
    // while the user is rate limited.
    if (attempt && attempt.count >= MAX_FAILED_ATTEMPTS) {
      const retryAfter = Math.max(
        1,
        Math.ceil((WINDOW_MS - (now - attempt.firstAttempt)) / 1000)
      );

      res.set("Retry-After", String(retryAfter));

      return res.status(429).json({
        error: "Too many failed login attempts",
        retryAfter
      });
    }

    const user = users.find(
      item => item.email === normalizedEmail
    );

    const passwordCorrect = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordCorrect) {
      if (!attempt) {
        attempt = {
          count: 0,
          firstAttempt: now
        };
      }

      attempt.count += 1;

      loginAttempts.set(normalizedEmail, attempt);

      // If this attempt became the 5th failed attempt,
      // next request gets 429.
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    // Successful login
    loginAttempts.delete(normalizedEmail);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );

    return res.status(200).json({
      token
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

module.exports = router;

// Exporting this is useful for tests if needed.
module.exports.users = users;
module.exports.loginAttempts = loginAttempts;
