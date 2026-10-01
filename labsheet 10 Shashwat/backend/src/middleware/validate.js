const { validationResult } = require('express-validator');

/**
 * Reads express-validator errors and short-circuits with 400 if any exist.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validate };
