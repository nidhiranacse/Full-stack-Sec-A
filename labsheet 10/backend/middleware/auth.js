const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
const header = req.headers.authorization;
const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

if (!token) {
return res.status(401).json({ message: "Authentication required" });
}

try {
req.user = jwt.verify(token, process.env.JWT_SECRET);
next();
} catch {
res.status(401).json({ message: "Invalid or expired token" });
}
}

function authorize(...roles) {
return (req, res, next) => {
if (!req.user || !roles.includes(req.user.role)) {
return res.status(403).json({ message: "Access denied" });
}
next();
};
}

module.exports = { authenticate, authorize };
