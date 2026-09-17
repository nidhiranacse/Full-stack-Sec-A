import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

export default function EventCard({ event, userRsvped = false, onRsvpChange, onEdit, onDelete, showAdmin = false }) {
  const { authFetch } = useAuth();
  const [rsvped,    setRsvped]    = useState(userRsvped);
  const [rsvpCount, setRsvpCount] = useState(Number(event.rsvpCount) || 0);
  const [loading,   setLoading]   = useState(false);

  async function handleRsvp() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API_BASE}/events/${event.id}/rsvp`, { method: 'POST' });
      const data = await res.json();
      setRsvped(data.rsvped);
      setRsvpCount((c) => data.rsvped ? c + 1 : c - 1);
      onRsvpChange?.(event.id, data.rsvped);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="glass-card event-card">
      <div className="event-date">📅 {formatDate(event.date)}</div>
      <h3 className="event-title">{event.title}</h3>
      {event.description && <p className="event-desc">{event.description}</p>}
      <div className="event-meta">
        {event.location && <span>📍 {event.location}</span>}
        <span>👥 {rsvpCount} RSVPs</span>
      </div>
      <div className="event-actions">
        <button
          id={`rsvp-${event.id}`}
          className={`btn ${rsvped ? 'btn-success' : 'btn-primary'}`}
          onClick={handleRsvp}
          disabled={loading}
          style={{ fontSize: '12px', padding: '8px 16px' }}
        >
          {loading ? '…' : rsvped ? '✓ RSVP\'d' : 'RSVP'}
        </button>
        {showAdmin && (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => onEdit?.(event)}
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onDelete?.(event.id)}
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              🗑 Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
