const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validateEvent } = require('../middleware/validate');

// Public / Authenticated: Get events with search, filter, pagination
router.get('/', optionalAuth, eventController.getAllEvents);

// Get event by ID
router.get('/:id', optionalAuth, eventController.getEventById);

// Admin Only: Create new event
router.post('/', verifyToken, requireRole('admin'), validateEvent, eventController.createEvent);

// Admin Only: Update existing event
router.put('/:id', verifyToken, requireRole('admin'), validateEvent, eventController.updateEvent);

// Admin Only: Delete event
router.delete('/:id', verifyToken, requireRole('admin'), eventController.deleteEvent);

// Admin Only: View list of registered students for an event
router.get('/:id/registrations', verifyToken, requireRole('admin'), eventController.getEventRegistrations);

// Student Only: Register for event
router.post('/:id/register', verifyToken, requireRole('student'), eventController.registerForEvent);

// Student Only: Cancel registration
router.post('/:id/unregister', verifyToken, requireRole('student'), eventController.unregisterFromEvent);

module.exports = router;
