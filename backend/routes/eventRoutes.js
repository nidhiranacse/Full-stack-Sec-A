const express = require("express");

const {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getMyEvents
} = require("../controllers/eventController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all events
router.get("/", protect, getEvents);

// Get student's registered events
// IMPORTANT: This must come before /:id
router.get("/my-events", protect, getMyEvents);

// Get single event
router.get("/:id", protect, getEvent);

// Admin creates event
router.post("/", protect, adminOnly, createEvent);

// Admin updates event
router.put("/:id", protect, adminOnly, updateEvent);

// Admin deletes event
router.delete("/:id", protect, adminOnly, deleteEvent);

// Student registers for event
router.post("/:id/register", protect, registerForEvent);

// Student unregisters from event
router.delete("/:id/register", protect, unregisterFromEvent);

module.exports = router;