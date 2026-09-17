import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        🎓 CampusConnect
      </NavLink>

      <ul className="navbar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>
            Events
          </NavLink>
        </li>
        {user?.role === 'ADMIN' && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
              Admin Panel
            </NavLink>
          </li>
        )}
      </ul>

      <div className="navbar-right">
        <div className="user-info">
          <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name}</span>
        </div>
        <button
          id="logout-btn"
          className="btn btn-secondary"
          onClick={handleLogout}
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
