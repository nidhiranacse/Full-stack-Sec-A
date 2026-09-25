const express =
    require('express');

const { z } =
    require('zod');

const validate =
    require('../middleware/validate');

const {
    loginLimiter
} = require('../middleware/rateLimiter');

const {
    register,
    login,
    refresh,
    logout
} = require('../controllers/authController');


const router =
    express.Router();


const registerSchema =
    z.object({

        name:
            z.string()
                .min(2)
                .max(100),

        email:
            z.string()
                .email(),

        password:
            z.string()
                .min(
                    8,
                    'Password must be at least 8 characters'
                ),

        role:
            z.enum([
                'ADMIN',
                'STUDENT'
            ])
            .optional()
    });


const loginSchema =
    z.object({

        email:
            z.string()
                .email(),

        password:
            z.string()
                .min(
                    1,
                    'Password is required'
                )
    });


router.post(
    '/register',
    validate({
        body: registerSchema
    }),
    register
);


router.post(
    '/login',
    loginLimiter,
    validate({
        body: loginSchema
    }),
    login
);


router.post(
    '/refresh',
    refresh
);


router.post(
    '/logout',
    logout
);


module.exports = router;