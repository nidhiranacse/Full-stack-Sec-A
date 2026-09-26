const express = require("express");

const {
    signup,
    login
} = require("../controllers/authController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

// Protected student/admin route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected profile accessed successfully",
        user: req.user
    });
});

// Admin-only test route
router.get("/admin-test", protect, adminOnly, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin access successful"
    });
});

module.exports = router;