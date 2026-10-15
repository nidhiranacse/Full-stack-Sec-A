const jwt = require("jsonwebtoken");

function auth(req, res, next) {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

function adminOnly(req, res, next) {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
}

module.exports = {
    auth,
    adminOnly
};