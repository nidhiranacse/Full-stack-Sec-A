const {
    verifyAccessToken
} = require('../utils/jwt');


function authenticate(
    req,
    res,
    next
) {
    const header =
        req.headers.authorization || '';

    const token =
        header.startsWith('Bearer ')
            ? header.slice(7)
            : null;

    if (!token) {
        return res.status(401).json({
            error: 'Missing access token'
        });
    }

    try {
        const payload =
            verifyAccessToken(token);

        req.user = payload;

        next();

    } catch (error) {
        return res.status(401).json({
            error:
                'Invalid or expired access token'
        });
    }
}


function authorize(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                error: 'Not authenticated'
            });
        }

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                error:
                    'Forbidden: insufficient role'
            });
        }

        next();
    };
}


module.exports = {
    authenticate,
    authorize
};