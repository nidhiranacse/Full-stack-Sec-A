const express = require('express');
const { body } = require('express-validator');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnouncements); // GET  /api/announcements

router.post(
  '/',
  authorize('ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    validate,
  ],
  createAnnouncement
); // POST /api/announcements

router.delete('/:id', authorize('ADMIN'), deleteAnnouncement); // DELETE /api/announcements/:id

module.exports = router;
