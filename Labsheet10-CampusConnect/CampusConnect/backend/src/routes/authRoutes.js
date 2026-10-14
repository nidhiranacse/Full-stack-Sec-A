const express = require("express");

const {
    register,
    login,
    refreshToken
} = require("../controllers/authController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// PUBLIC AUTH ROUTES
// ============================================================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Refresh access token
router.post("/refresh", refreshToken);

// ============================================================
// PROTECTED TEST ROUTE
// ============================================================

router.get("/profile", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected profile accessed successfully",
        user: req.user
    });
});

// ============================================================
// ADMIN-ONLY TEST ROUTE
// ============================================================

router.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin! You have admin access.",
            user: req.user
        });
    }
);

module.exports = router;