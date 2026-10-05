import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp
} from '../controllers/event.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validations/event.validation.js';

const router = Router();

// All event routes require authentication
router.use(authenticate);

// Publicly accessible to authenticated users (both ADMIN & STUDENT)
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/rsvp', toggleRsvp);

// Admin-only management routes
router.post('/', authorize('ADMIN'), validateRequest(createEventSchema), createEvent);
router.put('/:id', authorize('ADMIN'), validateRequest(updateEventSchema), updateEvent);
router.delete('/:id', authorize('ADMIN'), deleteEvent);

export default router;
