const bcrypt = require("bcryptjs");
const db = require("./db/database");

const seed = db.transaction(() => {
  db.prepare("DELETE FROM issues").run();
  db.prepare("DELETE FROM books").run();
  db.prepare("DELETE FROM members").run();

  db.prepare(`
    INSERT INTO members (id, name, email, role, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMember = db.prepare(`
    INSERT INTO members (id, name, email, role, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `);

  const passwordHash = bcrypt.hashSync("Pass@123", 12);

  [
    [1, "Admin", "admin@lib.example", "librarian"],
    [2, "Aarav", "aarav@lib.example", "member"],
    [3, "Meera", "meera@lib.example", "member"],
    [4, "Rohan", "rohan@lib.example", "member"]
  ].forEach((member) => {
    insertMember.run(...member, passwordHash);
  });

  const insertBook = db.prepare(`
    INSERT INTO books
      (id, code, title, author, total_copies, available_copies)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  [
    [1, "LIB-1001", "The Pragmatic Programmer", "Hunt & Thomas", 2, 2],
    [2, "LIB-1002", "Clean Code", "Robert C. Martin", 1, 1],
    [3, "LIB-1003", "Operating System Concepts", "Silberschatz", 3, 3],
    [4, "LIB-1004", "Database System Concepts", "Silberschatz", 1, 0],
    [5, "LIB-1005", "Computer Networks", "Tanenbaum", 2, 2]
  ].forEach((book) => insertBook.run(...book));

  const today = new Date();
  const issuedDate = new Date(today);
  issuedDate.setUTCDate(issuedDate.getUTCDate() - 20);

  const dueDate = new Date(today);
  dueDate.setUTCDate(dueDate.getUTCDate() - 6);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO issues
      (id, member_id, book_id, issued_on, due_date, returned_on, fine)
    VALUES (1, 4, 4, ?, ?, NULL, 0)
  `).run(formatDate(issuedDate), formatDate(dueDate));
});

try {
  seed();
  console.log("BookNest database seeded successfully.");
  console.log("Login password for all users: Pass@123");
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}