const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Student Dashboard: My registered events, registration history, recommended resources
router.get('/student', verifyToken, requireRole('student'), dashboardController.getStudentDashboard);

// Admin Dashboard: System analytics, total events, total registrations, seat breakdown
router.get('/admin', verifyToken, requireRole('admin'), dashboardController.getAdminDashboard);

module.exports = router;
