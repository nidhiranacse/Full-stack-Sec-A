import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const accessToken = useSelector(
    (state) => state.auth.accessToken
  );

  return accessToken ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}