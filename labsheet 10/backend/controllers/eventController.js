const Event = require('../models/Event');

exports.getEvents = (redisClient) => async (req, res) => {
  const { search = '', page = 1, limit = 6 } = req.query;
  const cacheKey = `events:${search}:${page}:${limit}`;

  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    } catch (e) {
      console.warn('Redis read error:', e.message);
    }
  }

  const query = search ? { title: { $regex: search,$options: 'i' } } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query).sort({ date: 1 }).skip(skip).limit(parseInt(limit)).populate('createdBy', 'name'),
    Event.countDocuments(query)
  ]);

  const payload = { events, total, pages: Math.ceil(total / limit) };

  if (redisClient) {
    try {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(payload));
    } catch (e) {
      console.warn('Redis cache set error:', e.message);
    }
  }

  res.json(payload);
};

exports.createEvent = (redisClient) => async (req, res) => {
  const { title, description, date, location } = req.body;
  const event = await Event.create({
    title, description, date, location, createdBy: req.user.id
  });

  if (redisClient) {
    try {
      const keys = await redisClient.keys('events:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) {
      console.warn('Redis invalidation error:', e.message);
    }
  }

  res.status(201).json(event);
};

exports.rsvpEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const userId = req.user.id;
  const index = event.rsvps.indexOf(userId);

  if (index > -1) {
    event.rsvps.splice(index, 1);
  } else {
    event.rsvps.push(userId);
  }

  await event.save();
  res.json({ message: 'RSVP updated', rsvps: event.rsvps });
};