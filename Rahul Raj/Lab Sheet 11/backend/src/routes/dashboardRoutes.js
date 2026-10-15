/**
 * Dashboard & Analytics Routes
 * Lab Sheet 11 - Core Module: Dashboard (Student & Admin)
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateUser, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/student
 * @desc    Student dashboard analytics (registered events, history, recommended resources)
 * @access  Private (Student)
 */
router.get('/student', authenticateUser, requireRole('student'), (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Enrolled Events
    const registeredSql = `
      SELECT 
        e.*,
        r.registeredAt,
        (e.maxSeats - (SELECT COUNT(*) FROM registrations WHERE eventId = e.id)) as seatsLeft
      FROM registrations r
      JOIN events e ON r.eventId = e.id
      WHERE r.userId = ?
      ORDER BY e.date ASC
    `;
    const registeredEvents = db.prepare(registeredSql).all(userId);

    // 2. Split into upcoming vs past
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = registeredEvents.filter(ev => ev.date >= today);
    const pastEvents = registeredEvents.filter(ev => ev.date < today);

    // 3. Department & Semester Recommended Resources
    const recommendedResources = db.prepare(`
      SELECT * FROM resources 
      WHERE semester = ? OR subject LIKE '%Full Stack%'
      ORDER BY downloadCount DESC 
      LIMIT 4
    `).all(req.user.semester || 'Semester 6');

    // 4. Student Metrics
    const stats = {
      totalRegistered: registeredEvents.length,
      upcomingCount: upcomingEvents.length,
      completedCount: pastEvents.length,
      resourcesAvailable: db.prepare('SELECT COUNT(*) as count FROM resources').get().count
    };

    return res.status(200).json({
      success: true,
      user: req.user,
      stats,
      upcomingEvents,
      pastEvents,
      registrationHistory: registeredEvents,
      recommendedResources
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load student dashboard', error: err.message });
  }
});

/**
 * @route   GET /api/dashboard/admin
 * @desc    Admin dashboard analytics (total events, total registrations, category breakdown)
 * @access  Private (Admin)
 */
router.get('/admin', authenticateUser, requireRole('admin'), (req, res) => {
  try {
    // 1. High-level aggregates
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
    const totalResources = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalCapacity = db.prepare('SELECT SUM(maxSeats) as sum FROM events').get().sum || 1;
    const totalDownloads = db.prepare('SELECT SUM(downloadCount) as sum FROM resources').get().sum || 0;

    const occupancyRate = Math.round((totalRegistrations / totalCapacity) * 100);

    // 2. Category Distribution
    const categoryStats = db.prepare(`
      SELECT 
        e.category,
        COUNT(DISTINCT e.id) as eventCount,
        COUNT(r.id) as registrationCount
      FROM events e
      LEFT JOIN registrations r ON e.id = r.eventId
      GROUP BY e.category
    `).all();

    // 3. Top in-demand events
    const topEvents = db.prepare(`
      SELECT 
        e.id, e.title, e.category, e.date, e.maxSeats,
        COUNT(r.id) as registeredCount,
        ROUND((CAST(COUNT(r.id) AS REAL) / e.maxSeats) * 100, 1) as fillPercentage
      FROM events e
      LEFT JOIN registrations r ON e.id = r.eventId
      GROUP BY e.id
      ORDER BY registeredCount DESC
      LIMIT 5
    `).all();

    // 4. Recent Student Registrations Activity
    const recentActivity = db.prepare(`
      SELECT 
        r.id, r.registeredAt,
        u.name as studentName, u.email as studentEmail,
        e.title as eventTitle, e.category as eventCategory
      FROM registrations r
      JOIN users u ON r.userId = u.id
      JOIN events e ON r.eventId = e.id
      ORDER BY r.registeredAt DESC
      LIMIT 8
    `).all();

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalRegistrations,
        totalResources,
        totalStudents,
        totalDownloads,
        occupancyRate: Math.min(100, occupancyRate)
      },
      categoryStats,
      topEvents,
      recentActivity
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard', error: err.message });
  }
});

module.exports = router;
