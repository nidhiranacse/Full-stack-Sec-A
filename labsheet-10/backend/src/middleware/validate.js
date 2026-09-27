const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request body parameters',
        details,
      });
    }
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
  }
};

module.exports = validate;
