const express = require("express");

const {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Anyone can view events
router.get("/", getEvents);
router.get("/:id", getEvent);

// Only admins can manage events
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;