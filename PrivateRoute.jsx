import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Blocks unauthenticated users; optional `role` restricts to a single role (RoleRoute behaviour)
export default function PrivateRoute({ role }) {
  const { user, checked } = useSelector((s) => s.auth);
  if (!checked && !user) return <p className="center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
