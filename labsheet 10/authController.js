const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );
};
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            passwordHash,
            role: role || "STUDENT"
        });
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
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
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        const accessToken = generateAccessToken(user);
        res.json({
            accessToken
        });
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};
module.exports = {
    register,
    login,
    refresh
};