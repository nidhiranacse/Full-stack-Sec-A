const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const announcementRoutes = require('./routes/announcement.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);

// Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Project 1: Real-Time Event & Announcement Portal',
    student: {
      name: 'Pulkit Goyal',
      cuid: 'CU24250263',
      roll: 40,
      section: 'A'
    }
  });
});

module.exports = app;
