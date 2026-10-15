/**
 * CampusConnect Main Express Server
 * Lab Sheet 11 - Full Stack Event & Resource Management Portal
 * Student: Rahul Raj (cu24250116)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, uploadsDir } = require('./src/config/db');

// Route handlers
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const resourceRoutes = require('./src/routes/resourceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const benchmarkRoutes = require('./src/routes/benchmarkRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database schema and initial records
initDatabase();

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/benchmark', benchmarkRoutes);

// Health & System Info Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    project: 'CampusConnect - Student Event & Resource Management Portal',
    labSheet: 'Lab Sheet 11 (Practice Question)',
    student: 'Rahul Raj (cu24250116)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modules: ['Authentication (JWT+Bcrypt)', 'Events (CRUD+RSVP)', 'Resources (PDF/DOCX)', 'Dashboards', 'Search/Filter/Pagination', 'RBAC & Rate Limiting']
  });
});

// Serve frontend build if available (unified full-stack serving)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found. Ensure frontend is compiled or visit /api/health.'
      });
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    status
  });
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CampusConnect Server running on http://localhost:${PORT}`);
    console.log(`📚 Lab Sheet 11: Full Stack Event & Resource Portal`);
    console.log(`👤 Student: Rahul Raj (cu24250116) - Sec-A`);
    console.log(`====================================================`);
  });
}

module.exports = app;
