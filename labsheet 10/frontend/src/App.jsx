import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './store/authSlice';
import { initSocketClient, disconnectSocket } from './socket/socketClient';

import Navbar from './components/Navbar';
import Toast from './components/Toast';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Announcements from './pages/Announcements';

function App() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);

  // Silent session restore on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Connect or reconnect Socket.io when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      initSocketClient(accessToken, dispatch);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Toast />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/announcements" element={<Announcements />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '24px 16px',
        color: '#6b7280',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: 40
      }}>
        CampusConnect • Full Stack Web Application • Lab Sheet 10
      </footer>
    </div>
  );
}

export default App;
