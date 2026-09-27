const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createAnnouncementSchema } = require('../validators/schemas');

// Read announcements (Authenticated)
router.get('/', authenticate, announcementController.getAnnouncements);

// Create announcement (Admin only, emits Socket.io event)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);

// Delete announcement (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), announcementController.deleteAnnouncement);

module.exports = router;
