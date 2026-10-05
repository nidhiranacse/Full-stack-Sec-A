/**
 * Role-Based Access Control (RBAC) Middleware
 * Bonus Requirement: Add role-based access control middleware
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role(s). Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
