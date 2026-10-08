const express = require("express");
const db = require("../db/database");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

function calculateFine(dueDate, returnDate) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  const daysLate = Math.floor(
    (returned - due) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysLate) * 2;
}

// Issue a book
router.post("/", authenticate, requireRole("librarian"), (req, res, next) => {
  try {
    const { member_id, book_id } = req.body;

    if (!member_id || !book_id) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "member_id and book_id are required"
        }
      });
    }

    const transaction = db.transaction(() => {
      // Check member
      const member = db.prepare(`
        SELECT id FROM members
        WHERE id = ? AND role = 'member'
      `).get(member_id);

      if (!member) {
        const err = new Error("Member not found");
        err.status = 404;
        err.code = "MEMBER_NOT_FOUND";
        throw err;
      }

      // Check active issue limit
      const active = db.prepare(`
        SELECT COUNT(*) AS count
        FROM issues
        WHERE member_id = ? AND returned_on IS NULL
      `).get(member_id);

      if (active.count >= 3) {
        const err = new Error("Member already has 3 active issues");
        err.status = 409;
        err.code = "LIMIT_REACHED";
        throw err;
      }

      // Check book
      const book = db.prepare(`
        SELECT id FROM books WHERE id = ?
      `).get(book_id);

      if (!book) {
        const err = new Error("Book not found");
        err.status = 404;
        err.code = "BOOK_NOT_FOUND";
        throw err;
      }

      // Decrease available copy atomically
      const update = db.prepare(`
        UPDATE books
        SET available_copies = available_copies - 1
        WHERE id = ? AND available_copies > 0
      `).run(book_id);

      if (update.changes !== 1) {
        const err = new Error("No copies available");
        err.status = 409;
        err.code = "NO_COPIES";
        throw err;
      }

      const issuedOn = new Date();
      const dueOn = new Date();
      dueOn.setDate(dueOn.getDate() + 14);

      const result = db.prepare(`
        INSERT INTO issues
        (member_id, book_id, issued_on, due_on)
        VALUES (?, ?, ?, ?)
      `).run(
        member_id,
        book_id,
        issuedOn.toISOString(),
        dueOn.toISOString()
      );

      return {
        id: result.lastInsertRowid,
        member_id,
        book_id,
        issued_on: issuedOn.toISOString(),
        due_on: dueOn.toISOString()
      };
    });

    res.status(201).json(transaction());
  } catch (err) {
    next(err);
  }
});

// Return a book
router.post(
  "/:id/return",
  authenticate,
  requireRole("librarian"),
  (req, res, next) => {
    try {
      const transaction = db.transaction(() => {
        const issue = db.prepare(`
          SELECT * FROM issues WHERE id = ?
        `).get(req.params.id);

        if (!issue) {
          const err = new Error("Issue not found");
          err.status = 404;
          err.code = "NOT_FOUND";
          throw err;
        }

        if (issue.returned_on) {
          const err = new Error("Issue already returned");
          err.status = 409;
          err.code = "ALREADY_RETURNED";
          throw err;
        }

        const returnedOn = new Date();
        const fine = calculateFine(issue.due_on, returnedOn);

        db.prepare(`
          UPDATE issues
          SET returned_on = ?, fine = ?
          WHERE id = ?
        `).run(returnedOn.toISOString(), fine, issue.id);

        db.prepare(`
          UPDATE books
          SET available_copies = available_copies + 1
          WHERE id = ?
        `).run(issue.book_id);

        return fine;
      });

      const fine = transaction();

      res.json({ fine });
    } catch (err) {
      next(err);
    }
  }
);

// Overdue issues - librarian only
router.get(
  "/overdue",
  authenticate,
  requireRole("librarian"),
  (req, res, next) => {
    try {
      const rows = db.prepare(`
        SELECT
          issues.id,
          members.name AS member_name,
          books.title AS book_title,
          CAST(
            julianday('now') - julianday(issues.due_on)
            AS INTEGER
          ) AS days_overdue,
          CAST(
            julianday('now') - julianday(issues.due_on)
            AS INTEGER
          ) * 2 AS fine
        FROM issues
        JOIN members ON members.id = issues.member_id
        JOIN books ON books.id = issues.book_id
        WHERE issues.returned_on IS NULL
        AND datetime(issues.due_on) < datetime('now')
      `).all();

      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// Member's own issues
router.get("/mine", authenticate, (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT
        issues.id,
        books.code,
        books.title,
        books.author,
        issues.issued_on,
        issues.due_on,
        issues.returned_on,
        issues.fine
      FROM issues
      JOIN books ON books.id = issues.book_id
      WHERE issues.member_id = ?
      ORDER BY issues.id
    `).all(req.user.id);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.calculateFine = calculateFine;