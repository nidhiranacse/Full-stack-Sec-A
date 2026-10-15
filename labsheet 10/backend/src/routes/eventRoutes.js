const express = require('express');
const { getEvents, createEvent, rsvpEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getEvents);
router.post('/', authorize('ADMIN'), createEvent);
router.post('/:id/rsvp', authorize('STUDENT'), rsvpEvent);

module.exports = router;
