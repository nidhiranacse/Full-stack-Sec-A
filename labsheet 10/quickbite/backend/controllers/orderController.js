'use strict';
const db = require('../db');
const { validateOrder, parseId, round2 } = require('../validators');

// Allowed forward flow. "Cancelled" is handled separately.
const STATUS_FLOW = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
const ALL_STATUSES = [...STATUS_FLOW, 'Cancelled'];

const mapOrder = (r) => ({
  id: r.id,
  customerName: r.customerName,
  phone: r.phone,
  address: r.address,
  items: JSON.parse(r.items),
  totalAmount: r.totalAmount,
  status: r.status,
  createdAt: r.createdAt
});

const getById = (id) => db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

// POST /api/orders
exports.create = (req, res) => {
  const { errors, value } = validateOrder(req.body);
  if (errors.length) {
    return res
      .status(400)
      .json({ error: 'Validation failed: ' + errors.join('; '), details: errors });
  }

  // Look every item up in the database. Prices ALWAYS come from the DB,
  // never from the client.
  const problems = [];
  const items = [];
  let total = 0;

  const findItem = db.prepare('SELECT * FROM menu_items WHERE id = ?');
  for (const { itemId, qty } of value.lines) {
    const row = findItem.get(itemId);
    if (!row) {
      problems.push(`Item with id ${itemId} does not exist`);
    } else if (row.isAvailable !== 1) {
      problems.push(`"${row.name}" is currently unavailable`);
    } else {
      items.push({ itemId: row.id, name: row.name, price: row.price, qty });
      total += row.price * qty;
    }
  }
  if (problems.length) {
    return res
      .status(400)
      .json({ error: 'Cannot place order: ' + problems.join('; '), details: problems });
  }

  const info = db
    .prepare(
      `INSERT INTO orders (customerName, phone, address, items, totalAmount, status, createdAt)
       VALUES (?, ?, ?, ?, ?, 'Placed', ?)`
    )
    .run(
      value.customerName,
      value.phone,
      value.address,
      JSON.stringify(items),
      round2(total),
      new Date().toISOString()
    );

  res.status(201).json(mapOrder(getById(Number(info.lastInsertRowid))));
};

// GET /api/orders  (latest first)
exports.list = (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC, id DESC').all();
  res.status(200).json(rows.map(mapOrder));
};

// PATCH /api/orders/:id/status   body: { "status": "Preparing" }
exports.updateStatus = (req, res) => {
  const id = parseId(req.params.id);
  const row = id === null ? null : getById(id);
  if (!row) return res.status(404).json({ error: 'Order not found' });

  const next = req.body && req.body.status;
  if (typeof next !== 'string' || !ALL_STATUSES.includes(next)) {
    return res.status(400).json({
      error: `status must be one of: ${ALL_STATUSES.join(', ')}`
    });
  }

  const current = row.status;

  if (current === 'Delivered' || current === 'Cancelled') {
    return res
      .status(400)
      .json({ error: `Order is already ${current} and can no longer be changed` });
  }

  if (next === 'Cancelled') {
    if (current !== 'Placed') {
      return res.status(400).json({
        error: `An order can be cancelled only while its status is "Placed" (current: "${current}")`
      });
    }
  } else {
    // Only one step forward at a time: Placed -> Preparing -> Out for Delivery -> Delivered
    const expected = STATUS_FLOW[STATUS_FLOW.indexOf(current) + 1];
    if (next !== expected) {
      return res.status(400).json({
        error: `Invalid status change: "${current}" can only move forward to "${expected}"`
      });
    }
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(next, id);
  res.status(200).json(mapOrder(getById(id)));
};
