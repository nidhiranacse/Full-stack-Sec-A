import { Event } from '../models/Event.js';
import { getCachedData, setCachedData, invalidateCachePattern } from '../config/redis.js';

// @desc    Get all events with search, category filtering & pagination (Cached with Redis, 60s TTL)
// @route   GET /api/events
// @access  Private (Authenticated users: Admin or Student)
export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category ? req.query.category.trim() : '';

    const cacheKey = `events:list:${page}:${limit}:${search}:${category}`;

    // Check Redis Cache
    const cached = await getCachedData(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({
        ...cached,
        cache: 'HIT'
      });
    }

    // Build Query
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'name email role')
        .populate('rsvpUsers', 'name email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Event.countDocuments(query)
    ]);

    const responsePayload = {
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };

    // Store in Redis with 60-second TTL
    await setCachedData(cacheKey, responsePayload, 60);

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({
      ...responsePayload,
      cache: 'MISS'
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events',
      error: error.message
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('rsvpUsers', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event',
      error: error.message
    });
  }
};

// @desc    Create a new event (ADMIN only) - invalidates Redis cache
// @route   POST /api/events
// @access  Private (ADMIN)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      category,
      capacity,
      createdBy: req.user._id,
      rsvpUsers: []
    });

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Update an event (ADMIN only) - invalidates Redis cache
// @route   PUT /api/events/:id
// @access  Private (ADMIN)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const { title, description, date, location, category, capacity } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (category) event.category = category;
    if (capacity) event.capacity = capacity;

    await event.save();

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Delete an event (ADMIN only) - invalidates Redis cache
// @route   DELETE /api/events/:id
// @access  Private (ADMIN)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Invalidate Redis cache
    await invalidateCachePattern('events:*');

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// @desc    RSVP / cancel RSVP for an event
// @route   POST /api/events/:id/rsvp
// @access  Private (Authenticated users: Student or Admin)
export const toggleRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const userId = req.user._id.toString();
    const isAlreadyRsvpd = event.rsvpUsers.some((uid) => uid.toString() === userId);

    if (isAlreadyRsvpd) {
      // Cancel RSVP
      event.rsvpUsers = event.rsvpUsers.filter((uid) => uid.toString() !== userId);
      await event.save();

      // Invalidate Redis cache
      await invalidateCachePattern('events:*');

      return res.status(200).json({
        success: true,
        message: 'RSVP cancelled successfully',
        isRsvpd: false,
        rsvpCount: event.rsvpUsers.length,
        spotsLeft: Math.max(0, event.capacity - event.rsvpUsers.length)
      });
    } else {
      // Check capacity
      if (event.rsvpUsers.length >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Sorry, this event is already at maximum capacity.'
        });
      }

      // Add RSVP
      event.rsvpUsers.push(req.user._id);
      await event.save();

      // Invalidate Redis cache
      await invalidateCachePattern('events:*');

      return res.status(200).json({
        success: true,
        message: 'RSVP confirmed successfully!',
        isRsvpd: true,
        rsvpCount: event.rsvpUsers.length,
        spotsLeft: Math.max(0, event.capacity - event.rsvpUsers.length)
      });
    }
  } catch (error) {
    console.error('Toggle RSVP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process RSVP',
      error: error.message
    });
  }
};
