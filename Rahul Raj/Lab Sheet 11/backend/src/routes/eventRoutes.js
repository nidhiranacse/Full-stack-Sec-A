/**
 * Event Management & Registration Routes
 * Lab Sheet 11 - Core Module: Events & Search/Filter
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateUser, optionalAuth, requireRole } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validator');

/**
 * @route   GET /api/events
 * @desc    Get paginated events with search, category filtering & seat statistics
 * @access  Public (Optional Auth for isRegistered status)
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { q, category, status } = req.query;

    const whereClauses = [];
    const params = [];

    if (q && q.trim()) {
      whereClauses.push('(e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)');
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      whereClauses.push('e.category = ?');
      params.push(category);
    }

    const today = new Date().toISOString().split('T')[0];
    if (status === 'upcoming') {
      whereClauses.push('e.date >= ?');
      params.push(today);
    } else if (status === 'past') {
      whereClauses.push('e.date < ?');
      params.push(today);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total Count Query
    const countSql = `SELECT COUNT(*) as total FROM events e ${whereSql}`;
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Events Query with Registrations count
    const listSql = `
      SELECT 
        e.*,
        u.name as creatorName,
        COUNT(r.id) as registeredCount,
        (e.maxSeats - COUNT(r.id)) as seatsLeft,
        CASE WHEN COUNT(r.id) >= e.maxSeats THEN 1 ELSE 0 END as isFull
      FROM events e
      LEFT JOIN users u ON e.createdBy = u.id
      LEFT JOIN registrations r ON e.id = r.eventId
      ${whereSql}
      GROUP BY e.id
      ORDER BY e.date ASC, e.id ASC
      LIMIT ? OFFSET ?
    `;

    const rawEvents = db.prepare(listSql).all(...params, limit, offset);

    // If student is logged in, attach isRegistered boolean
    const userId = req.user ? req.user.id : null;
    let userRegistrations = new Set();
    if (userId) {
      const regRows = db.prepare('SELECT eventId FROM registrations WHERE userId = ?').all(userId);
      userRegistrations = new Set(regRows.map(r => r.eventId));
    }

    const events = rawEvents.map(ev => ({
      ...ev,
      isRegistered: userRegistrations.has(ev.id),
      isFull: Boolean(ev.isFull)
    }));

    return res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });
  } catch (err) {
    console.error('Fetch events error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get detailed single event info with live seat availability
 * @access  Public (Optional Auth)
 */
router.get('/:id', optionalAuth, (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  try {
    const eventSql = `
      SELECT 
        e.*,
        u.name as creatorName,
        COUNT(r.id) as registeredCount,
        (e.maxSeats - COUNT(r.id)) as seatsLeft,
        CASE WHEN COUNT(r.id) >= e.maxSeats THEN 1 ELSE 0 END as isFull
      FROM events e
      LEFT JOIN users u ON e.createdBy = u.id
      LEFT JOIN registrations r ON e.id = r.eventId
      WHERE e.id = ?
      GROUP BY e.id
    `;
    const event = db.prepare(eventSql).get(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let isRegistered = false;
    if (req.user) {
      const reg = db.prepare('SELECT id FROM registrations WHERE eventId = ? AND userId = ?').get(eventId, req.user.id);
      isRegistered = Boolean(reg);
    }

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        isRegistered,
        isFull: Boolean(event.isFull)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch event', error: err.message });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Admin Role Only)
 */
router.post('/', authenticateUser, requireRole('admin'), validateEvent, (req, res) => {
  const { title, description, category, date, time, venue, maxSeats } = req.body;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO events (title, description, category, date, time, venue, maxSeats, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      title.trim(),
      description.trim(),
      category,
      date,
      time.trim(),
      venue.trim(),
      parseInt(maxSeats, 10),
      req.user.id
    );

    const eventId = Number(result.lastInsertRowid);
    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        ...newEvent,
        registeredCount: 0,
        seatsLeft: newEvent.maxSeats,
        isFull: false
      }
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create event', error: err.message });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an existing event
 * @access  Private (Admin Role Only)
 */
router.put('/:id', authenticateUser, requireRole('admin'), validateEvent, (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  const { title, description, category, date, time, venue, maxSeats } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const updateStmt = db.prepare(`
      UPDATE events
      SET title = ?, description = ?, category = ?, date = ?, time = ?, venue = ?, maxSeats = ?
      WHERE id = ?
    `);

    updateStmt.run(
      title.trim(),
      description.trim(),
      category,
      date,
      time.trim(),
      venue.trim(),
      parseInt(maxSeats, 10),
      eventId
    );

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update event', error: err.message });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Admin Role Only)
 */
router.delete('/:id', authenticateUser, requireRole('admin'), (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  try {
    const existing = db.prepare('SELECT id, title FROM events WHERE id = ?').get(eventId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(eventId);

    return res.status(200).json({
      success: true,
      message: `Event "${existing.title}" deleted successfully`,
      deletedId: eventId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete event', error: err.message });
  }
});

/**
 * @route   POST /api/events/:id/register
 * @desc    Student registers for an event (checks seat limit & prevents overbooking)
 * @access  Private (Student Role Only)
 */
router.post('/:id/register', authenticateUser, requireRole('student'), (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  try {
    const event = db.prepare('SELECT id, title, maxSeats FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if student is already registered
    const existingReg = db.prepare('SELECT id FROM registrations WHERE eventId = ? AND userId = ?').get(eventId, req.user.id);
    if (existingReg) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check seat availability
    const regCount = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE eventId = ?').get(eventId).count;
    if (regCount >= event.maxSeats) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked! No vacant seats are remaining.'
      });
    }

    // Insert registration
    const insertReg = db.prepare('INSERT INTO registrations (eventId, userId) VALUES (?, ?)');
    insertReg.run(eventId, req.user.id);

    const newCount = regCount + 1;
    const seatsLeft = event.maxSeats - newCount;

    return res.status(201).json({
      success: true,
      message: `Successfully registered for "${event.title}"!`,
      registration: {
        eventId,
        userId: req.user.id,
        registeredCount: newCount,
        seatsLeft,
        isFull: newCount >= event.maxSeats
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

/**
 * @route   POST /api/events/:id/unregister
 * @desc    Student unregisters / cancels RSVP for an event
 * @access  Private (Student Role Only)
 */
router.post('/:id/unregister', authenticateUser, requireRole('student'), (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  try {
    const existingReg = db.prepare('SELECT id FROM registrations WHERE eventId = ? AND userId = ?').get(eventId, req.user.id);
    if (!existingReg) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    db.prepare('DELETE FROM registrations WHERE id = ?').run(existingReg.id);

    return res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unregistration failed', error: err.message });
  }
});

/**
 * @route   GET /api/events/:id/attendees
 * @desc    View list of registered students for a specific event
 * @access  Private (Admin Role Only)
 */
router.get('/:id/attendees', authenticateUser, requireRole('admin'), (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  try {
    const event = db.prepare('SELECT id, title, maxSeats FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attendeeSql = `
      SELECT 
        u.id, u.name, u.email, u.department, u.semester,
        r.registeredAt
      FROM registrations r
      JOIN users u ON r.userId = u.id
      WHERE r.eventId = ?
      ORDER BY r.registeredAt ASC
    `;
    const attendees = db.prepare(attendeeSql).all(eventId);

    return res.status(200).json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        maxSeats: event.maxSeats,
        attendeeCount: attendees.length
      },
      attendees
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attendees', error: err.message });
  }
});

module.exports = router;
