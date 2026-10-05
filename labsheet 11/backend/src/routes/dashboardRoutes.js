import { Router } from 'express';
import { getStudentDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

// Student dashboard
router.get('/student', authenticate, authorize('student'), getStudentDashboard);

// Admin dashboard analytics
router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);

export default router;
