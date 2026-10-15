import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <Toast />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/events"
          element={<ProtectedRoute><Events /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </div>
  );
}
