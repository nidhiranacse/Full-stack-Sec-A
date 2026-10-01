import { io } from 'socket.io-client';
import { announcementReceived } from './store/eventSlice';

let socket = null;
// JWT-authenticated socket; built-in reconnection (exponential backoff) handles dropped connections
export function connectSocket(token, dispatch, onStatus = () => {}) {
  disconnectSocket();
  socket = io(import.meta.env.VITE_SOCKET_URL || '/', { auth: { token }, reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
  socket.on('connect', () => onStatus('connected'));
  socket.on('disconnect', () => onStatus('reconnecting'));
  socket.io.on('reconnect_attempt', () => onStatus('reconnecting'));
  socket.on('new-announcement', (a) => dispatch(announcementReceived(a)));
  return socket;
}
export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null; } }
