const User = require("../models/User");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

// ============================================================
// REGISTER VALIDATION SCHEMA
// ============================================================

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

// ============================================================
// LOGIN VALIDATION SCHEMA
// ============================================================

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

// ============================================================
// REGISTER USER
// POST /api/auth/register
// ============================================================

const register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const { name, email, password } = result.data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const user = await User.create({
            name,
            email,
            passwordHash: password,
            role: "STUDENT"
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// LOGIN USER
// POST /api/auth/login
// ============================================================

const login = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const { email, password } = result.data;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create 15-minute access token
        const accessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        // Create 7-day refresh token
        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Store refresh token in an httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// REFRESH ACCESS TOKEN
// POST /api/auth/refresh
// ============================================================

const refreshToken = async (req, res) => {
    try {
        // Get refresh token from httpOnly cookie
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Find the user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Create a new 15-minute access token
        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
    register,
    login,
    refreshToken
};