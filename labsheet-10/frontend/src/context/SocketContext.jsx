import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../api/axiosInstance';
import api from '../api/axiosInstance';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  // Fetch initial announcements when logged in
  const fetchAnnouncements = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/announcements?limit=20');
      if (res.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.warn('Could not fetch announcements:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Connect / disconnect socket based on authentication state
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket.io] Connected to notification server');
      setIsConnected(true);
    });

    newSocket.on('connection-established', (data) => {
      console.log('[Socket.io] Connection confirmed:', data);
    });

    // Listen for live announcement event pushed by Admin (Task 2)
    const handleNewAnnouncement = (announcement) => {
      console.log('[Socket.io] Received new-announcement:', announcement);
      // Prepend to announcements list
      setAnnouncements((prev) => [announcement, ...prev]);
      // Increment live unread badge counter
      setUnreadCount((prev) => prev + 1);
      // Trigger live toast notification
      setActiveToast(announcement);
    };

    newSocket.on('new-announcement', handleNewAnnouncement);
    newSocket.on('announcement-broadcast', (announcement) => {
      // If user is Admin, also receive broadcast update
      if (user.role === 'ADMIN') {
        handleNewAnnouncement(announcement);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('[Socket.io] Connect error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('new-announcement');
      newSocket.off('announcement-broadcast');
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        announcements,
        unreadCount,
        activeToast,
        markAllAsRead,
        dismissToast,
        refetchAnnouncements: fetchAnnouncements,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
