import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleRoute({ children, role }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default RoleRoute;