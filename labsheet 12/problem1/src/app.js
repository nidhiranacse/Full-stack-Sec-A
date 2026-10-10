// ─── Express Application Setup ──────────────────────────────────────
// Exports the app so tests can import it without starting the listener.

require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const authenticate = require("./middleware/auth");

const app = express();

// Body parsing
app.use(express.json());

// Public routes
app.use("/auth", authRoutes);

// Protected routes — authenticate middleware runs once here
app.use("/tasks", authenticate, taskRoutes);

// Global error handler (prevents unhandled promise rejections from crashing)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
