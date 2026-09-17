const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  getMyRsvps,
} = require('../controllers/eventsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const eventBody = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid ISO-8601 date required'),
  body('location').optional().trim(),
  body('description').optional().trim(),
  validate,
];

// All event routes require authentication
router.use(authenticate);

router.get('/',          getEvents);          // GET  /api/events?search=&page=&limit=
router.get('/my-rsvps', getMyRsvps);         // GET  /api/events/my-rsvps
router.get('/:id',       getEvent);           // GET  /api/events/:id

router.post('/',         authorize('ADMIN'), eventBody, createEvent);  // POST   /api/events
router.put('/:id',       authorize('ADMIN'), eventBody, updateEvent);  // PUT    /api/events/:id
router.delete('/:id',    authorize('ADMIN'), deleteEvent);             // DELETE /api/events/:id

router.post('/:id/rsvp', rsvpEvent);          // POST /api/events/:id/rsvp  (toggle)

module.exports = router;
