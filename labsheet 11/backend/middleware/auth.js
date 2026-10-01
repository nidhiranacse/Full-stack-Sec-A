// ============================================
// JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token - protects routes that need login
function authenticateToken(req, res, next) {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// Check if user is an admin
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
}

// Check if user is a student
function isStudent(req, res, next) {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Student account required.' });
    }
    next();
}

module.exports = { authenticateToken, isAdmin, isStudent };
