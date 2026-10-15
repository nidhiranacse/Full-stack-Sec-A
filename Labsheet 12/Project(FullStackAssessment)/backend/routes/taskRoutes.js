const express = require("express");
const crypto = require("crypto");
const { tasks } = require("../store");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["todo", "doing", "done"];

// Every task endpoint requires authentication.
router.use(authenticateToken);

// Create a task
router.post("/", (req, res) => {
    const { title, status } = req.body || {};

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !VALID_STATUSES.includes(status)
    ) {
        return res.status(400).json({
            message: "A valid title and status (todo, doing, done) are required"
        });
    }

    const task = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        title: title.trim(),
        status,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);

    return res.status(201).json(task);
});

// Get only the caller's tasks, with optional status and pagination.
router.get("/", (req, res) => {
    const { status } = req.query;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        return res.status(400).json({
            message: "Page must be positive and limit must be between 1 and 100"
        });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    let result = tasks.filter(task => task.userId === req.user.id);

    if (status) {
        result = result.filter(task => task.status === status);
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const data = result.slice(startIndex, startIndex + limit);

    return res.status(200).json({
        data,
        page,
        total
    });
});

// Update a task
router.patch("/:id", (req, res) => {
    const { title, status } = req.body || {};

    const hasTitle = Object.prototype.hasOwnProperty.call(
        req.body || {}, "title"
    );
    const hasStatus = Object.prototype.hasOwnProperty.call(
        req.body || {}, "status"
    );

    if (!hasTitle && !hasStatus) {
        return res.status(400).json({
            message: "Provide title and/or status to update"
        });
    }

    if (hasTitle && (
        typeof title !== "string" || !title.trim()
    )) {
        return res.status(400).json({
            message: "Title must be a non-empty string"
        });
    }

    if (hasStatus && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    const task = tasks.find(item => item.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (task.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
            message: "You cannot modify another user's task"
        });
    }

    if (hasTitle) task.title = title.trim();
    if (hasStatus) task.status = status;

    return res.status(200).json(task);
});

// Delete a task
router.delete("/:id", (req, res) => {
    const index = tasks.findIndex(item => item.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const task = tasks[index];

    if (task.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
            message: "You cannot delete another user's task"
        });
    }

    tasks.splice(index, 1);

    return res.status(204).send();
});

module.exports = router;