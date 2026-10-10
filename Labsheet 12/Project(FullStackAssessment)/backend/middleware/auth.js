const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: "Invalid authentication token"
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload.sub || !["user", "admin"].includes(payload.role)) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }

        req.user = {
            id: payload.sub,
            role: payload.role
        };

        next();
    } catch (error) {
        // Malformed, invalid and expired tokens must not crash the server.
        return res.status(401).json({
            message: "Invalid or expired authentication token"
        });
    }
}

module.exports = authenticateToken;