require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulkit_studentDB';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/students', studentRoutes);

// Root Healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Student Management REST API',
    author: {
      name: 'Pulkit Goyal',
      cuid: 'CU24250263',
      roll: 40,
      section: 'A'
    }
  });
});

// Database Connection & Server Initiation
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ Successfully connected to MongoDB database.');
    app.listen(PORT, () => {
      console.log(`✓ Student API Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning (falling back for standalone mock):', err.message);
    // Still bind server so demo endpoints can be inspected
    app.listen(PORT, () => {
      console.log(`✓ Student API Server running on port ${PORT} (Database Offline mode)`);
    });
  });
