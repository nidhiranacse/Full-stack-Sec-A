/**
 * Express Application Setup
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 */

const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const taskRouter = require('./routes/tasks');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Health / Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Secure Task Manager API (BTCS303T Coding Assessment)',
    student: 'Rahul Raj',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login'],
      tasks: ['POST /tasks', 'GET /tasks', 'PATCH /tasks/:id', 'DELETE /tasks/:id']
    }
  });
});

// Mount Routers
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler (ensures no unhandled crashes)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
