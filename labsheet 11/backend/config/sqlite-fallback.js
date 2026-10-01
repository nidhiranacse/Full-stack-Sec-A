// ============================================
// Built-in SQLite Fallback Engine
// Automatically activates when MySQL is not running
// ============================================
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'database', 'campus_connect.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new DatabaseSync(dbPath);

// Enable foreign key support
sqlite.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'admin')) DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other',
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 50,
    available_seats INTEGER NOT NULL DEFAULT 50,
    image_url TEXT DEFAULT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other',
    subject TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed default data if users table is empty
const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
    const insertUser = sqlite.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    insertUser.run('Admin User', 'admin@campus.com', '$2b$10$dJOPgd9KThedFUlR0Nwvn.pGW5B7sxFesaXpm7ir0ZcBkMpA.5OY.', 'admin');
    insertUser.run('Aarav Sharma', 'aarav@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student');
    insertUser.run('Priya Patel', 'priya@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student');
    insertUser.run('Rohan Gupta', 'rohan@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student');
    insertUser.run('Sneha Reddy', 'sneha@student.com', '$2b$10$OD1BW/l8xZxiorU4yANuOunWoifCzOcNMSE/bCIa6VSdUcz/QU2nO', 'student');

    const insertEvent = sqlite.prepare(`
        INSERT INTO events (title, description, category, event_date, event_time, venue, total_seats, available_seats, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertEvent.run('Web Development Bootcamp', 'A 3-day intensive workshop on modern web development with React, Node.js, and databases. Learn to build full-stack applications from scratch.', 'workshop', '2026-10-15', '09:00:00', 'Computer Lab 3, Block A', 60, 58, 1);
    insertEvent.run('HackFusion 2026', 'Annual 24-hour hackathon. Build innovative solutions for real-world problems. Amazing prizes and networking opportunities await!', 'hackathon', '2026-10-20', '10:00:00', 'Auditorium Hall, Main Building', 200, 197, 1);
    insertEvent.run('AI & Machine Learning Seminar', 'Expert talk on the latest trends in AI/ML, career paths, and hands-on demo of building a simple neural network.', 'seminar', '2026-10-08', '14:00:00', 'Seminar Hall 2, Block B', 100, 98, 1);
    insertEvent.run('TCS Campus Placement Drive', 'TCS is visiting our campus for recruitment. Eligible branches: CSE, IT, ECE. Minimum 7.0 CGPA required.', 'placement', '2026-11-05', '08:30:00', 'Placement Cell, Admin Block', 150, 148, 1);
    insertEvent.run('Cultural Fest – Resonance 2026', 'Annual cultural festival featuring music, dance, drama, art exhibitions and food stalls. Open to all students.', 'cultural', '2026-11-12', '16:00:00', 'Open Air Theatre', 500, 498, 1);
    insertEvent.run('Data Structures Workshop', 'Master arrays, linked lists, trees, and graphs with hands-on coding exercises in C++ and Java.', 'workshop', '2026-10-25', '10:00:00', 'Computer Lab 1, Block A', 40, 40, 1);
    insertEvent.run('Infosys Placement Drive', 'Infosys hiring for SE and DSE roles. Online test followed by interview rounds. All branches eligible with 6.5+ CGPA.', 'placement', '2026-11-18', '09:00:00', 'Placement Cell, Admin Block', 120, 120, 1);
    insertEvent.run('Cybersecurity Awareness Seminar', 'Learn about ethical hacking, common vulnerabilities, and how to protect your digital identity. Live demo included.', 'seminar', '2026-10-30', '15:00:00', 'Seminar Hall 1, Block C', 80, 80, 1);

    const insertReg = sqlite.prepare('INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)');
    insertReg.run(2, 1);
    insertReg.run(2, 2);
    insertReg.run(2, 3);
    insertReg.run(3, 1);
    insertReg.run(3, 2);
    insertReg.run(4, 2);
    insertReg.run(4, 4);
    insertReg.run(5, 3);
    insertReg.run(5, 4);

    sqlite.exec(`
        UPDATE events SET available_seats = total_seats - (
            SELECT COUNT(*) FROM event_registrations WHERE event_id = events.id
        )
    `);

    const insertRes = sqlite.prepare(`
        INSERT INTO resources (title, description, category, subject, file_url, file_name, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertRes.run('DBMS Unit 1 Notes', 'Comprehensive notes covering ER diagrams, relational model, and normalization.', 'notes', 'Database Management Systems', '/uploads/dbms_unit1_notes.pdf', 'dbms_unit1_notes.pdf', 1);
    insertRes.run('OS Previous Year Paper 2025', 'Operating Systems final exam paper from 2025 with solutions.', 'pyq', 'Operating Systems', '/uploads/os_pyq_2025.pdf', 'os_pyq_2025.pdf', 1);
    insertRes.run('DSA Assignment 3', 'Assignment on Trees and Graphs – Binary Trees, BST, BFS, DFS.', 'assignment', 'Data Structures & Algorithms', '/uploads/dsa_assignment3.pdf', 'dsa_assignment3.pdf', 1);
    insertRes.run('CN Unit 2 Notes', 'Notes on Data Link Layer, Error Detection, Flow Control, and Sliding Window Protocol.', 'notes', 'Computer Networks', '/uploads/cn_unit2_notes.pdf', 'cn_unit2_notes.pdf', 1);
    insertRes.run('Web Tech Reference Guide', 'Quick reference for HTML5, CSS3, JavaScript ES6+, and DOM manipulation.', 'reference', 'Web Technologies', '/uploads/webtech_reference.pdf', 'webtech_reference.pdf', 1);
}

// Format SQLite queries to match mysql2 API: [rows, fields]
function executeQuery(sql, params = []) {
    // Translate MySQL-specific syntax
    let translatedSql = sql
        .replace(/CURDATE\(\)/gi, "date('now')")
        .replace(/NOW\(\)/gi, "datetime('now')");

    const trimmed = translatedSql.trim();
    const isSelect = /^SELECT\b/i.test(trimmed);

    // Flatten parameters if passed as array
    const queryParams = Array.isArray(params) ? params : [];

    const stmt = sqlite.prepare(translatedSql);

    if (isSelect) {
        const rows = stmt.all(...queryParams);
        return [rows, []];
    } else {
        const info = stmt.run(...queryParams);
        return [
            {
                insertId: Number(info.lastInsertRowid),
                affectedRows: info.changes,
                changes: info.changes
            },
            []
        ];
    }
}

const sqliteAdapter = {
    query: async (sql, params) => executeQuery(sql, params),
    getConnection: async () => ({
        query: async (sql, params) => executeQuery(sql, params),
        beginTransaction: async () => sqlite.exec('BEGIN TRANSACTION'),
        commit: async () => sqlite.exec('COMMIT'),
        rollback: async () => sqlite.exec('ROLLBACK'),
        release: () => {}
    })
};

module.exports = sqliteAdapter;
