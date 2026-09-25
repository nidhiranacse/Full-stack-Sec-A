require('dotenv').config();

const http =
    require('http');

const createApp =
    require('./src/app');

const connectDB =
    require('./src/config/db');

const initSocket =
    require('./src/sockets');


const PORT =
    process.env.PORT || 5000;


async function startServer() {

    await connectDB();


    const app =
        createApp();


    const server =
        http.createServer(
            app
        );


    const io =
        initSocket(
            server,
            process.env.FRONTEND_ORIGIN ||
            'http://localhost:5173'
        );


    app.set(
        'io',
        io
    );


    server.listen(
        PORT,
        () => {

            console.log(
                `Server running on port ${PORT}`
            );
        }
    );
}


startServer();