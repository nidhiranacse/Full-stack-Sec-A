// server.js — Express Server (JSON file database, no MongoDB)
require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const studentRoutes  = require('./routes/studentRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/students', studentRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Record Management System API',
    version: '1.0.0',
    database: 'JSON File (data/students.json)',
    endpoints: {
      'GET    /students':     'Get all students',
      'POST   /students':     'Add a new student',
      'GET    /students/:id': 'Get one student',
      'PUT    /students/:id': 'Update student',
      'DELETE /students/:id': 'Delete student',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🎓  Student Record Management System');
  console.log('  ─────────────────────────────────────');
  console.log(`  🚀  Server   : http://localhost:${PORT}`);
  console.log(`  💾  Database : JSON file (backend/data/students.json)`);
  console.log('  ✅  Ready    : No MongoDB required!');
  console.log('');
});
