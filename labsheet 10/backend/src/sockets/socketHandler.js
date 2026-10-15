const jwt = require('jsonwebtoken');

const initSockets = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: Token missing'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`âš¡ WebSocket connected: User ${socket.user.id} (${socket.user.role})`);
    
    socket.on('disconnect', () => {
      console.log(`í´¥ WebSocket disconnected: User ${socket.user.id}`);
    });
  });
};

module.exports = initSockets;
