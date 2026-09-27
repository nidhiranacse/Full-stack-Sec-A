import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#4f46e5', fontWeight: 600 }}>Verifying permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #fee2e2' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>403 - Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          This page is restricted to <strong>{allowedRoles.join(', ')}</strong> roles. Your current role is <strong>{user.role}</strong>.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
