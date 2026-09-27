const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createEventSchema, updateEventSchema } = require('../validators/schemas');

// Read endpoints
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Admin-only endpoints
router.post('/', authenticate, authorize('ADMIN'), validate(createEventSchema), eventController.createEvent);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', authenticate, authorize('ADMIN'), eventController.deleteEvent);

// RSVP endpoint (Authenticated students/users)
router.post('/:id/rsvp', authenticate, eventController.toggleRsvp);

module.exports = router;
