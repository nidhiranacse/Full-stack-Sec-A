import { io } from 'socket.io-client';
import { addAnnouncementRealtime } from '../store/announcementSlice';

let socket = null;

export const initSocketClient = (token, dispatch) => {
  if (socket) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  socket.on('connect', () => {
    console.log('[Socket.io Client] Connected successfully with ID:', socket.id);
  });

  // Task 2: Listen for new-announcement event pushed by backend
  socket.on('new-announcement', (announcement) => {
    console.log('[Socket.io Client] Real-time announcement received:', announcement);
    if (dispatch) {
      dispatch(addAnnouncementRealtime(announcement));
    }
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.io Client] Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`[Socket.io Client] Reconnected after ${attemptNumber} attempts`);
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket.io Client] Reconnection failed completely.');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
