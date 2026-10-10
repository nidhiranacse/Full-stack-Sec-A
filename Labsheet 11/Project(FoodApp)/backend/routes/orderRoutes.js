const express = require("express");
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

const router = express.Router();

// POST /api/orders
router.post("/", async (req, res) => {
    try {
        const { customerName, phone, address, items } = req.body;

        if (typeof customerName !== "string" || !customerName.trim() ||
            typeof phone !== "string" || !/^\d{10}$/.test(phone) ||
            typeof address !== "string" || !address.trim()) {
            return res.status(400).json({
                message: "Enter a customer name, valid 10-digit phone and address"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "An order must contain at least one item"
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const entry of items) {
            if (!entry.itemId ||
                !mongoose.isValidObjectId(entry.itemId) ||
                !Number.isInteger(entry.qty) ||
                entry.qty < 1) {
                return res.status(400).json({
                    message: "Each order item needs a valid itemId and quantity of at least 1"
                });
            }

            const item = await MenuItem.findById(entry.itemId);

            if (!item) {
                return res.status(404).json({
                    message: `Menu item ${entry.itemId} was not found`
                });
            }

            if (!item.isAvailable) {
                return res.status(400).json({
                    message: `${item.name} is currently unavailable`
                });
            }

            orderItems.push({
                itemId: item._id,
                name: item.name,
                price: item.price,
                qty: entry.qty
            });

            totalAmount += item.price * entry.qty;
        }

        const order = await Order.create({
            customerName: customerName.trim(),
            phone,
            address: address.trim(),
            items: orderItems,
            totalAmount: Number(totalAmount.toFixed(2))
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/orders — newest orders first
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const nextStatus = {
            "Placed": "Preparing",
            "Preparing": "Out for Delivery",
            "Out for Delivery": "Delivered"
        };

        if (status === "Cancelled") {
            if (order.status !== "Placed") {
                return res.status(400).json({
                    message: "Only orders with Placed status can be cancelled"
                });
            }
        } else if (nextStatus[order.status] !== status) {
            return res.status(400).json({
                message: "Invalid status change. Advance the order one step at a time."
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;