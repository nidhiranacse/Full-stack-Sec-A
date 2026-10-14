import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { clearAnnouncementBadge } from "../features/events/eventsSlice";

export default function Dashboard({ admin = false }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const unread = useSelector((state) => state.events.unreadAnnouncements);

  return (
    <div>
      <h2>{admin ? "Admin Panel" : "Dashboard"}</h2>
      <p>Welcome, {user?.name} ({user?.role})</p>
      {unread > 0 && (
        <button onClick={() => dispatch(clearAnnouncementBadge())}>
          {unread} new announcement(s) — mark read
        </button>
      )}
      <p>
        <Link to="/events">Browse events</Link>
      </p>
    </div>
  );
}
