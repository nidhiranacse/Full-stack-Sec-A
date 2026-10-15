// ============================================
// Admin Routes - Dashboard Statistics
// ============================================
const express = require('express');
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/admin/stats ----
// Get dashboard statistics (Admin only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [totalEvents] = await db.query('SELECT COUNT(*) as count FROM events');
        const [totalStudents] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const [totalRegistrations] = await db.query('SELECT COUNT(*) as count FROM event_registrations');
        const [totalResources] = await db.query('SELECT COUNT(*) as count FROM resources');
        const [upcomingEvents] = await db.query('SELECT COUNT(*) as count FROM events WHERE event_date >= CURDATE()');

        // Events by category
        const [categoryStats] = await db.query(
            'SELECT category, COUNT(*) as count FROM events GROUP BY category ORDER BY count DESC'
        );

        // Recent registrations
        const [recentRegistrations] = await db.query(
            `SELECT er.registered_at, u.name as student_name, e.title as event_title 
             FROM event_registrations er 
             JOIN users u ON er.user_id = u.id 
             JOIN events e ON er.event_id = e.id 
             ORDER BY er.registered_at DESC LIMIT 10`
        );

        res.json({
            stats: {
                totalEvents: totalEvents[0].count,
                totalStudents: totalStudents[0].count,
                totalRegistrations: totalRegistrations[0].count,
                totalResources: totalResources[0].count,
                upcomingEvents: upcomingEvents[0].count
            },
            categoryStats,
            recentRegistrations
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- GET /api/admin/users ----
// Get all students (Admin only)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, role, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC"
        );
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
