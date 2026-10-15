const express = require("express");

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
} = require("../controllers/eventController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);


// Admin routes
router.post(
    "/",
    protect,
    adminOnly,
    createEvent
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updateEvent
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteEvent
);


// Student routes
router.post(
    "/:id/register",
    protect,
    registerForEvent
);

router.delete(
    "/:id/register",
    protect,
    unregisterFromEvent
);


module.exports = router;