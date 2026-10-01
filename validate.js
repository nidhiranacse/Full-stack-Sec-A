// Validates req.body against a zod schema; returns structured 400 errors
module.exports = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  req.body = r.data;
  next();
};
