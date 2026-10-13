const Event = require('../models/Event');
const { getClient } = require('../config/redis');
const { broadcastEventUpdate } = require('../socket');

const CACHE_KEY = 'events:all';

// GET all events with Cache-Aside
exports.getEvents = async (req, res) => {
  const redis = getClient();
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'redis-cache',
        data: JSON.parse(cached)
      });
    }

    const events = await Event.find().populate('createdBy', 'name email').sort({ date: 1 });
    await redis.setEx(CACHE_KEY, 120, JSON.stringify(events)); // Cache for 2 mins

    res.status(200).json({
      success: true,
      source: 'mongodb',
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new event (Admin only)
exports.createEvent = async (req, res) => {
  const redis = getClient();
  try {
    const { title, description, category, venue, date, capacity } = req.body;
    const event = await Event.create({
      title,
      description,
      category,
      venue,
      date,
      capacity,
      createdBy: req.user.id
    });

    // Invalidate cache
    await redis.del(CACHE_KEY);

    broadcastEventUpdate(event);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// RSVP for an event
exports.rsvpEvent = async (req, res) => {
  const redis = getClient();
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const userId = req.user.id;
    const isAttending = event.registeredAttendees.includes(userId);

    if (isAttending) {
      // Un-register
      event.registeredAttendees.pull(userId);
    } else {
      if (event.registeredAttendees.length >= event.capacity) {
        return res.status(400).json({ success: false, message: 'Event has reached max capacity' });
      }
      event.registeredAttendees.push(userId);
    }

    await event.save();
    await redis.del(CACHE_KEY);
    broadcastEventUpdate(event);

    res.status(200).json({
      success: true,
      message: isAttending ? 'RSVP removed' : 'RSVP confirmed',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
