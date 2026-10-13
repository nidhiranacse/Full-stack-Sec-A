const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', announcementController.getAnnouncements);
router.post('/', authenticate, requireRole('admin'), announcementController.createAnnouncement);

module.exports = router;
