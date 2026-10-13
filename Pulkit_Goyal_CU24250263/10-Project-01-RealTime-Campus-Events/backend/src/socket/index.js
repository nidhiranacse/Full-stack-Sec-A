let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket Client connected: ${socket.id}`);

    // Allow clients to join department rooms
    socket.on('join_department', (dept) => {
      socket.join(dept);
      console.log(`Socket ${socket.id} joined room: ${dept}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket Client disconnected: ${socket.id}`);
    });
  });
}

function broadcastAnnouncement(announcement) {
  if (ioInstance) {
    ioInstance.emit('new_announcement', announcement);
    console.log(`📢 Broadcasted announcement: "${announcement.title}"`);
  }
}

function broadcastEventUpdate(event) {
  if (ioInstance) {
    ioInstance.emit('event_updated', event);
  }
}

module.exports = {
  initSocket,
  broadcastAnnouncement,
  broadcastEventUpdate
};
