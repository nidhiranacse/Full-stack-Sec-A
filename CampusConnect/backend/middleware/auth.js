const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to verify JWT token and attach user to request
const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No authentication token provided."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_campusconnect_secret");

        // Fetch user from DB excluding password
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User no longer exists."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Token is invalid or expired."
        });
    }
};

module.exports = { protect };
