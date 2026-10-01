// ──────────────────────────────────────────────────────────────
// Express Application  –  exported for automated testing
// ──────────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// ─── Global middleware ───────────────────────────────────────
app.use(express.json());

// ─── Health check ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Task Manager API is running',
    version: '1.0.0',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      tasks: 'GET|POST /tasks',
      taskById: 'GET|PUT|DELETE /tasks/:id',
    },
  });
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// ─── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for automated tests (e.g. supertest)
module.exports = app;
