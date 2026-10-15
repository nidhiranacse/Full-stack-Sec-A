/**
 * Student Model & Database Access Layer using SQLite
 * Lab Sheet 09 - Student Record Management
 * Student: Rahul Raj (cu24250116)
 * Course: Full Stack Web Development (Sec-A)
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'students.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize students table schema
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rollNo TEXT UNIQUE NOT NULL,
    course TEXT NOT NULL,
    marks REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed initial records if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM students');
const rowCount = countStmt.get().count;

if (rowCount === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO students (name, rollNo, course, marks)
    VALUES (?, ?, ?, ?)
  `);
  insertStmt.run('Rahul Raj', 'cu24250116', 'B.Tech CSE - Full Stack', 98.5);
  insertStmt.run('Aarav Sharma', 'cu24250101', 'B.Tech CSE - Cloud Computing', 92.0);
  insertStmt.run('Diya Patel', 'cu24250145', 'B.Tech CSE - AI & ML', 89.5);
  insertStmt.run('Ishaan Verma', 'cu24250189', 'B.Tech CSE - Cyber Security', 84.0);
  insertStmt.run('Ananya Sengupta', 'cu24250212', 'B.Tech CSE - Data Science', 95.0);
}

const Student = {
  findAll() {
    const stmt = db.prepare('SELECT * FROM students ORDER BY id DESC');
    return stmt.all();
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    return stmt.get(Number(id));
  },

  findByRollNo(rollNo, excludeId = null) {
    if (excludeId) {
      const stmt = db.prepare('SELECT * FROM students WHERE rollNo = ? AND id != ?');
      return stmt.get(rollNo, Number(excludeId));
    }
    const stmt = db.prepare('SELECT * FROM students WHERE rollNo = ?');
    return stmt.get(rollNo);
  },

  create({ name, rollNo, course, marks }) {
    const stmt = db.prepare(`
      INSERT INTO students (name, rollNo, course, marks, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(name, rollNo, course, Number(marks));
    return this.findById(result.lastInsertRowid);
  },

  update(id, { name, rollNo, course, marks }) {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE students
      SET name = ?, rollNo = ?, course = ?, marks = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      name !== undefined ? name : existing.name,
      rollNo !== undefined ? rollNo : existing.rollNo,
      course !== undefined ? course : existing.course,
      marks !== undefined ? Number(marks) : existing.marks,
      Number(id)
    );
    return this.findById(id);
  },

  delete(id) {
    const existing = this.findById(id);
    if (!existing) return false;

    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    stmt.run(Number(id));
    return true;
  }
};

module.exports = Student;
