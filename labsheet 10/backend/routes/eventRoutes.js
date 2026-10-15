const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const eventController = require('../controllers/eventController');

module.exports = (redisClient) => {
  const router = express.Router();
  router.get('/', eventController.getEvents(redisClient));
  router.post('/', authenticate, authorize('ADMIN'), eventController.createEvent(redisClient));
  router.post('/:id/rsvp', authenticate, authorize('STUDENT', 'ADMIN'), eventController.rsvpEvent);
  return router;
};