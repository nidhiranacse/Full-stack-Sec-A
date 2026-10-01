let io;

/**
 * Initialise Socket.io and store the reference.
 * Called once from server.js after the HTTP server is created.
 */
function initSocket(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected   : ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialised');
}

/** Returns the shared Socket.io server instance. */
function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
