const express = require("express");
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventAttendees
} = require("../controllers/eventController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// Public endpoints
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin-only event management
router.post("/", protect, authorize("admin"), createEvent);
router.put("/:id", protect, authorize("admin"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);
router.get("/:id/attendees", protect, authorize("admin"), getEventAttendees);

// Student registration / unregistration
router.post("/:id/register", protect, authorize("student", "admin"), registerForEvent);
router.post("/:id/unregister", protect, authorize("student", "admin"), unregisterFromEvent);

module.exports = router;
