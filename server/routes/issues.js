
const express = require("express");
const db = require("../db/database");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function calculateFine(dueDate, returnDate) {
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  const returned = new Date(`${returnDate}T00:00:00.000Z`);
  const daysLate = Math.max(
    0,
    Math.floor((returned - due) / 86400000)
  );
  return daysLate * 2;
}

// Librarian: issue a book.
router.post("/", requireRole("librarian"), (req, res, next) => {
  try {
    const { member_id, book_id } = req.body || {};

    if (
      !Number.isInteger(member_id) || member_id < 1 ||
      !Number.isInteger(book_id) || book_id < 1
    ) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Valid member_id and book_id are required."
        }
      });
    }

    const issue = db.transaction(() => {
      const member = db.prepare(
        "SELECT id, role FROM members WHERE id = ?"
      ).get(member_id);

      if (!member || member.role !== "member") {
        const error = new Error("Member not found.");
        error.status = 404;
        error.code = "MEMBER_NOT_FOUND";
        throw error;
      }

      const book = db.prepare(
        "SELECT id FROM books WHERE id = ?"
      ).get(book_id);

      if (!book) {
        const error = new Error("Book not found.");
        error.status = 404;
        error.code = "BOOK_NOT_FOUND";
        throw error;
      }

      const active = db.prepare(`
        SELECT COUNT(*) AS count
        FROM issues
        WHERE member_id = ? AND returned_on IS NULL
      `).get(member_id).count;

      if (active >= 3) {
        const error = new Error("Member already has 3 active issues.");
        error.status = 409;
        error.code = "LIMIT_REACHED";
        throw error;
      }

      // Only one request can claim the last available copy.
      const update = db.prepare(`
        UPDATE books
        SET available_copies = available_copies - 1
        WHERE id = ? AND available_copies > 0
      `).run(book_id);

      if (update.changes !== 1) {
        const error = new Error("No copies are currently available.");
        error.status = 409;
        error.code = "NO_COPIES";
        throw error;
      }

      const issuedOn = todayUTC();
      const dueDate = addDays(issuedOn, 14);

      const result = db.prepare(`
        INSERT INTO issues (member_id, book_id, issued_on, due_date)
        VALUES (?, ?, ?, ?)
      `).run(member_id, book_id, issuedOn, dueDate);

      return db.prepare(
        "SELECT * FROM issues WHERE id = ?"
      ).get(result.lastInsertRowid);
    });

    return res.status(201).json(issue());
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message }
      });
    }
    next(error);
  }
});

// Librarian: return a book.
router.post("/:id/return", requireRole("librarian"), (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid issue ID."
        }
      });
    }

    const result = db.transaction(() => {
      const issue = db.prepare(
        "SELECT * FROM issues WHERE id = ?"
      ).get(id);

      if (!issue) {
        const error = new Error("Issue not found.");
        error.status = 404;
        error.code = "ISSUE_NOT_FOUND";
        throw error;
      }

      if (issue.returned_on !== null) {
        const error = new Error("This issue has already been returned.");
        error.status = 409;
        error.code = "ALREADY_RETURNED";
        throw error;
      }

      const returnedOn = todayUTC();
      const fine = calculateFine(issue.due_date, returnedOn);

      db.prepare(`
        UPDATE issues
        SET returned_on = ?, fine = ?
        WHERE id = ? AND returned_on IS NULL
      `).run(returnedOn, fine, id);

      db.prepare(`
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = ?
      `).run(issue.book_id);

      return { fine, returned_on: returnedOn };
    });

    return res.json(result());
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message }
      });
    }
    next(error);
  }
});

// Librarian: view overdue issues.
router.get("/overdue", requireRole("librarian"), (req, res) => {
  const rows = db.prepare(`
    SELECT i.id, m.name AS member_name, b.title AS book_title,
           i.issued_on, i.due_date,
           CAST(julianday(?) - julianday(i.due_date) AS INTEGER)
             AS days_overdue,
           CAST(julianday(?) - julianday(i.due_date) AS INTEGER) * 2
             AS fine
    FROM issues i
    JOIN members m ON m.id = i.member_id
    JOIN books b ON b.id = i.book_id
    WHERE i.returned_on IS NULL AND date(i.due_date) < date(?)
    ORDER BY i.due_date
  `).all(todayUTC(), todayUTC(), todayUTC());

  res.json(rows);
});

// Member: view only their own issues.
router.get("/mine", (req, res) => {
  if (req.user.role !== "member") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "This endpoint is for library members."
      }
    });
  }

  const rows = db.prepare(`
    SELECT i.id, b.title, b.author, i.issued_on,
           i.due_date, i.returned_on, i.fine
    FROM issues i
    JOIN books b ON b.id = i.book_id
    WHERE i.member_id = ?
    ORDER BY i.id
  `).all(req.user.id);

  res.json(rows);
});

module.exports = { router, calculateFine };
