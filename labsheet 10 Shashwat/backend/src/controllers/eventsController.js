const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/db');
const { cache, invalidateCache } = require('../services/cacheService');

const CACHE_PREFIX = 'events_list';

// ── Helpers ────────────────────────────────────────────────────────────────

function enrichEvent(db, event) {
  const creator  = db.get('users').find({ id: event.createdBy }).value();
  const rsvpCount = db.get('rsvps').filter({ eventId: event.id }).size().value();
  return { ...event, creatorName: creator?.name || 'Unknown', rsvpCount };
}

// ── Controllers ────────────────────────────────────────────────────────────

function getEvents(req, res) {
  const { search = '', page = 1, limit = 6 } = req.query;
  const cacheKey = `${CACHE_PREFIX}|${search}|${page}|${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  const db = getDb();
  const q  = search.toLowerCase();

  const allEvents = db.get('events')
    .filter((ev) =>
      !q ||
      ev.title?.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q) ||
      ev.location?.toLowerCase().includes(q)
    )
    .sortBy('date')
    .value();

  const total      = allEvents.length;
  const offset     = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const paginated  = allEvents.slice(offset, offset + parseInt(limit, 10));
  const enriched   = paginated.map((ev) => enrichEvent(db, ev));

  const result = {
    events:     enriched,
    total,
    page:       parseInt(page, 10),
    limit:      parseInt(limit, 10),
    totalPages: Math.max(1, Math.ceil(total / parseInt(limit, 10))),
  };

  cache.set(cacheKey, result, 60);
  res.json(result);
}

function getEvent(req, res) {
  const db    = getDb();
  const event = db.get('events').find({ id: req.params.id }).value();
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(enrichEvent(db, event));
}

function createEvent(req, res) {
  const { title, description = '', date, location = '' } = req.body;
  const db  = getDb();
  const now = new Date().toISOString();
  const event = {
    id:          uuidv4(),
    title,
    description,
    date,
    location,
    createdBy:   req.user.id,
    createdAt:   now,
    updatedAt:   now,
  };

  db.get('events').push(event).write();
  invalidateCache(CACHE_PREFIX);
  res.status(201).json(enrichEvent(db, event));
}

function updateEvent(req, res) {
  const { title, description = '', date, location = '' } = req.body;
  const db = getDb();

  const existing = db.get('events').find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  db.get('events').find({ id: req.params.id }).assign({
    title, description, date, location, updatedAt: new Date().toISOString(),
  }).write();

  invalidateCache(CACHE_PREFIX);
  const updated = db.get('events').find({ id: req.params.id }).value();
  res.json(enrichEvent(db, updated));
}

function deleteEvent(req, res) {
  const db = getDb();
  const existing = db.get('events').find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  db.get('events').remove({ id: req.params.id }).write();
  db.get('rsvps').remove({ eventId: req.params.id }).write(); // cascade
  invalidateCache(CACHE_PREFIX);
  res.json({ message: 'Event deleted successfully' });
}

/** Toggle RSVP — returns rsvped:true on create, rsvped:false on cancel */
function rsvpEvent(req, res) {
  const db    = getDb();
  const event = db.get('events').find({ id: req.params.id }).value();
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const already = db.get('rsvps').find({ userId: req.user.id, eventId: req.params.id }).value();
  if (already) {
    db.get('rsvps').remove({ userId: req.user.id, eventId: req.params.id }).write();
    return res.json({ message: 'RSVP cancelled', rsvped: false });
  }

  db.get('rsvps').push({
    id:        uuidv4(),
    userId:    req.user.id,
    eventId:   req.params.id,
    createdAt: new Date().toISOString(),
  }).write();

  res.status(201).json({ message: 'RSVP successful', rsvped: true });
}

function getMyRsvps(req, res) {
  const db      = getDb();
  const rsvpIds = db.get('rsvps').filter({ userId: req.user.id }).map('eventId').value();
  const events  = db.get('events')
    .filter((ev) => rsvpIds.includes(ev.id))
    .sortBy('date')
    .value();
  res.json(events);
}

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, rsvpEvent, getMyRsvps };
