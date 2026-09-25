function validate(schemas) {

    return (req, res, next) => {

        try {

            if (schemas.body) {
                req.body =
                    schemas.body.parse(
                        req.body
                    );
            }

            if (schemas.query) {
                req.query =
                    schemas.query.parse(
                        req.query
                    );
            }

            if (schemas.params) {
                req.params =
                    schemas.params.parse(
                        req.params
                    );
            }

            next();

        } catch (error) {

            return res.status(400).json({
                error: 'Validation failed',

                details:
                    error.errors
                        ? error.errors.map(
                            (item) => ({
                                path:
                                    item.path.join('.'),
                                message:
                                    item.message
                            })
                        )
                        : error.message
            });
        }
    };
}

module.exports = validate;