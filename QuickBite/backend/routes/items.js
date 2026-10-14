
const express = require("express");
const db = require("../database");

const router = express.Router();

// GET /api/items?search=pizza&category=Main%20Course
router.get("/", (req, res, next) => {
  try {
    const { search, category } = req.query;

    let sql = "SELECT * FROM menu_items WHERE 1 = 1";
    const params = [];

    if (search && search.trim()) {
      sql += " AND name LIKE ?";
      params.push(`%${search.trim()}%`);
    }

    if (category && category.trim()) {
      sql += " AND category = ?";
      params.push(category.trim());
    }

    sql += " ORDER BY id DESC";

    const items = db.prepare(sql).all(...params);

    res.status(200).json({
      success: true,
      count: items.length,
      items: items.map((item) => ({
        ...item,
        isAvailable: Boolean(item.isAvailable),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/items
router.post("/", (req, res, next) => {
  try {
    const { name, price, category, isAvailable = true } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      typeof price === "boolean" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false.",
      });
    }

    const result = db.prepare(`
      INSERT INTO menu_items (name, price, category, isAvailable)
      VALUES (?, ?, ?, ?)
    `).run(
      name.trim(),
      Number(price),
      category.trim(),
      isAvailable ? 1 : 0
    );

    const item = db.prepare(
      "SELECT * FROM menu_items WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Menu item created successfully.",
      item: {
        ...item,
        isAvailable: Boolean(item.isAvailable),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/items/:id
router.put("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID.",
      });
    }

    const existing = db.prepare(
      "SELECT * FROM menu_items WHERE id = ?"
    ).get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    const {
      name = existing.name,
      price = existing.price,
      category = existing.category,
      isAvailable = Boolean(existing.isAvailable),
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      typeof price === "boolean" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false.",
      });
    }

    db.prepare(`
      UPDATE menu_items
      SET name = ?, price = ?, category = ?, isAvailable = ?
      WHERE id = ?
    `).run(
      name.trim(),
      Number(price),
      category.trim(),
      isAvailable ? 1 : 0,
      id
    );

    const updated = db.prepare(
      "SELECT * FROM menu_items WHERE id = ?"
    ).get(id);

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully.",
      item: {
        ...updated,
        isAvailable: Boolean(updated.isAvailable),
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id
router.delete("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID.",
      });
    }

    const result = db.prepare(
      "DELETE FROM menu_items WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
