const express = require("express");

const {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    rsvpEvent
} = require("../controllers/eventController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// PUBLIC / AUTHENTICATED EVENT LIST
// GET /api/events
// ============================================================

router.get("/", authenticate, getEvents);

// ============================================================
// ADMIN EVENT MANAGEMENT
// ============================================================

// Create event
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createEvent
);

// Update event
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateEvent
);

// Delete event
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteEvent
);

// ============================================================
// STUDENT RSVP
// POST /api/events/:id/rsvp
// ============================================================

router.post(
    "/:id/rsvp",
    authenticate,
    authorize("STUDENT"),
    rsvpEvent
);

module.exports = router;