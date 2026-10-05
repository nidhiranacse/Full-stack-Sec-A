import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // JWT Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    (socket.handshake.headers?.authorization && socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const secret = process.env.JWT_ACCESS_SECRET || 'campus_connect_jwt_access_super_secret_key_2026_xyz';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn(`[Socket.io] Auth handshake failed: ${err.message}`);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userRole = socket.user?.role;
    const userName = socket.user?.name;

    console.log(`[Socket.io] Client connected: ${socket.id} (${userName} - ${userRole})`);

    // Join specific rooms
    if (userRole === 'STUDENT') {
      socket.join('role:students');
    } else if (userRole === 'ADMIN') {
      socket.join('role:admins');
    }
    socket.join('broadcast');

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => ioInstance;

// Helper to emit new-announcement to students and all clients
export const emitNewAnnouncement = (announcement) => {
  if (ioInstance) {
    console.log(`[Socket.io] Broadcasting new-announcement event: "${announcement.title}"`);
    // Emit to students room and broadcast
    ioInstance.to('role:students').emit('new-announcement', announcement);
    ioInstance.emit('new-announcement', announcement);
  }
};
