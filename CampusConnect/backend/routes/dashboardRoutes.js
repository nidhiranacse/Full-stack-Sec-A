const express = require("express");
const router = express.Router();
const {
    getStudentDashboard,
    getAdminDashboard,
    getQueryBenchmark
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// Student dashboard
router.get("/student", protect, authorize("student", "admin"), getStudentDashboard);

// Admin dashboard & query benchmark
router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/benchmark", protect, authorize("admin"), getQueryBenchmark);

module.exports = router;
