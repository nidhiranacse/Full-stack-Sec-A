
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(__dirname, "booknest.db");

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

// Improve reliability for concurrent database access
db.pragma("journal_mode = WAL");

module.exports = db;
