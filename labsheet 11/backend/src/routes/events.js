// Author: Radha Pandey, CSE - CampusConnect
const express = require('express');
const { sequelize, Event, Registration, User } = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const { authenticate, authorize } = require('../middleware/auth');
const { validateEvent } = require('../utils/validators');
const {
  eventAttributes,
  serializeEvent,
  buildEventWhere,
  parsePaging,
  parseId,
} = require('../utils/events');

const router = express.Router();
router.use(authenticate);

async function findEventOr404(id, userId) {
  const ev = await Event.findByPk(id, { attributes: eventAttributes(userId) });
  if (!ev) throw new HttpError(404, 'Event not found');
  return ev;
}

// GET /api/events?q=&category=&date=YYYY-MM-DD&upcoming=true&page=1&limit=10
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePaging(req.query);
    const where = buildEventWhere(req.query);
    const [total, rows] = await Promise.all([
      Event.count({ where }),
      Event.findAll({
        where,
        attributes: eventAttributes(req.user.id),
        order: [['date', 'ASC'], ['id', 'ASC']],
        limit,
        offset,
      }),
    ]);
    res.json({ data: rows.map(serializeEvent), page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  })
);

// Student: registration history
router.get(
  '/my',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const regs = await Registration.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, attributes: ['id', 'title', 'date', 'venue', 'category'] }],
      order: [['createdAt', 'DESC']],
    });
    const now = new Date();
    res.json({
      data: regs.map((r) => ({
        registrationId: r.id,
        registeredAt: r.createdAt,
        isPast: new Date(r.Event.date) < now,
        event: r.Event,
      })),
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(serializeEvent(await findEventOr404(parseId(req.params.id), req.user.id)));
  })
);

// ---------- Admin CRUD ----------
router.post(
  '/',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { errors, values } = validateEvent(req.body, false);
    if (errors.length) throw new HttpError(400, 'Validation failed', errors);
    const ev = await Event.create({ ...values, createdBy: req.user.id });
    res.status(201).json(serializeEvent(await findEventOr404(ev.id, req.user.id)));
  })
);

router.put(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const ev = await Event.findByPk(id);
    if (!ev) throw new HttpError(404, 'Event not found');
    const { errors, values } = validateEvent(req.body, true);
    if (errors.length) throw new HttpError(400, 'Validation failed', errors);
    if (values.capacity !== undefined) {
      const registered = await Registration.count({ where: { eventId: id } });
      if (values.capacity < registered) {
        throw new HttpError(400, `capacity cannot be lower than current registrations (${registered})`);
      }
    }
    await ev.update(values);
    res.json(serializeEvent(await findEventOr404(id, req.user.id)));
  })
);

router.delete(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const ev = await Event.findByPk(id);
    if (!ev) throw new HttpError(404, 'Event not found');
    await sequelize.transaction(async (t) => {
      await Registration.destroy({ where: { eventId: id }, transaction: t });
      await ev.destroy({ transaction: t });
    });
    res.status(204).send();
  })
);

router.get(
  '/:id/registrations',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!(await Event.findByPk(id))) throw new HttpError(404, 'Event not found');
    const regs = await Registration.findAll({
      where: { eventId: id },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json({
      total: regs.length,
      data: regs.map((r) => ({ ...r.User.toJSON(), registeredAt: r.createdAt })),
    });
  })
);

// ---------- Student register / unregister ----------
router.post(
  '/:id/register',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const eventId = parseId(req.params.id);
    const userId = req.user.id;
    // transaction + row lock => two students cannot take the last seat at once
    await sequelize.transaction(async (t) => {
      const ev = await Event.findByPk(eventId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!ev) throw new HttpError(404, 'Event not found');
      if (new Date(ev.date) < new Date()) throw new HttpError(400, 'Registration closed: event already started');
      if (await Registration.findOne({ where: { userId, eventId }, transaction: t })) {
        throw new HttpError(409, 'You are already registered for this event');
      }
      const count = await Registration.count({ where: { eventId }, transaction: t });
      if (count >= ev.capacity) throw new HttpError(409, 'Event is full');
      await Registration.create({ userId, eventId }, { transaction: t });
    });
    res.status(201).json(serializeEvent(await findEventOr404(eventId, userId)));
  })
);

router.delete(
  '/:id/register',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const eventId = parseId(req.params.id);
    const n = await Registration.destroy({ where: { eventId, userId: req.user.id } });
    if (!n) throw new HttpError(404, 'You are not registered for this event');
    res.status(204).send();
  })
);

module.exports = router;
