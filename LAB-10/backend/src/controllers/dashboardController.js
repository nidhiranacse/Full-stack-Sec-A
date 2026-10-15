const db = require('../config/db');

/**
 * Student Dashboard (My Events, My Resources, Registration History)
 */
function getStudentDashboard(req, res) {
  try {
    const userId = req.user.id;
    const userSemester = req.user.semester || '6th Sem';

    // My Registered Events (with past vs upcoming status)
    const myEvents = db.prepare(`
      SELECT 
        e.*,
        r.registered_at,
        r.id as registration_id,
        CASE WHEN date(e.date) >= date('now') THEN 'upcoming' ELSE 'completed' END as event_status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY e.date ASC
    `).all(userId);

    // Resources relevant to student's semester or uploaded by them
    const mySemesterResources = db.prepare(`
      SELECT r.*, u.name as uploader_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.semester = ? OR r.uploaded_by = ?
      ORDER BY r.created_at DESC
      LIMIT 8
    `).all(userSemester, userId);

    const upcomingEvents = myEvents.filter(e => e.event_status === 'upcoming');
    const pastEvents = myEvents.filter(e => e.event_status === 'completed');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_registered: myEvents.length,
          upcoming_count: upcomingEvents.length,
          completed_count: pastEvents.length,
          semester_resources_count: mySemesterResources.length
        },
        my_events: myEvents,
        upcoming_events: upcomingEvents,
        past_events: pastEvents,
        recommended_resources: mySemesterResources
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student dashboard data.',
      error: error.message
    });
  }
}

/**
 * Admin Dashboard (Analytics: total events, total registrations, seat occupancy, recent activity)
 */
function getAdminDashboard(req, res) {
  try {
    // 1. High-level metric counts
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
    const totalResources = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalDownloads = db.prepare('SELECT COALESCE(SUM(download_count), 0) as count FROM resources').get().count;

    // 2. Event breakdown with seat analytics and occupancy %
    const eventStats = db.prepare(`
      SELECT 
        e.id,
        e.title,
        e.category,
        e.date,
        e.time,
        e.venue,
        e.total_seats,
        COUNT(r.id) as registered_students,
        MAX(0, e.total_seats - COUNT(r.id)) as remaining_seats,
        ROUND((CAST(COUNT(r.id) AS FLOAT) / e.total_seats) * 100, 1) as occupancy_percentage
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY e.date ASC
    `).all();

    // 3. Category distribution
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM events
      GROUP BY category
    `).all();

    // 4. Recent registrations
    const recentRegistrations = db.prepare(`
      SELECT 
        r.id as registration_id,
        r.registered_at,
        u.name as student_name,
        u.email as student_email,
        u.department,
        e.title as event_title,
        e.date as event_date
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 10
    `).all();

    res.status(200).json({
      success: true,
      data: {
        analytics: {
          total_events: totalEvents,
          total_registrations: totalRegistrations,
          total_resources: totalResources,
          total_students: totalStudents,
          total_downloads: totalDownloads
        },
        event_breakdown: eventStats,
        category_distribution: categoryStats,
        recent_registrations: recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard analytics.',
      error: error.message
    });
  }
}

module.exports = {
  getStudentDashboard,
  getAdminDashboard
};
