const express = require("express");
const { body, validationResult } = require("express-validator");

const {
    register,
    login,
    refreshToken
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    next();
};

// Register
router.post(
    "/register",
    [
        body("name")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters"),

        body("email")
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],
    validateRequest,
    register
);

// Login
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    validateRequest,
    login
);

// Refresh token
router.post("/refresh", refreshToken);

// Protected profile
router.get(
    "/profile",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Protected route accessed successfully",
            user: req.user
        });
    }
);

// Student/User route
router.get(
    "/student",
    authenticateToken,
    authorizeRoles("STUDENT"),
    (req, res) => {
        res.json({
            message: "Student route accessed successfully",
            user: req.user
        });
    }
);

// Admin route
router.get(
    "/admin",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin route accessed successfully",
            user: req.user
        });
    }
);
router.post("/logout", (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.json({
        message: "Logout successful"
    });
});
module.exports = router;