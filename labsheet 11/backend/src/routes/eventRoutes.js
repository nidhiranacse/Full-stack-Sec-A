import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees
} from '../controllers/eventController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, eventSchema } from '../middleware/validator.js';

const router = Router();

// Public / optional auth event browsing
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

// Admin-only event management
router.post('/', authenticate, authorize('admin'), validate(eventSchema), createEvent);
router.put('/:id', authenticate, authorize('admin'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);
router.get('/:id/attendees', authenticate, authorize('admin'), getEventAttendees);

// Student-only event registration & cancellation
router.post('/:id/register', authenticate, authorize('student'), registerForEvent);
router.post('/:id/unregister', authenticate, authorize('student'), unregisterFromEvent);

export default router;
