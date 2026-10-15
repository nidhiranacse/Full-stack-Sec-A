function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      return next();
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors
          ? err.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message
            }))
          : err.message
      });
    }
  };
}

module.exports = validate;