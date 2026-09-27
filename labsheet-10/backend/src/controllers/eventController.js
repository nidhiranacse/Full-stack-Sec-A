const Event = require('../models/Event');
const { getRedisClient, invalidateCachePattern } = require('../config/redis');

// @route   GET /api/events
// @desc    Get paginated events with optional search-by-title, cached via Redis for 60s
const getEvents = async (req, res) => {
  const startTime = Date.now();
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category ? req.query.category.trim() : '';
    const skip = (page - 1) * limit;

    const cacheKey = `events:page=${page}:limit=${limit}:search=${encodeURIComponent(search)}:cat=${encodeURIComponent(category)}`;
    const redis = getRedisClient();

    // Attempt to read from Redis cache
    let cachedData = null;
    try {
      if (redis && typeof redis.get === 'function') {
        cachedData = await redis.get(cacheKey);
      }
    } catch (cacheErr) {
      console.warn('[Redis] Cache read error:', cacheErr.message);
    }

    if (cachedData) {
      const responsePayload = JSON.parse(cachedData);
      const responseTime = Date.now() - startTime;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      return res.status(200).json({
        ...responsePayload,
        cached: true,
        responseTimeMs: responseTime,
      });
    }

    // Cache MISS: Query MongoDB
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const [events, totalEvents] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'name email role')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalEvents / limit) || 1;

    const payload = {
      success: true,
      events,
      pagination: {
        totalEvents,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Store in Redis with 60-second TTL
    try {
      if (redis && typeof redis.set === 'function') {
        await redis.set(cacheKey, JSON.stringify(payload), 'EX', 60);
      }
    } catch (setErr) {
      console.warn('[Redis] Cache write error:', setErr.message);
    }

    const responseTime = Date.now() - startTime;
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    return res.status(200).json({
      ...payload,
      cached: false,
      responseTimeMs: responseTime,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('rsvps', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   POST /api/events (Admin only)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      category: category || 'General',
      capacity: capacity || 100,
      createdBy: req.user.id,
      rsvps: [],
    });

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   PUT /api/events/:id (Admin only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }

    const { title, description, date, location, category, capacity } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (category) event.category = category;
    if (capacity !== undefined) event.capacity = capacity;

    await event.save();

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   DELETE /api/events/:id (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(200).json({
      message: 'Event deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   POST /api/events/:id/rsvp (Student/User)
const toggleRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }

    const userId = req.user.id;
    const isAlreadyRsvpd = event.rsvps.some((r) => r.toString() === userId.toString());

    if (isAlreadyRsvpd) {
      // Cancel RSVP
      event.rsvps = event.rsvps.filter((r) => r.toString() !== userId.toString());
      await event.save();

      await invalidateCachePattern('events:*');

      return res.status(200).json({
        message: 'RSVP cancelled successfully',
        rsvpd: false,
        rsvpCount: event.rsvps.length,
      });
    } else {
      // Check capacity
      if (event.rsvps.length >= event.capacity) {
        return res.status(400).json({
          error: 'Event Full',
          message: 'This event has already reached its maximum RSVP capacity.',
        });
      }

      event.rsvps.push(userId);
      await event.save();

      await invalidateCachePattern('events:*');

      return res.status(200).json({
        message: 'RSVP confirmed successfully',
        rsvpd: true,
        rsvpCount: event.rsvps.length,
      });
    }
  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp,
};
