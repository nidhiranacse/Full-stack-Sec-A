const Event = require('../models/Event');
const { invalidateEventsCache } = require('../middleware/cache');

async function listEvents(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const search = (req.query.search || '').trim();

  const filter = search
    ? {
        title: {
          $regex: search,
          $options: 'i'
        }
      }
    : {};

  const total = await Event.countDocuments(filter);

  const items = await Event.find(filter)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return res.status(200).json({
    items,
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total
  });
}

async function createEvent(req, res) {
  const { title, description, date, location } = req.body;

  const event = await Event.create({
    title,
    description,
    date,
    location,
    createdBy: req.user.sub
  });

  await invalidateEventsCache();

  return res.status(201).json(event);
}

async function rsvpToEvent(req, res) {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      error: 'Event not found'
    });
  }

  const userId = req.user.sub;

  if (!event.rsvps.some((id) => id.toString() === userId)) {
    event.rsvps.push(userId);
    await event.save();
  }

  await invalidateEventsCache();

  return res.status(200).json(event);
}

module.exports = {
  listEvents,
  createEvent,
  rsvpToEvent
};