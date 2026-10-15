/**
 * Event Routes (Task 3 & 4)
 * Implements Redis caching with 60s TTL and auto-invalidation
 */

const express = require('express');
const { events, rsvps, nextEventId } = require('../config/db');
const { cache, EVENTS_CACHE_KEY, CACHE_TTL_SECONDS } = require('../config/redis');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Seed initial events
(async () => {
  if (events.size === 0) {
    const e1 = nextEventId();
    events.set(e1, {
      id: e1,
      title: 'Annual Full Stack Hackathon 2026',
      description: '48-hour collaborative engineering hackathon across campus.',
      category: 'Hackathon',
      location: 'Auditorium Block C',
      date: '2026-10-15T09:00:00Z',
      capacity: 150,
      createdAt: new Date()
    });

    const e2 = nextEventId();
    events.set(e2, {
      id: e2,
      title: 'Cloud Architecture & Kubernetes Workshop',
      description: 'Hands-on microservices container orchestration masterclass.',
      category: 'Workshop',
      location: 'Lab Complex 4',
      date: '2026-10-22T14:00:00Z',
      capacity: 80,
      createdAt: new Date()
    });

    const e3 = nextEventId();
    events.set(e3, {
      id: e3,
      title: 'AI & Large Language Models Symposium',
      description: 'Keynotes from leading DeepMind and Industry AI researchers.',
      category: 'Symposium',
      location: 'Virtual Broadcast & Hall A',
      date: '2026-11-05T10:30:00Z',
      capacity: 300,
      createdAt: new Date()
    });
  }
})();

// GET /api/events (Public / Authenticated - Cached with Redis TTL 60s - Task 3)
router.get('/', async (req, res) => {
  try {
    const search = req.query.q ? req.query.q.trim().toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check Redis Cache if no query filters
    const isUnfiltered = !search && page === 1;
    if (isUnfiltered) {
      const cachedData = await cache.get(EVENTS_CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        res.setHeader('X-Cache-Status', 'HIT');
        return res.status(200).json({
          success: true,
          source: 'cache (Redis)',
          count: parsed.length,
          data: parsed
        });
      }
    }

    // Query database
    let list = Array.from(events.values());

    if (search) {
      list = list.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.category.toLowerCase().includes(search)
      );
    }

    // Sort descending by id
    list.sort((a, b) => b.id - a.id);

    // Pagination
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Populate Redis Cache if unfiltered
    if (isUnfiltered) {
      await cache.set(EVENTS_CACHE_KEY, JSON.stringify(paginated), 'EX', CACHE_TTL_SECONDS);
    }

    res.setHeader('X-Cache-Status', 'MISS');
    res.status(200).json({
      success: true,
      source: 'database',
      total,
      page,
      limit,
      count: paginated.length,
      data: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const event = events.get(Number(req.params.id));
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  res.status(200).json({ success: true, data: event });
});

// POST /api/events (Admin Only - Task 1 & Task 3 Cache Invalidation)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, description, category, location, date, capacity } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const id = nextEventId();
    const newEvent = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      location: location || 'Main Campus',
      date: date || new Date().toISOString(),
      capacity: parseInt(capacity) || 100,
      createdAt: new Date()
    };

    events.set(id, newEvent);

    // Task 3: Automatic cache invalidation
    await cache.del(EVENTS_CACHE_KEY);

    res.status(201).json({
      success: true,
      message: 'Event successfully created',
      data: newEvent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/events/:id (Admin Only - Task 1 & Task 3 Cache Invalidation)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const existing = events.get(eventId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { title, description, category, location, date, capacity } = req.body;

    const updated = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description.trim() : existing.description,
      category: category !== undefined ? category : existing.category,
      location: location !== undefined ? location : existing.location,
      date: date !== undefined ? date : existing.date,
      capacity: capacity !== undefined ? parseInt(capacity) : existing.capacity,
      updatedAt: new Date()
    };

    events.set(eventId, updated);

    // Task 3: Cache Invalidation
    await cache.del(EVENTS_CACHE_KEY);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/events/:id (Admin Only - Task 1 & Task 3 Cache Invalidation)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!events.has(eventId)) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    events.delete(eventId);

    // Task 3: Cache Invalidation
    await cache.del(EVENTS_CACHE_KEY);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/events/:id/rsvp (Authenticated - Students/Admin)
router.post('/:id/rsvp', authenticate, (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!events.has(eventId)) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const rsvpKey = `${req.user.id}_${eventId}`;
    let isRsvpd = false;

    if (rsvps.has(rsvpKey)) {
      rsvps.delete(rsvpKey);
      isRsvpd = false;
    } else {
      rsvps.add(rsvpKey);
      isRsvpd = true;
    }

    res.status(200).json({
      success: true,
      isRsvpd,
      message: isRsvpd ? 'RSVP confirmed for event' : 'RSVP cancelled for event'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
