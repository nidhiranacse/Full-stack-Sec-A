const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { users, createUserId } = require("../data/store");

const router = express.Router();

const failedLoginAttempts = new Map();

router.post("/register", async (req, res) => {
  try {
    const { email, password, role = "user" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Role must be user or admin",
      });
    }

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: createUserId(),
      email: email.toLowerCase(),
      passwordHash,
      role,
    };

    users.push(user);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const now = Date.now();
    const windowMs = 60 * 1000;

    const attemptData = failedLoginAttempts.get(normalizedEmail);

    // Check rate limit BEFORE verifying password
    if (attemptData) {
      const elapsed = now - attemptData.firstAttemptAt;

      if (elapsed < windowMs && attemptData.count >= 5) {
        const retryAfterSeconds = Math.ceil(
          (windowMs - elapsed) / 1000
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          error: "Too many failed login attempts",
        });
      }

      // Reset expired window
      if (elapsed >= windowMs) {
        failedLoginAttempts.delete(normalizedEmail);
      }
    }

    const user = users.find(
      (item) => item.email === normalizedEmail
    );

    const passwordValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordValid) {
      const currentAttempt =
        failedLoginAttempts.get(normalizedEmail);

      if (!currentAttempt) {
        failedLoginAttempts.set(normalizedEmail, {
          count: 1,
          firstAttemptAt: now,
        });
      } else {
        currentAttempt.count += 1;
      }

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Successful login resets failed attempts
    failedLoginAttempts.delete(normalizedEmail);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;