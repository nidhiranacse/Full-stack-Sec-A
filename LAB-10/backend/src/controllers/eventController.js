const db = require('../config/db');

/**
 * Get all events with Search, Filter, and Pagination
 */
function getAllEvents(req, res) {
  try {
    const {
      search = '',
      category = '',
      date = '',
      page = 1,
      limit = 9
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 9));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category.trim()) {
      conditions.push('e.category = ?');
      params.push(category.trim());
    }

    if (date.trim()) {
      conditions.push('e.date = ?');
      params.push(date.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM events e ${whereClause}`;
    const totalCount = db.prepare(countSql).get(...params).total;

    // Current logged in user ID if any (to check registration status)
    const currentUserId = req.user ? req.user.id : null;

    const querySql = `
      SELECT 
        e.*,
        u.name as creator_name,
        COUNT(r.id) as registered_count,
        MAX(0, e.total_seats - COUNT(r.id)) as available_seats,
        ${currentUserId ? `EXISTS(SELECT 1 FROM registrations WHERE user_id = ${currentUserId} AND event_id = e.id) as is_registered` : '0 as is_registered'}
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.date ASC, e.time ASC
      LIMIT ? OFFSET ?
    `;

    const events = db.prepare(querySql).all(...params, limitNum, offset);

    // Format is_registered as boolean
    const formattedEvents = events.map(evt => ({
      ...evt,
      is_registered: Boolean(evt.is_registered),
      is_full: evt.available_seats <= 0
    }));

    res.status(200).json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          totalItems: totalCount,
          currentPage: pageNum,
          itemsPerPage: limitNum,
          totalPages: Math.ceil(totalCount / limitNum) || 1,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve events.',
      error: error.message
    });
  }
}

/**
 * Get a single event by ID with registration status and counts
 */
function getEventById(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const querySql = `
      SELECT 
        e.*,
        u.name as creator_name,
        u.email as creator_email,
        COUNT(r.id) as registered_count,
        MAX(0, e.total_seats - COUNT(r.id)) as available_seats,
        ${currentUserId ? `EXISTS(SELECT 1 FROM registrations WHERE user_id = ${currentUserId} AND event_id = e.id) as is_registered` : '0 as is_registered'}
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;

    const event = db.prepare(querySql).get(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    event.is_registered = Boolean(event.is_registered);
    event.is_full = event.available_seats <= 0;

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
      error: error.message
    });
  }
}

/**
 * Create a new event (Admin only)
 */
function createEvent(req, res) {
  try {
    const { title, description, category, date, time, venue, total_seats } = req.body;
    const created_by = req.user.id;

    const stmt = db.prepare(`
      INSERT INTO events (title, description, category, date, time, venue, total_seats, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      description.trim(),
      category.trim(),
      date.trim(),
      time.trim(),
      venue.trim(),
      parseInt(total_seats, 10),
      created_by
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event.',
      error: error.message
    });
  }
}

/**
 * Update an existing event (Admin only)
 */
function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, date, time, venue, total_seats } = req.body;

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Verify seat capacity is not reduced below currently registered students count
    const regCount = db.prepare('SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ?').get(id).cnt;
    const newSeats = parseInt(total_seats, 10);
    if (newSeats < regCount) {
      return res.status(400).json({
        success: false,
        message: `Total seats cannot be less than current registrations (${regCount}).`
      });
    }

    const stmt = db.prepare(`
      UPDATE events
      SET title = ?, description = ?, category = ?, date = ?, time = ?, venue = ?, total_seats = ?
      WHERE id = ?
    `);

    stmt.run(
      title.trim(),
      description.trim(),
      category.trim(),
      date.trim(),
      time.trim(),
      venue.trim(),
      newSeats,
      id
    );

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event.',
      error: error.message
    });
  }
}

/**
 * Delete an event (Admin only)
 */
function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
      error: error.message
    });
  }
}

/**
 * Register student for an event
 */
function registerForEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Check if already registered
    const existingReg = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (existingReg) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event.'
      });
    }

    // Check seat availability
    const regCount = db.prepare('SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ?').get(eventId).cnt;
    if (regCount >= event.total_seats) {
      return res.status(400).json({
        success: false,
        message: 'Registration closed. All seats have been filled.'
      });
    }

    // Register
    const insertStmt = db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)');
    insertStmt.run(userId, eventId);

    const updatedStats = {
      registered_count: regCount + 1,
      available_seats: Math.max(0, event.total_seats - (regCount + 1)),
      is_registered: true
    };

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event!',
      data: updatedStats
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event.',
      error: error.message
    });
  }
}

/**
 * Unregister student from an event
 */
function unregisterFromEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const existingReg = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (!existingReg) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event.'
      });
    }

    db.prepare('DELETE FROM registrations WHERE id = ?').run(existingReg.id);

    const event = db.prepare('SELECT total_seats FROM events WHERE id = ?').get(eventId);
    const regCount = db.prepare('SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ?').get(eventId).cnt;

    res.status(200).json({
      success: true,
      message: 'Successfully cancelled event registration.',
      data: {
        registered_count: regCount,
        available_seats: Math.max(0, (event ? event.total_seats : 0) - regCount),
        is_registered: false
      }
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration.',
      error: error.message
    });
  }
}

/**
 * Get list of registered students for an event (Admin only)
 */
function getEventRegistrations(req, res) {
  try {
    const eventId = req.params.id;

    const event = db.prepare('SELECT id, title, total_seats FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const students = db.prepare(`
      SELECT 
        u.id as student_id,
        u.name,
        u.email,
        u.department,
        u.semester,
        r.registered_at
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at ASC
    `).all(eventId);

    res.status(200).json({
      success: true,
      data: {
        event,
        total_registered: students.length,
        available_seats: Math.max(0, event.total_seats - students.length),
        students
      }
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered students.',
      error: error.message
    });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations
};
