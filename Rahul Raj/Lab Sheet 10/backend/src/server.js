/**
 * CampusConnect Main Server (Express + Socket.io + Security Hardening)
 * Student: Rahul Raj (cu24250116)
 * Course: Full Stack Web Development (Sec-A)
 */

const http = require('node:http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const createAnnouncementRouter = require('./routes/announcementRoutes');
const { verifyAccessToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Task 5: Security Hardening
app.use(helmet({
  contentSecurityPolicy: false // Allow dynamic inline styles/assets in dev
}));
app.use(cors({
  origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task 2: Real-Time Socket.io Server Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Authenticate socket connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (token) {
    const user = verifyAccessToken(token);
    if (user) {
      socket.user = user;
    }
  }
  next(); // Allow connection with or without token; unauthenticated gets public broadcasts
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.user?.name || 'Anonymous'})`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', createAnnouncementRouter(io));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CampusConnect API',
    candidate: 'Rahul Raj (cu24250116)',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` CampusConnect Backend Server online at port ${PORT}`);
    console.log(` Developer: Rahul Raj | cu24250116 | Full-stack Sec-A`);
    console.log(` Socket.io Engine: Active for live notifications`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server, io };
