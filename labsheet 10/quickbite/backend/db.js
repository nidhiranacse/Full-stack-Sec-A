'use strict';
/**
 * Database layer (SQLite via better-sqlite3).
 * Tables:
 *   menu_items  -> MenuItem  (name, price, category, isAvailable)
 *   orders      -> Order     (customerName, phone, address, items[], totalAmount, status, createdAt)
 * The order's items array is stored as JSON text (snapshot of itemId/name/price/qty).
 */
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'quickbite.db');
const db = new Database(DB_FILE);

db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    price       REAL    NOT NULL CHECK (price > 0),
    category    TEXT    NOT NULL DEFAULT 'Main Course',
    isAvailable INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    phone        TEXT NOT NULL,
    address      TEXT NOT NULL,
    items        TEXT NOT NULL,
    totalAmount  REAL NOT NULL,
    status       TEXT NOT NULL DEFAULT 'Placed',
    createdAt    TEXT NOT NULL
  );
`);

// Seed sample menu on first run (skipped in tests)
const SEED = [
  ['Paneer Tikka', 180, 'Starters', 1],
  ['Veg Spring Rolls', 120, 'Starters', 1],
  ['Chicken Wings', 220, 'Starters', 1],
  ['Butter Chicken', 320, 'Main Course', 1],
  ['Paneer Butter Masala', 260, 'Main Course', 1],
  ['Dal Makhani', 190, 'Main Course', 1],
  ['Veg Biryani', 200, 'Main Course', 1],
  ['Chicken Biryani', 280, 'Main Course', 0],
  ['Gulab Jamun', 80, 'Desserts', 1],
  ['Chocolate Brownie', 110, 'Desserts', 1],
  ['Masala Chai', 40, 'Drinks', 1],
  ['Fresh Lime Soda', 60, 'Drinks', 1],
  ['Mango Lassi', 90, 'Drinks', 0]
];

if (process.env.NODE_ENV !== 'test') {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM menu_items').get();
  if (n === 0) {
    const insert = db.prepare(
      'INSERT INTO menu_items (name, price, category, isAvailable) VALUES (?, ?, ?, ?)'
    );
    SEED.forEach((row) => insert.run(...row));
    console.log(`Seeded ${SEED.length} sample menu items.`);
  }
}

module.exports = db;
