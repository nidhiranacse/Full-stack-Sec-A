import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EventList from "./pages/EventList.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";

// Lab Sheet 10 — Saiyed Shizain: route map with auth + role guards.
export default function App() {
  const { user, accessToken } = useSelector((state) => state.auth);
  return (
    <div className="app">
      <header>
        <h1>CampusConnect</h1>
        <nav>
          <Link to="/">Home</Link>
          {accessToken ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
        {user && <p>Signed in as {user.name} ({user.role})</p>}
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventList />} />
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<Dashboard admin />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to={accessToken ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
