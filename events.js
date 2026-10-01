const router = require('express').Router();
const { z } = require('zod');
const Event = require('../models/Event');
const redis = require('../config/redis');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const CACHE_TTL = 60; // seconds
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false'; // toggle used only for benchmarking
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.preprocess((v) => (v === undefined || v === '' ? undefined : new Date(v)),
    z.date({ error: 'Date is required and must be a valid date' })),
});
const invalidate = async () => { const keys = await redis.keys('events:*'); if (keys.length) await redis.del(...keys); };

// GET /api/events?page=1&limit=6&search=title  -> cached 60s in Redis
router.get('/', authenticate, async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 6, 50);
  const search = (req.query.search || '').trim();
  const key = `events:list:${page}:${limit}:${search.toLowerCase()}`;
  const cached = CACHE_ENABLED ? await redis.get(key) : null;
  if (cached) { res.set('X-Cache', 'HIT'); return res.json(JSON.parse(cached)); }
  const filter = search ? { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {};
  const [items, total] = await Promise.all([
    Event.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);
  const payload = { items, total, page, pages: Math.ceil(total / limit) || 1 };
  if (CACHE_ENABLED) await redis.set(key, JSON.stringify(payload), 'EX', CACHE_TTL);
  res.set('X-Cache', CACHE_ENABLED ? 'MISS' : 'BYPASS');
  res.json(payload);
});

router.post('/', authenticate, authorize('ADMIN'), validate(eventSchema), async (req, res) => {
  const ev = await Event.create({ ...req.body, createdBy: req.user.id });
  await invalidate();
  res.status(201).json(ev);
});
router.put('/:id', authenticate, authorize('ADMIN'), validate(eventSchema), async (req, res) => {
  const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  await invalidate();
  res.json(ev);
});
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const ev = await Event.findByIdAndDelete(req.params.id);
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  await invalidate();
  res.json({ message: 'Deleted' });
});
// RSVP toggle (students)
router.post('/:id/rsvp', authenticate, authorize('STUDENT'), async (req, res) => {
  const ev = await Event.findById(req.params.id);
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  const has = ev.rsvps.some((u) => String(u) === String(req.user.id));
  ev.rsvps = has ? ev.rsvps.filter((u) => String(u) !== String(req.user.id)) : [...ev.rsvps, req.user.id];
  await ev.save();
  await invalidate();
  res.json({ rsvped: !has, count: ev.rsvps.length });
});
module.exports = router;
