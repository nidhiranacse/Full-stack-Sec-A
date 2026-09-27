const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const secret = process.env.JWT_SECRET || 'supersecret_jwt_access_token_key_labsheet10';
      const decoded = jwt.verify(token, secret);
      socket.user = decoded; // { id, email, role, name }
      next();
    } catch (err) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const userRole = socket.user?.role?.toUpperCase() || 'STUDENT';
    const userId = socket.user?.id;

    console.log(`[Socket.io] User connected: ${socket.user?.name} (${userRole}) [socket id: ${socket.id}]`);

    // Join role-specific room (e.g. 'STUDENT' room receives 'new-announcement')
    socket.join(userRole);
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Confirm connection to client
    socket.emit('connection-established', {
      status: 'connected',
      user: socket.user,
      joinedRoom: userRole,
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] User disconnected: ${socket.user?.name} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket.io] Socket error on ${socket.id}:`, err.message);
    });
  });

  return io;
};

module.exports = setupSocket;
