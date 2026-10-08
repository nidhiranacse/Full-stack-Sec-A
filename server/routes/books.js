const express = require("express");
const db = require("../db/database");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const search = req.query.search || "";
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const pattern = `%${search}%`;

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM books
    WHERE title LIKE ? COLLATE NOCASE
       OR author LIKE ? COLLATE NOCASE
  `).get(pattern, pattern).count;

  const data = db.prepare(`
    SELECT id, code, title, author, total_copies, available_copies
    FROM books
    WHERE title LIKE ? COLLATE NOCASE
       OR author LIKE ? COLLATE NOCASE
    ORDER BY id
    LIMIT ? OFFSET ?
  `).all(pattern, pattern, limit, offset);

  res.json({
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

router.post("/", authenticate, requireRole("librarian"), (req, res) => {
  const { code, title, author, total_copies } = req.body;

  if (!code || !title || !author || !Number.isInteger(total_copies) || total_copies < 1) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid book data"
      }
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO books
      (code, title, author, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?)
    `).run(code, title, author, total_copies, total_copies);

    res.status(201).json({
      id: result.lastInsertRowid,
      code,
      title,
      author,
      total_copies,
      available_copies: total_copies
    });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_BOOK",
          message: "Book code already exists"
        }
      });
    }

    throw err;
  }
});

module.exports = router;