const express = require("express");

const {
    registerForEvent,
    unregisterFromEvent,
    getMyRegistrations,
    getEventRegistrations
} = require("../controllers/registrationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/:eventId", protect, registerForEvent);

router.delete("/:eventId", protect, unregisterFromEvent);

router.get("/my", protect, getMyRegistrations);

// Admin: view students registered for an event
router.get(
    "/event/:eventId",
    protect,
    adminOnly,
    getEventRegistrations
);

module.exports = router;