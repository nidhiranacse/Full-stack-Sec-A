const express =
    require('express');

const helmet =
    require('helmet');

const cors =
    require('cors');

const cookieParser =
    require('cookie-parser');


const authRoutes =
    require('./routes/authRoutes');

const eventRoutes =
    require('./routes/eventRoutes');

const announcementRoutes =
    require('./routes/announcementRoutes');


function createApp() {

    const app =
        express();


    // Security
    app.use(
        helmet()
    );


    app.use(
        cors({
            origin:
                process.env.FRONTEND_ORIGIN ||
                'http://localhost:5173',

            credentials: true
        })
    );


    app.use(
        express.json()
    );


    app.use(
        cookieParser()
    );


    // Health
    app.get(
        '/api/health',
        (req, res) => {
            res.json({
                status: 'ok'
            });
        }
    );


    // Routes
    app.use(
        '/api/auth',
        authRoutes
    );

    app.use(
        '/api/events',
        eventRoutes
    );

    app.use(
        '/api/announcements',
        announcementRoutes
    );


    // Error handler
    app.use(
        (
            error,
            req,
            res,
            next
        ) => {

            console.error(
                error
            );

            res.status(
                error.status || 500
            ).json({
                error:
                    error.message ||
                    'Internal server error'
            });
        }
    );


    return app;
}


module.exports =
    createApp;