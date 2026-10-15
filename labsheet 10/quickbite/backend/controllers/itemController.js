'use strict';
const db = require('../db');
const { validateItem, parseId } = require('../validators');

const mapItem = (r) => ({
  id: r.id,
  name: r.name,
  price: r.price,
  category: r.category,
  isAvailable: r.isAvailable === 1
});

const getById = (id) => db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
const sendValidationError = (res, errors) =>
  res.status(400).json({ error: 'Validation failed: ' + errors.join('; '), details: errors });

// GET /api/items?search=&category=
exports.list = (req, res) => {
  const { search, category } = req.query;
  const where = [];
  const params = [];

  if (typeof search === 'string' && search.trim()) {
    where.push('instr(lower(name), lower(?)) > 0');
    params.push(search.trim());
  }
  if (typeof category === 'string' && category.trim()) {
    where.push('lower(category) = lower(?)');
    params.push(category.trim());
  }

  const sql =
    'SELECT * FROM menu_items' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY category COLLATE NOCASE, name COLLATE NOCASE';

  res.status(200).json(db.prepare(sql).all(...params).map(mapItem));
};

// POST /api/items
exports.create = (req, res) => {
  const { errors, value } = validateItem(req.body, null);
  if (errors.length) return sendValidationError(res, errors);

  const info = db
    .prepare('INSERT INTO menu_items (name, price, category, isAvailable) VALUES (?, ?, ?, ?)')
    .run(value.name, value.price, value.category, value.isAvailable ? 1 : 0);

  res.status(201).json(mapItem(getById(Number(info.lastInsertRowid))));
};

// PUT /api/items/:id
exports.update = (req, res) => {
  const id = parseId(req.params.id);
  const row = id === null ? null : getById(id);
  if (!row) return res.status(404).json({ error: 'Menu item not found' });

  const { errors, value } = validateItem(req.body, mapItem(row));
  if (errors.length) return sendValidationError(res, errors);

  db.prepare(
    'UPDATE menu_items SET name = ?, price = ?, category = ?, isAvailable = ? WHERE id = ?'
  ).run(value.name, value.price, value.category, value.isAvailable ? 1 : 0, id);

  res.status(200).json(mapItem(getById(id)));
};

// DELETE /api/items/:id
exports.remove = (req, res) => {
  const id = parseId(req.params.id);
  const row = id === null ? null : getById(id);
  if (!row) return res.status(404).json({ error: 'Menu item not found' });

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  res.status(200).json({ message: 'Menu item deleted', id });
};
