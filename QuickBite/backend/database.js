
const Database = require("better-sqlite3");
const path = require("path");

// Create or open the database file inside the backend folder
const dbPath = path.join(__dirname, "quickbite.db");
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

// Table 1: Menu items
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    category TEXT NOT NULL,
    isAvailable INTEGER NOT NULL DEFAULT 1
      CHECK (isAvailable IN (0, 1)),
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Table 2: Customer orders
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (length(phone) = 10),
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL CHECK (totalAmount >= 0),
    status TEXT NOT NULL DEFAULT 'Placed'
      CHECK (
        status IN (
          'Placed',
          'Preparing',
          'Out for Delivery',
          'Delivered',
          'Cancelled'
        )
      ),
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("QuickBite database connected successfully.");

module.exports = db;
