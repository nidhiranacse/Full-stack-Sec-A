const express = require("express");

const {
    getAdminDashboard,
    getEventRegistrations
} = require("../controllers/adminController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Admin dashboard
router.get(
    "/dashboard",
    protect,
    adminOnly,
    getAdminDashboard
);


// Registered students for an event
router.get(
    "/events/:eventId/registrations",
    protect,
    adminOnly,
    getEventRegistrations
);

module.exports = router;