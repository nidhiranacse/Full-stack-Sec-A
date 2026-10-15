// ============================================
// CampusConnect Backend Server
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- API Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/admin', require('./routes/admin'));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'CampusConnect API is running!' });
});

// ---- Serve Frontend for all non-API routes ----
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    }
});

// ---- Error Handling Middleware ----
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    if (err.message && err.message.includes('Only PDF')) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error.' });
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log(`\n🚀 CampusConnect Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend at http://localhost:${PORT}\n`);
});
