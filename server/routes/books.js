
const express = require("express");
const db = require("../db/database");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", (req, res) => {
  const search = typeof req.query.search === "string"
    ? req.query.search.trim()
    : "";

  const parsedPage = Number(req.query.page ?? 1);
  const parsedLimit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(parsedPage) || parsedPage < 1 ||
    !Number.isInteger(parsedLimit) || parsedLimit < 1
  ) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Page and limit must be positive integers."
      }
    });
  }

  const page = parsedPage;
  const limit = Math.min(parsedLimit, 50);
  const offset = (page - 1) * limit;
  const pattern = `%${search}%`;

  const total = db.prepare(`
    SELECT COUNT(*) AS total
    FROM books
    WHERE title LIKE ? COLLATE NOCASE
       OR author LIKE ? COLLATE NOCASE
  `).get(pattern, pattern).total;

  const data = db.prepare(`
    SELECT id, code, title, author,
           total_copies, available_copies
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

router.post("/", requireRole("librarian"), (req, res) => {
  const { code, title, author, total_copies } = req.body || {};

  if (
    typeof code !== "string" || !code.trim() ||
    typeof title !== "string" || !title.trim() ||
    typeof author !== "string" || !author.trim() ||
    !Number.isInteger(total_copies) || total_copies < 0
  ) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Provide a code, title, author and non-negative integer total_copies."
      }
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO books
      (code, title, author, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      code.trim(),
      title.trim(),
      author.trim(),
      total_copies,
      total_copies
    );

    const book = db.prepare(
      "SELECT * FROM books WHERE id = ?"
    ).get(result.lastInsertRowid);

    return res.status(201).json(book);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_BOOK",
          message: "A book with this code already exists."
        }
      });
    }
    throw error;
  }
});

module.exports = router;
