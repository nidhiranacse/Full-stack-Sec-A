// Author: Radha Pandey, CSE - CampusConnect
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// <ProtectedRoute role="admin"> blocks other roles
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
