// ============================================
// Event Routes - CRUD + Search/Filter
// ============================================
const express = require('express');
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/events ----
// Get all events with optional search, filter, and pagination
router.get('/', async (req, res) => {
    try {
        const { search, category, page = 1, limit = 9, sort = 'event_date' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM events WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
        const params = [];
        const countParams = [];

        // Search by title or description
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }

        // Filter by category
        if (category && category !== 'all') {
            query += ' AND category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
            countParams.push(category);
        }

        // Sorting
        const allowedSorts = ['event_date', 'title', 'created_at', 'available_seats'];
        const sortField = allowedSorts.includes(sort) ? sort : 'event_date';
        query += ` ORDER BY ${sortField} ASC`;

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [events] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            events,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalEvents: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- GET /api/events/:id ----
// Get single event by ID
router.get('/:id', async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);

        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json({ event: events[0] });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- POST /api/events ----
// Create new event (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, category, event_date, event_time, venue, total_seats, image_url } = req.body;

        // Validation
        if (!title || !event_date || !event_time || !venue) {
            return res.status(400).json({ message: 'Title, date, time, and venue are required.' });
        }

        const seats = parseInt(total_seats) || 50;

        const [result] = await db.query(
            `INSERT INTO events (title, description, category, event_date, event_time, venue, total_seats, available_seats, image_url, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || '', category || 'other', event_date, event_time, venue, seats, seats, image_url || null, req.user.id]
        );

        res.status(201).json({
            message: 'Event created successfully!',
            eventId: result.insertId
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- PUT /api/events/:id ----
// Update event (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, category, event_date, event_time, venue, total_seats, image_url } = req.body;

        // Get current event to calculate seat difference
        const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const currentEvent = existing[0];
        const newTotalSeats = parseInt(total_seats) || currentEvent.total_seats;
        const seatDiff = newTotalSeats - currentEvent.total_seats;
        const newAvailableSeats = Math.max(0, currentEvent.available_seats + seatDiff);

        await db.query(
            `UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, event_time = ?, 
             venue = ?, total_seats = ?, available_seats = ?, image_url = ? WHERE id = ?`,
            [
                title || currentEvent.title,
                description || currentEvent.description,
                category || currentEvent.category,
                event_date || currentEvent.event_date,
                event_time || currentEvent.event_time,
                venue || currentEvent.venue,
                newTotalSeats,
                newAvailableSeats,
                image_url !== undefined ? image_url : currentEvent.image_url,
                req.params.id
            ]
        );

        res.json({ message: 'Event updated successfully!' });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- DELETE /api/events/:id ----
// Delete event (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [existing] = await db.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted successfully!' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- GET /api/events/:id/registrations ----
// Get students registered for an event (Admin only)
router.get('/:id/registrations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [registrations] = await db.query(
            `SELECT er.id, er.registered_at, u.id as user_id, u.name, u.email 
             FROM event_registrations er 
             JOIN users u ON er.user_id = u.id 
             WHERE er.event_id = ? 
             ORDER BY er.registered_at DESC`,
            [req.params.id]
        );

        res.json({ registrations });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
