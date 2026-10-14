
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./db/database");

// Create tables and index
const schema = fs.readFileSync(
  path.join(__dirname, "db", "schema.sql"),
  "utf8"
);
db.exec(schema);

const seed = db.transaction(() => {
  // Clear previous seed data
  db.prepare("DELETE FROM issues").run();
  db.prepare("DELETE FROM books").run();
  db.prepare("DELETE FROM members").run();

  const passwordHash = bcrypt.hashSync("Pass@123", 10);

  const addMember = db.prepare(`
    INSERT INTO members (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  addMember.run(1, "Admin", "admin@lib.example", passwordHash, "librarian");
  addMember.run(2, "Aarav", "aarav@lib.example", passwordHash, "member");
  addMember.run(3, "Meera", "meera@lib.example", passwordHash, "member");
  addMember.run(4, "Rohan", "rohan@lib.example", passwordHash, "member");

  const addBook = db.prepare(`
    INSERT INTO books
    (id, code, title, author, total_copies, available_copies)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  addBook.run(1, "LIB-1001", "The Pragmatic Programmer", "Hunt & Thomas", 2, 2);
  addBook.run(2, "LIB-1002", "Clean Code", "Robert C. Martin", 1, 1);
  addBook.run(3, "LIB-1003", "Operating System Concepts", "Silberschatz", 3, 3);
  addBook.run(4, "LIB-1004", "Database System Concepts", "Silberschatz", 1, 0);
  addBook.run(5, "LIB-1005", "Computer Networks", "Tanenbaum", 2, 2);

  // Seed issue: Rohan borrowed book 4 twenty days ago.
  const dateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  };

  db.prepare(`
    INSERT INTO issues
    (id, member_id, book_id, issued_on, due_date, returned_on, fine)
    VALUES (1, 4, 4, ?, ?, NULL, 0)
  `).run(dateDaysAgo(20), dateDaysAgo(6));
});

try {
  seed();
  console.log("BookNest database seeded successfully!");
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
