const Event = require('../models/Event');
const redisClient = require('../config/redis');

const getEvents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const cacheKey = `events:page:${page}:search:${search}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ source: 'cache', ...JSON.parse(cachedData) });
    }

    const query = { title: { $regex: search, $options: 'i' } };
    const events = await Event.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Event.countDocuments(query);
    const result = { events, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) };

    await redisClient.setEx(cacheKey, 60, JSON.stringify(result)); // 60s TTL
    res.json({ source: 'database', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await Event.create({ title, description, date });

    // Cache Invalidation
    const keys = await redisClient.keys('events:*');
    if (keys.length > 0) await redisClient.del(keys);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.rsvps.includes(req.user.id)) {
      event.rsvps.push(req.user.id);
      await event.save();
      const keys = await redisClient.keys('events:*');
      if (keys.length > 0) await redisClient.del(keys);
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvents, createEvent, rsvpEvent };
