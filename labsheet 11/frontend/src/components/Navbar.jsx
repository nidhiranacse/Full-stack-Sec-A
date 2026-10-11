// Author: Radha Pandey, CSE - CampusConnect
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="navbar">
      <span className="brand">CampusConnect</span>
      <nav>
        {user && (
          <>
            <NavLink to="/" end>Events</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            {user.role === 'student' && <NavLink to="/dashboard">My Dashboard</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
            <span className="who">{user.name} ({user.role})</span>
            <button className="link" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </>
        )}
        {!user && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
