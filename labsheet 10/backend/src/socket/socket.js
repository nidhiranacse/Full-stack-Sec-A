const {
    Server
} = require('socket.io');

const {
    verifyAccessToken
} = require('../utils/jwt');


function initSocket(
    httpServer,
    corsOrigin
) {

    const io =
        new Server(
            httpServer,
            {
                cors: {
                    origin:
                        corsOrigin,

                    credentials:
                        true
                },

                connectionStateRecovery: {
                    maxDisconnectionDuration:
                        2 * 60 * 1000
                }
            }
        );


    io.use(
        (socket, next) => {

            try {

                const token =
                    socket.handshake.auth &&
                    socket.handshake.auth.token;


                if (!token) {

                    return next(
                        new Error(
                            'Unauthorized: missing token'
                        )
                    );
                }


                const payload =
                    verifyAccessToken(
                        token
                    );


                socket.user =
                    payload;


                next();

            } catch (error) {

                next(
                    new Error(
                        'Unauthorized: invalid or expired token'
                    )
                );
            }
        }
    );


    io.on(
        'connection',
        (socket) => {

            socket.join(
                socket.user.role
            );

            socket.join(
                `user:${socket.user.sub}`
            );


            console.log(
                `[socket] connected: ${socket.user.email}`
            );


            socket.on(
                'disconnect',
                (reason) => {

                    console.log(
                        `[socket] disconnected: ${reason}`
                    );
                }
            );
        }
    );


    return io;
}


module.exports = initSocket;