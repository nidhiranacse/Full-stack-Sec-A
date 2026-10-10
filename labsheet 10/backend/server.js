require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Connect Redis Client
// Connect Redis Client safely
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 2) {
        console.log('Redis server not found. Continuing in local fallback mode (No Cache).');
        return false; // stops the infinite loop
      }
      return 1000;
    }
  }
});

redisClient.on('error', () => {
  // Silent suppress to prevent terminal flood
});

redisClient.connect().then(() => {
  console.log('Redis Connected Successfully');
}).catch(() => {
  console.log('Running without Redis caching (Local Fallback Active).');
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Socket.io Setup with JWT Authentication
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_key_12345');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes')(redisClient));
app.use('/api/announcements', require('./routes/announcementRoutes')(io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`CampusConnect Server active on port ${PORT}`));
module.exports = { app, server };