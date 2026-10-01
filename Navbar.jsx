import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearUnread } from '../store/eventSlice';

export default function Navbar({ socketStatus }) {
  const { user } = useSelector((s) => s.auth);
  const unread = useSelector((s) => s.events.unread);
  const dispatch = useDispatch();
  const nav = useNavigate();
  return (
    <header className="nav">
      <Link to="/dashboard" className="brand">🎓 CampusConnect</Link>
      <div className="nav-right">
        {user && <>
          <Link to="/events">Events</Link>
          {user.role === 'STUDENT' && (
            <button className="bell" aria-label="notifications" onClick={() => dispatch(clearUnread())}>
              🔔{unread > 0 && <span className="badge" data-testid="badge">{unread}</span>}
            </button>)}
          {socketStatus && <span className={`dot ${socketStatus}`} title={`socket: ${socketStatus}`} />}
          <span className="who">{user.name} <em className={`role ${user.role}`}>{user.role}</em></span>
          <button className="ghost" onClick={async () => { await dispatch(logout()); nav('/login'); }}>Logout</button>
        </>}
      </div>
    </header>
  );
}
