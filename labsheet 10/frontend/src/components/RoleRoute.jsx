import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';

const RoleRoute = ({ allowedRoles = ['ADMIN'] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        maxWidth: 600,
        margin: '60px auto',
        padding: 32,
        textAlign: 'center',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 16
      }}>
        <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#fda4af', marginBottom: 8 }}>403 - Access Forbidden</h2>
        <p style={{ color: '#9ca3af', marginBottom: 20 }}>
          Your role <strong>({user?.role})</strong> does not have permission to view or manage this administrative section.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
