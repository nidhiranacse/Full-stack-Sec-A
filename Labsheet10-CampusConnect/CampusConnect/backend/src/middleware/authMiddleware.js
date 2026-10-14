const jwt = require("jsonwebtoken");

// ============================================================
// AUTHENTICATE USER
// Checks whether the request contains a valid JWT
// ============================================================

const authenticate = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check whether token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        // Extract token from:
        // Authorization: Bearer <token>
        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information in request
        req.user = decoded;

        // Continue to the protected route
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        });
    }
};

// ============================================================
// AUTHORIZE USER ROLE
// Checks whether the authenticated user has the required role
// ============================================================

const authorize = (requiredRole) => {
    return (req, res, next) => {

        // Check whether authenticated user exists
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check user's role
        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden: insufficient permissions"
            });
        }

        // User has the required role
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};