import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <h1>CampusConnect Dashboard</h1>

      <p>
        Welcome, {user?.name || 'User'}!
      </p>

      <p>
        Role: {user?.role || 'STUDENT'}
      </p>

      <div>
        <Link to="/events">
          <button>View Events</button>
        </Link>
      </div>
    </div>
  );
}