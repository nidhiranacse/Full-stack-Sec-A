const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pulkit_jwt_super_secret_assessment_key';

/**
 * JWT Authentication Middleware
 * Validates 'Authorization: Bearer <token>' header and attaches user to req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing Bearer Authentication Token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or Expired JWT Token'
      });
    }

    req.user = decodedUser;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
