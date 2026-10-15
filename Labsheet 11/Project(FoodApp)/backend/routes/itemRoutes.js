const express = require("express");
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

const router = express.Router();

// GET /api/items?search=pizza&category=Main
router.get("/", async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (category && category.toLowerCase() !== "all") {
            filter.category = { $regex: `^${category}$`, $options: "i" };
        }

        const items = await MenuItem.find(filter).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch menu items" });
    }
});

// POST /api/items
router.post("/", async (req, res) => {
    try {
        const { name, price, category, isAvailable } = req.body;

        if (!name || !String(name).trim() ||
            price === undefined || price === null ||
            price === "" || !Number.isFinite(Number(price)) ||
            Number(price) <= 0) {
            return res.status(400).json({
                message: "A valid item name and positive price are required"
            });
        }

        if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
            return res.status(400).json({
                message: "isAvailable must be true or false"
            });
        }

        const item = await MenuItem.create({
            name,
            price: Number(price),
            category,
            isAvailable
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/items/:id
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        const { name, price, category, isAvailable } = req.body;

        if (price !== undefined &&
            (price === "" || !Number.isFinite(Number(price)) ||
                Number(price) <= 0)) {
            return res.status(400).json({
                message: "Price must be a valid number greater than zero"
            });
        }

        if (name !== undefined &&
            (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({
                message: "Item name cannot be empty"
            });
        }

        if (isAvailable !== undefined &&
            typeof isAvailable !== "boolean") {
            return res.status(400).json({
                message: "isAvailable must be true or false"
            });
        }

        const updates = { ...req.body };

        if (price !== undefined) updates.price = Number(price);

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        const item = await MenuItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json({ message: "Menu item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete menu item" });
    }
});

module.exports = router;