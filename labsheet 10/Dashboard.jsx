import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../redux/authSlice";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div>
      <h1>CampusConnect Dashboard</h1>

      <h2>Welcome, {user?.name}</h2>

      <p>
        Role: {user?.role}
      </p>

      {user?.role === "ADMIN" && (
        <div>
          <h3>Admin Dashboard</h3>
          <p>
            You can create, edit and delete events.
          </p>
        </div>
      )}

      {user?.role === "STUDENT" && (
        <div>
          <h3>Student Dashboard</h3>
          <p>
            You can view events and RSVP.
          </p>
        </div>
      )}

      <button onClick={() => navigate("/events")}>
        View Events
      </button>

      <br /><br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;