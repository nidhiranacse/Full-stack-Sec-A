const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Missing Authorization header
  if (!authHeader) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // Authorization header must use Bearer token format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const token = authHeader.slice(7).trim();

  // Empty token
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store authenticated user information for later routes
    req.user = decoded;

    next();
  } catch (error) {
    // Handles malformed, invalid, and expired JWTs
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

module.exports = authenticateToken;