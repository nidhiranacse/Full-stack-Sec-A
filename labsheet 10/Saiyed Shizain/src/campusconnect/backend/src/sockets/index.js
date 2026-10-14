const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt");

function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
  });

  // Authenticate every socket with the same JWT access token used for REST.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized: missing token"));
      const payload = verifyAccessToken(token);
      socket.user = payload;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Role rooms let us broadcast "new-announcement" to all students at once.
    socket.join(socket.user.role);
    socket.join(`user:${socket.user.sub}`);
    console.log(`[socket] connected: ${socket.user.email} (${socket.user.role})`);
    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${socket.user.email} (${reason})`);
    });
  });

  return io;
}

module.exports = initSocket;
