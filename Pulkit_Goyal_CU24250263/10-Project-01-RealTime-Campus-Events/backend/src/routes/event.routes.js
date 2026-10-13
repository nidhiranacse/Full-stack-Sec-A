const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', eventController.getEvents);
router.post('/', authenticate, requireRole('admin'), eventController.createEvent);
router.post('/:id/rsvp', authenticate, eventController.rsvpEvent);

module.exports = router;
