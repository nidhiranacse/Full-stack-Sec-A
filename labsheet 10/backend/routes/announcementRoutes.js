const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const announcementController = require('../controllers/announcementController');

module.exports = (io) => {
  const router = express.Router();
  router.get('/', authenticate, announcementController.getAnnouncements);
  router.post('/', authenticate, authorize('ADMIN'), announcementController.createAnnouncement(io));
  return router;
};