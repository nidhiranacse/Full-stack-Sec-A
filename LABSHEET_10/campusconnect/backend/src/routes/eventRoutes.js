const express = require('express');

const {
  authenticate,
  authorize
} = require('../middleware/auth');

const {
  listEvents,
  createEvent,
  rsvpToEvent
} = require('../controllers/eventController');

const { cacheEvents } = require('../middleware/cache');

const router = express.Router();

router.get(
  '/',
  authenticate,
  cacheEvents,
  listEvents
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createEvent
);

router.post(
  '/:id/rsvp',
  authenticate,
  authorize('STUDENT'),
  rsvpToEvent
);

module.exports = router;