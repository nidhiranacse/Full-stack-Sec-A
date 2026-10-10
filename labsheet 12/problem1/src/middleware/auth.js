// ─── Authentication Middleware ───────────────────────────────────────
// Verifies JWT from the Authorization header and attaches the decoded
// payload to req.user.  Returns 401 for missing, malformed, or expired tokens.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;          // { id, email, role, iat, exp }
    next();
  } catch (err) {
    // Covers TokenExpiredError, JsonWebTokenError, etc.
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticate;
