const Event = require("../models/Event");

async function listEvents(req, res) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10)));
  const search = (req.query.search || "").trim();
  const filter = search ? { title: { $regex: search, $options: "i" } } : {};
  const [items, total] = await Promise.all([
    Event.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);
  return res.status(200).json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

async function createEvent(req, res) {
  const { title, description, date, venue } = req.body;
  const event = await Event.create({
    title,
    description: description || "",
    date,
    venue: venue || "",
    createdBy: req.user.sub,
    attendees: [],
  });
  return res.status(201).json(event);
}

async function rsvpEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  const uid = req.user.sub;
  const ids = (event.attendees || []).map(String);
  if (!ids.includes(String(uid))) {
    event.attendees = [...(event.attendees || []), uid];
    await event.save();
  }
  return res.status(200).json(event);
}

module.exports = { listEvents, createEvent, rsvpEvent };
