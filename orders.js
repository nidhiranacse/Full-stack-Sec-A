const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// POST /api/orders
router.post("/", async (req, res) => {
    try {
        const { customerName, phone, address, items } = req.body;

        // Basic validation
        if (!customerName || !phone || !address) {
            return res.status(400).json({
                message: "Customer name, phone and address are required"
            });
        }

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Phone must contain exactly 10 digits"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one item"
            });
        }

        let orderItems = [];
        let totalAmount = 0;

        // Check every item from the database
        for (const orderItem of items) {
            if (!orderItem.itemId || !orderItem.qty || orderItem.qty < 1) {
                return res.status(400).json({
                    message: "Each item must have a valid itemId and quantity of at least 1"
                });
            }

            const menuItem = await MenuItem.findById(orderItem.itemId);

            if (!menuItem) {
                return res.status(404).json({
                    message: `Menu item ${orderItem.itemId} not found`
                });
            }

            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    message: `${menuItem.name} is currently unavailable`
                });
            }

            const itemTotal = menuItem.price * orderItem.qty;

            orderItems.push({
                itemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                qty: orderItem.qty
            });

            totalAmount += itemTotal;
        }

        const order = new Order({
            customerName,
            phone,
            address,
            items: orderItems,
            totalAmount,
            status: "Placed"
        });

        const savedOrder = await order.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

// GET /api/orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Placed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Cancellation is allowed only from Placed
        if (status === "Cancelled") {
            if (order.status !== "Placed") {
                return res.status(400).json({
                    message: "Order can only be cancelled while it is Placed"
                });
            }

            order.status = "Cancelled";
        } else {
            const statusOrder = [
                "Placed",
                "Preparing",
                "Out for Delivery",
                "Delivered"
            ];

            const currentIndex = statusOrder.indexOf(order.status);
            const newIndex = statusOrder.indexOf(status);

            if (newIndex !== currentIndex + 1) {
                return res.status(400).json({
                    message: "Order status can only move forward one step at a time"
                });
            }

            order.status = status;
        }

        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;