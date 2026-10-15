const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    },

    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000
    }
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth &&
        socket.handshake.auth.token;

      if (!token) {
        return next(
          new Error('Unauthorized: missing token')
        );
      }

      const payload = verifyAccessToken(token);

      socket.user = payload;

      return next();
    } catch (err) {
      return next(
        new Error(
          'Unauthorized: invalid or expired token'
        )
      );
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.user.role);
    socket.join(`user:${socket.user.sub}`);

    console.log(
      `[socket] connected: ${socket.user.email} (${socket.user.role})`
    );

    socket.on('disconnect', (reason) => {
      console.log(
        `[socket] disconnected: ${socket.user.email} (${reason})`
      );
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(
        `[socket] reconnect attempt #${attempt} for ${socket.user.email}`
      );
    });
  });

  return io;
}

module.exports = initSocket;