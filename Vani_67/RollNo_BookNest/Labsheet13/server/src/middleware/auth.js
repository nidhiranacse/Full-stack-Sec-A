const jwt = require('jsonwebtoken');
function authenticate(req,res,next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({error:{code:'UNAUTHORIZED',message:'Login required.'}});
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-change-me'); next(); }
  catch { return res.status(401).json({error:{code:'UNAUTHORIZED',message:'Invalid or expired token.'}}); }
}
function requireRole(role) {
  return (req,res,next) => req.user && req.user.role === role ? next() :
    res.status(403).json({error:{code:'FORBIDDEN',message:'Insufficient permissions.'}});
}
module.exports = { authenticate, requireRole };
