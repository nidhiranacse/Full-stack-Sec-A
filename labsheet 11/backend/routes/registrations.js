// ============================================
// Registration Routes - Register/Unregister for Events
// ============================================
const express = require('express');
const db = require('../config/db');
const { authenticateToken, isStudent } = require('../middleware/auth');

const router = express.Router();

// ---- POST /api/registrations/:eventId ----
// Register for an event (Student only)
router.post('/:eventId', authenticateToken, isStudent, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const eventId = req.params.eventId;
        const userId = req.user.id;

        // Check if event exists
        const [events] = await connection.query('SELECT * FROM events WHERE id = ?', [eventId]);
        if (events.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = events[0];

        // Check available seats
        if (event.available_seats <= 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Sorry, no seats available for this event.' });
        }

        // Check if already registered
        const [existing] = await connection.query(
            'SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'You are already registered for this event.' });
        }

        // Register the student
        await connection.query(
            'INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)',
            [userId, eventId]
        );

        // Decrease available seats
        await connection.query(
            'UPDATE events SET available_seats = available_seats - 1 WHERE id = ?',
            [eventId]
        );

        await connection.commit();
        res.status(201).json({ message: 'Successfully registered for the event!' });
    } catch (error) {
        await connection.rollback();
        console.error('Register for event error:', error);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        connection.release();
    }
});

// ---- DELETE /api/registrations/:eventId ----
// Unregister from an event (Student only)
router.delete('/:eventId', authenticateToken, isStudent, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const eventId = req.params.eventId;
        const userId = req.user.id;

        // Check if registered
        const [existing] = await connection.query(
            'SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'You are not registered for this event.' });
        }

        // Remove registration
        await connection.query(
            'DELETE FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );

        // Increase available seats
        await connection.query(
            'UPDATE events SET available_seats = available_seats + 1 WHERE id = ?',
            [eventId]
        );

        await connection.commit();
        res.json({ message: 'Successfully unregistered from the event.' });
    } catch (error) {
        await connection.rollback();
        console.error('Unregister error:', error);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        connection.release();
    }
});

// ---- GET /api/registrations/my-events ----
// Get current student's registered events
router.get('/my-events', authenticateToken, isStudent, async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT e.*, er.registered_at 
             FROM event_registrations er 
             JOIN events e ON er.event_id = e.id 
             WHERE er.user_id = ? 
             ORDER BY e.event_date ASC`,
            [req.user.id]
        );

        res.json({ events });
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ---- GET /api/registrations/check/:eventId ----
// Check if current student is registered for an event
router.get('/check/:eventId', authenticateToken, async (req, res) => {
    try {
        const [existing] = await db.query(
            'SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [req.user.id, req.params.eventId]
        );

        res.json({ isRegistered: existing.length > 0 });
    } catch (error) {
        console.error('Check registration error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
