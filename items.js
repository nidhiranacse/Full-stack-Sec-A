const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

// GET /api/items
router.get("/", async (req, res) => {
    try {
        const { search, category } = req.query;

        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (category) {
            filter.category = category;
        }

        const items = await MenuItem.find(filter);

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/items
router.post("/", async (req, res) => {
    try {
        const { name, price, category, isAvailable } = req.body;

        if (!name || price === undefined || price <= 0) {
            return res.status(400).json({
                message: "Name and positive price are required"
            });
        }

        const item = new MenuItem({
            name,
            price,
            category,
            isAvailable
        });

        const savedItem = await item.save();

        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/items/:id
router.put("/:id", async (req, res) => {
    try {
        const { name, price, category, isAvailable } = req.body;

        if (!name || price === undefined || price <= 0) {
            return res.status(400).json({
                message: "Name and positive price are required"
            });
        }

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                category,
                isAvailable
            },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item deleted"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;