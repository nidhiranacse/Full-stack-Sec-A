import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

const API_BASE    = import.meta.env.VITE_API_URL    || '/api';
const SOCKET_URL  = import.meta.env.VITE_SOCKET_URL || '';  // empty = same origin (Vite proxy)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_user')); } catch { return null; }
  });
  const [socket, setSocket] = useState(null);

  // Keep accessToken in a ref so authFetch always reads the latest value
  const tokenRef = useRef(localStorage.getItem('cc_token'));

  // ── Connect / disconnect Socket.io based on auth state ────────────────
  useEffect(() => {
    if (!user) return;

    const s = io(SOCKET_URL, {
      transports:    ['websocket', 'polling'],
      reconnection:  true,
      reconnectionDelay: 1000,
    });
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [user?.id]);

  // ── Auth helpers ───────────────────────────────────────────────────────
  function login(userData, accessToken, refreshToken) {
    tokenRef.current = accessToken;
    setUser(userData);
    localStorage.setItem('cc_user',    JSON.stringify(userData));
    localStorage.setItem('cc_token',   accessToken);
    localStorage.setItem('cc_refresh', refreshToken);
  }

  function logout() {
    const refreshToken = localStorage.getItem('cc_refresh');
    fetch(`${API_BASE}/auth/logout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    }).catch(() => {});

    tokenRef.current = null;
    setUser(null);
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_refresh');
  }

  // ── Authenticated fetch with auto refresh ─────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const makeRequest = (token) =>
      fetch(url, {
        ...options,
        headers: {
          'Content-Type':  'application/json',
          ...options.headers,
          Authorization:   `Bearer ${token}`,
        },
      });

    let res = await makeRequest(tokenRef.current);

    // Access token expired — try to refresh
    if (res.status === 401) {
      const refreshToken = localStorage.getItem('cc_refresh');
      if (!refreshToken) { logout(); return res; }

      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          tokenRef.current = data.accessToken;
          localStorage.setItem('cc_token',   data.accessToken);
          localStorage.setItem('cc_refresh', data.refreshToken);
          // Retry original request
          res = await makeRequest(data.accessToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }

    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ user, socket, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
