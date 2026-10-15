// Author: Radha Pandey, CSE - CampusConnect
const express = require('express');
const { Op, literal } = require('sequelize');
const { Event, Registration, Resource, User } = require('../db');
const { asyncHandler } = require('../middleware/errors');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Student dashboard: my events + latest resources
router.get(
  '/student',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const regs = await Registration.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, attributes: ['id', 'title', 'date', 'venue', 'category'] }],
      order: [['createdAt', 'DESC']],
    });
    const now = new Date();
    const mapped = regs.map((r) => ({ registrationId: r.id, registeredAt: r.createdAt, event: r.Event }));
    const latestResources = await Resource.findAll({
      attributes: { exclude: ['filename'] },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    res.json({
      totalRegistrations: mapped.length,
      upcoming: mapped.filter((m) => new Date(m.event.date) >= now),
      history: mapped.filter((m) => new Date(m.event.date) < now),
      latestResources,
    });
  })
);

// Admin dashboard: analytics
router.get(
  '/admin',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const [totalEvents, totalRegistrations, totalStudents, totalResources, upcomingEvents, topEvents] =
      await Promise.all([
        Event.count(),
        Registration.count(),
        User.count({ where: { role: 'student' } }),
        Resource.count(),
        Event.count({ where: { date: { [Op.gte]: new Date() } } }),
        Event.findAll({
          attributes: [
            'id',
            'title',
            'capacity',
            [literal('(SELECT COUNT(*) FROM "registrations" AS r WHERE r."eventId" = "Event"."id")'), 'registered'],
          ],
          order: [[literal('"registered"'), 'DESC']],
          limit: 5,
        }),
      ]);
    res.json({
      totalEvents,
      totalRegistrations,
      totalStudents,
      totalResources,
      upcomingEvents,
      topEvents: topEvents.map((e) => ({ ...e.toJSON(), registered: Number(e.get('registered')) })),
    });
  })
);

module.exports = router;
