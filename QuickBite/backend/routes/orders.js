
const express = require("express");
const db = require("../database");

const router = express.Router();

const VALID_STATUSES = [
  "Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_ORDER = [
  "Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

// POST /api/orders
router.post("/", (req, res, next) => {
  try {
    const { customerName, phone, address, items } = req.body;

    if (
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (
      typeof phone !== "string" ||
      !/^\d{10}$/.test(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain exactly 10 digits.",
      });
    }

    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An order must contain at least one item.",
      });
    }

    // Validate and normalize requested quantities.
    const quantities = new Map();

    for (const entry of items) {
      if (
        !entry ||
        !Number.isSafeInteger(entry.itemId) ||
        entry.itemId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid itemId.",
        });
      }

      if (
        !Number.isSafeInteger(entry.qty) ||
        entry.qty < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item quantity must be at least 1.",
        });
      }

      const combinedQty =
        (quantities.get(entry.itemId) || 0) + entry.qty;

      if (!Number.isSafeInteger(combinedQty)) {
        return res.status(400).json({
          success: false,
          message: "Item quantity is too large.",
        });
      }

      quantities.set(entry.itemId, combinedQty);
    }

    const getItem = db.prepare(
      "SELECT * FROM menu_items WHERE id = ?"
    );

    const orderItems = [];
    let totalAmount = 0;

    for (const [itemId, qty] of quantities) {
      const item = getItem.get(itemId);

      if (!item) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${itemId} does not exist.`,
        });
      }

      if (!item.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${item.name} is currently unavailable.`,
        });
      }

      const lineTotal = item.price * qty;

      if (!Number.isFinite(lineTotal)) {
        return res.status(400).json({
          success: false,
          message: "Order amount is invalid.",
        });
      }

      totalAmount += lineTotal;

      orderItems.push({
        itemId: item.id,
        name: item.name,
        price: item.price,
        qty,
      });
    }

    // Store the validated order atomically.
    const createOrder = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO orders (
          customerName,
          phone,
          address,
          items,
          totalAmount,
          status
        )
        VALUES (?, ?, ?, ?, ?, 'Placed')
      `).run(
        customerName.trim(),
        phone,
        address.trim(),
        JSON.stringify(orderItems),
        totalAmount
      );

      return db.prepare(
        "SELECT * FROM orders WHERE id = ?"
      ).get(result.lastInsertRowid);
    });

    const order = createOrder();

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: {
        ...order,
        items: JSON.parse(order.items),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders - latest first
router.get("/", (req, res, next) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders
      ORDER BY createdAt DESC, id DESC
    `).all();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map((order) => ({
        ...order,
        items: JSON.parse(order.items),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const updateOrder = db.transaction(() => {
      const order = db.prepare(
        "SELECT * FROM orders WHERE id = ?"
      ).get(id);

      if (!order) {
        return {
          error: {
            status: 404,
            message: "Order not found.",
          },
        };
      }

      if (order.status === "Cancelled") {
        return {
          error: {
            status: 400,
            message: "A cancelled order cannot be changed.",
          },
        };
      }

      if (status === "Cancelled") {
        if (order.status !== "Placed") {
          return {
            error: {
              status: 400,
              message: "Only placed orders can be cancelled.",
            },
          };
        }
      } else {
        const currentIndex = STATUS_ORDER.indexOf(order.status);
        const requestedIndex = STATUS_ORDER.indexOf(status);

        if (
          requestedIndex === -1 ||
          requestedIndex !== currentIndex + 1
        ) {
          return {
            error: {
              status: 400,
              message: "Order status must advance one step at a time.",
            },
          };
        }
      }

      db.prepare(
        "UPDATE orders SET status = ? WHERE id = ?"
      ).run(status, id);

      const updated = db.prepare(
        "SELECT * FROM orders WHERE id = ?"
      ).get(id);

      return { order: updated };
    });

    const result = updateOrder();

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: {
        ...result.order,
        items: JSON.parse(result.order.items),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
