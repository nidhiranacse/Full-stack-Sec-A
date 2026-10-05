import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createAnnouncementSchema } from '../validations/announcement.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', authorize('ADMIN'), validateRequest(createAnnouncementSchema), createAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

export default router;
