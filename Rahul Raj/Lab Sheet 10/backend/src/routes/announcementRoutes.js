/**
 * Announcement Routes (Task 2 - Real-Time Notifications)
 */

const express = require('express');
const { announcements, nextAnnouncementId } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

function createAnnouncementRouter(io) {
  const router = express.Router();

  // GET /api/announcements
  router.get('/', (req, res) => {
    const list = Array.from(announcements.values()).sort((a, b) => b.id - a.id);
    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  });

  // POST /api/announcements (Admin Only - Task 2)
  router.post('/', authenticate, authorize('ADMIN'), (req, res) => {
    try {
      const { title, message, priority } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const id = nextAnnouncementId();
      const newAnnouncement = {
        id,
        title: title.trim(),
        message: message.trim(),
        priority: priority || 'NORMAL',
        author: req.user.name,
        createdAt: new Date()
      };

      announcements.set(id, newAnnouncement);

      // Task 2: Emit real-time notification to all connected Student sockets
      if (io) {
        io.emit('new-announcement', {
          id: newAnnouncement.id,
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          priority: newAnnouncement.priority,
          author: newAnnouncement.author,
          timestamp: newAnnouncement.createdAt
        });
      }

      res.status(201).json({
        success: true,
        message: 'Announcement posted and broadcast to all connected student sockets',
        data: newAnnouncement
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createAnnouncementRouter;
