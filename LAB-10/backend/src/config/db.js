const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.join(dbDir, 'campusconnect.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')) DEFAULT 'student',
      department TEXT DEFAULT 'Computer Science',
      semester TEXT DEFAULT '6th Sem',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Tech Fest')),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      total_seats INTEGER NOT NULL CHECK(total_seats > 0),
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Material')),
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      download_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Performance Indexes for search and relationships
    CREATE INDEX IF NOT EXISTS idx_events_category_date ON events(category, date);
    CREATE INDEX IF NOT EXISTS idx_events_title ON events(title);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_resources_subject_sem ON resources(subject, semester);
  `);
}

initSchema();

module.exports = db;
