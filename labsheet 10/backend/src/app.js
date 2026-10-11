const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const Announcement = require('./models/Announcement');
const { authenticate, authorize } = require('./middleware/authMiddleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.post('/api/announcements', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.create({ title, message, createdBy: req.user.id });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new-announcement', announcement);
    }
    
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;
