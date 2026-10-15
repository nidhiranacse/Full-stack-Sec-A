const express = require('express');

const {
  authenticate,
  authorize
} = require('../middleware/auth');

const {
  createAnnouncement,
  listAnnouncements
} = require('../controllers/announcementController');

const router = express.Router();

router.get(
  '/',
  authenticate,
  listAnnouncements
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createAnnouncement
);

module.exports = router;