// Author: Radha Pandey, CSE - CampusConnect
const { Sequelize, Op, literal } = require('sequelize');
const { HttpError } = require('../middleware/errors');

const seatsLeft = (capacity, registered) => Math.max(0, Number(capacity) - Number(registered || 0));

// Extra computed columns: number registered + whether the current user is registered
function eventAttributes(userId) {
  const uid = Number(userId) || 0;
  return {
    include: [
      [literal('(SELECT COUNT(*) FROM "registrations" AS r WHERE r."eventId" = "Event"."id")'), 'registered'],
      [
        literal(
          `EXISTS (SELECT 1 FROM "registrations" AS r2 WHERE r2."eventId" = "Event"."id" AND r2."userId" = ${uid})`
        ),
        'isRegistered',
      ],
    ],
  };
}

function serializeEvent(ev) {
  const j = ev.toJSON();
  j.registered = Number(j.registered || 0);
  j.seatsLeft = seatsLeft(j.capacity, j.registered);
  j.isRegistered = Boolean(Number(j.isRegistered));
  return j;
}

// Search by name, date (YYYY-MM-DD), category, upcoming flag
function buildEventWhere({ q, category, date, upcoming }) {
  const and = [];
  if (q) {
    const safe = String(q).toLowerCase().replace(/[%_]/g, (m) => '\\' + m);
    and.push(Sequelize.where(Sequelize.fn('lower', Sequelize.col('title')), { [Op.like]: `%${safe}%` }));
  }
  if (category) and.push({ category: String(category) });
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      throw new HttpError(400, 'date must be in YYYY-MM-DD format');
    }
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    and.push({ date: { [Op.gte]: start, [Op.lt]: end } });
  }
  if (upcoming === 'true') and.push({ date: { [Op.gte]: new Date() } });
  return and.length ? { [Op.and]: and } : {};
}

function parsePaging(query, defLimit = 10) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defLimit;
  limit = Math.min(limit, 50);
  return { page, limit, offset: (page - 1) * limit };
}

function parseId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'Invalid id');
  return n;
}

module.exports = { seatsLeft, eventAttributes, serializeEvent, buildEventWhere, parsePaging, parseId };
