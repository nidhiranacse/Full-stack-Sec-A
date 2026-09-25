const bcrypt =
    require('bcryptjs');

const User =
    require('../models/User');

const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require('../utils/jwt');


const SALT_ROUNDS = 10;


const REFRESH_COOKIE_OPTS = {
    httpOnly: true,

    secure:
        process.env.NODE_ENV ===
        'production',

    sameSite: 'strict',

    maxAge:
        7 * 24 * 60 * 60 * 1000,

    path: '/api/auth'
};


async function register(
    req,
    res
) {

    const {
        name,
        email,
        password,
        role
    } = req.body;


    const existing =
        await User.findOne({
            email
        });


    if (existing) {

        return res.status(409).json({
            error:
                'Email already registered'
        });
    }


    const passwordHash =
        await bcrypt.hash(
            password,
            SALT_ROUNDS
        );


    const user =
        await User.create({
            name,
            email,
            passwordHash,

            role:
                role === 'ADMIN'
                    ? 'ADMIN'
                    : 'STUDENT'
        });


    const accessToken =
        signAccessToken(user);

    const refreshToken =
        signRefreshToken(user);


    res.cookie(
        'refreshToken',
        refreshToken,
        REFRESH_COOKIE_OPTS
    );


    return res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },

        accessToken
    });
}


async function login(
    req,
    res
) {

    const {
        email,
        password
    } = req.body;


    const user =
        await User.findOne({
            email
        });


    if (!user) {

        return res.status(401).json({
            error:
                'Invalid email or password'
        });
    }


    const valid =
        await bcrypt.compare(
            password,
            user.passwordHash
        );


    if (!valid) {

        return res.status(401).json({
            error:
                'Invalid email or password'
        });
    }


    const accessToken =
        signAccessToken(user);

    const refreshToken =
        signRefreshToken(user);


    res.cookie(
        'refreshToken',
        refreshToken,
        REFRESH_COOKIE_OPTS
    );


    return res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },

        accessToken
    });
}


async function refresh(
    req,
    res
) {

    const token =
        req.cookies &&
        req.cookies.refreshToken;


    if (!token) {

        return res.status(401).json({
            error:
                'Missing refresh token'
        });
    }


    let payload;


    try {

        payload =
            verifyRefreshToken(
                token
            );

    } catch (error) {

        return res.status(401).json({
            error:
                'Invalid or expired refresh token'
        });
    }


    const user =
        await User.findById(
            payload.sub
        );


    if (
        !user ||
        (
            user.refreshTokenVersion ||
            0
        ) !== payload.v
    ) {

        return res.status(401).json({
            error:
                'Refresh token revoked'
        });
    }


    const accessToken =
        signAccessToken(user);


    return res.json({
        accessToken
    });
}


function logout(
    req,
    res
) {

    res.clearCookie(
        'refreshToken',
        {
            path: '/api/auth'
        }
    );

    return res.status(204).send();
}


module.exports = {
    register,
    login,
    refresh,
    logout
};