const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    assessment: 'Lab Sheet 12 Problem 1 (Express JWT Tasks)',
    student: 'Pulkit Goyal (CU24250263)'
  });
});

module.exports = app;
