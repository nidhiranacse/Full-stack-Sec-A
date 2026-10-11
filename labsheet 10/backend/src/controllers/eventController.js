const { db } = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    
    let filtered = db.events;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = db.events.filter(e => e.title.toLowerCase().includes(searchLower));
    }
    
    const total = filtered.length;
    const start = (page - 1) * limit;
    const events = filtered.slice(start, start + Number(limit));
    
    res.json({ source: 'database', events, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = {
      _id: String(db.nextEventId++),
      title,
      description,
      date: new Date(date),
      rsvps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.events.push(event);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rsvpEvent = async (req, res) => {
  try {
    const event = db.events.find(e => e._id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.rsvps.includes(req.user.id)) {
      event.rsvps.push(req.user.id);
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvents, createEvent, rsvpEvent };
