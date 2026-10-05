import { Router } from 'express';
import {
  getResources,
  getResourceMeta,
  uploadResource,
  downloadResource,
  deleteResource
} from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';
import { validate, resourceSchema } from '../middleware/validator.js';

const router = Router();

// Metadata for filter dropdowns (distinct subjects & semesters)
router.get('/meta', getResourceMeta);

// Browse resources with search & pagination
router.get('/', getResources);

// Download file
router.get('/:id/download', downloadResource);

// Admin-only upload resource
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('file'),
  validate(resourceSchema),
  uploadResource
);

// Admin-only delete resource
router.delete('/:id', authenticate, authorize('admin'), deleteResource);

export default router;
