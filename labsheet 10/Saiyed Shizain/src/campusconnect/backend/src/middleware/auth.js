const { verifyAccessToken } = require("../utils/jwt");

// Attaches req.user = { sub, role, email } or rejects with 401.
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

// Usage: authorize("ADMIN") — rejects other roles with 403.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
