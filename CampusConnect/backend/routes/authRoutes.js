const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { rateLimiter } = require("../middleware/rateLimiter");

// Register new user (student or admin)
router.post("/register", register);

// Login with rate limiting (bonus challenge: 10 attempts per 15 mins)
router.post("/login", rateLimiter(15 * 60 * 1000, 10), login);

// Get current profile
router.get("/me", protect, getMe);

module.exports = router;
