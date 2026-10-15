const express = require("express");

const {
    getStudentDashboard,
    getMyEvents,
    getMyProfile
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// Student dashboard
router.get(
    "/student",
    protect,
    getStudentDashboard
);


// My registered events
router.get(
    "/my-events",
    protect,
    getMyEvents
);


// My profile
router.get(
    "/profile",
    protect,
    getMyProfile
);


module.exports = router;