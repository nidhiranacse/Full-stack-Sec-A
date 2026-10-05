import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsPage } from './pages/EventsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Route guard: requires authentication
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
      Verifying your session...
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route guard: requires a specific role
const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#ef4444' }}>403 — Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          This area requires <strong>{role}</strong> privileges. Your role is <strong>{user.role}</strong>.
        </p>
        <a href="/" className="btn btn-secondary">← Return to Home</a>
      </div>
    );
  }
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'} replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'} replace />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route
        path="/dashboard/student"
        element={
          <PrivateRoute>
            <RoleRoute role="student">
              <StudentDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute>
            <RoleRoute role="admin">
              <AdminDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route path="*" element={
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>404 — Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            The page you are looking for doesn't exist.
          </p>
          <a href="/" className="btn btn-primary">Go Back Home</a>
        </div>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AppRoutes />
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
