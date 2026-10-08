const bcrypt = require("bcryptjs");
const db = require("./db/database");

db.exec(`
DELETE FROM issues;
DELETE FROM books;
DELETE FROM members;
`);

const hash = bcrypt.hashSync("Pass@123", 10);

const memberStmt = db.prepare(`
INSERT INTO members (id, name, email, password_hash, role)
VALUES (?, ?, ?, ?, ?)
`);

memberStmt.run(1, "Admin", "admin@lib.example", hash, "librarian");
memberStmt.run(2, "Aarav", "aarav@lib.example", hash, "member");
memberStmt.run(3, "Meera", "meera@lib.example", hash, "member");
memberStmt.run(4, "Rohan", "rohan@lib.example", hash, "member");

const bookStmt = db.prepare(`
INSERT INTO books
(id, code, title, author, total_copies, available_copies)
VALUES (?, ?, ?, ?, ?, ?)
`);

bookStmt.run(
  1,
  "LIB-1001",
  "The Pragmatic Programmer",
  "Hunt & Thomas",
  2,
  2
);

bookStmt.run(
  2,
  "LIB-1002",
  "Clean Code",
  "Robert C. Martin",
  1,
  1
);

bookStmt.run(
  3,
  "LIB-1003",
  "Operating System Concepts",
  "Silberschatz",
  3,
  3
);

bookStmt.run(
  4,
  "LIB-1004",
  "Database System Concepts",
  "Silberschatz",
  1,
  0
);

bookStmt.run(
  5,
  "LIB-1005",
  "Computer Networks",
  "Tanenbaum",
  2,
  2
);

// Seed issue: Rohan, book 4, issued 20 days ago
const issued = new Date();
issued.setDate(issued.getDate() - 20);

const due = new Date();
due.setDate(due.getDate() - 6);

db.prepare(`
INSERT INTO issues
(member_id, book_id, issued_on, due_on, returned_on, fine)
VALUES (?, ?, ?, ?, NULL, 0)
`).run(
  4,
  4,
  issued.toISOString(),
  due.toISOString()
);

console.log("Database seeded successfully.");
db.close();