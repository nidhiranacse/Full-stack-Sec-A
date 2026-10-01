/**
 * Role-Based Access Control middleware factory.
 * Usage:  authorize('ADMIN')  or  authorize('ADMIN', 'STUDENT')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authorize };
