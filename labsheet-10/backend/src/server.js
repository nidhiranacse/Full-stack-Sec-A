const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { getRedisClient } = require('./config/redis');
const setupSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Setup Socket.io
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 15000,
});

// Configure Socket.io authentication and handlers
setupSocket(io);

// Make io accessible throughout Express controllers
app.set('io', io);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    getRedisClient(); // Initialize Redis client asynchronously

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  CampusConnect Server running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API URL:     http://localhost:${PORT}/api`);
      console.log(`  Socket.io:   Ready for real-time notifications`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
