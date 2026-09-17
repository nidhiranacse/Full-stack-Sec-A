import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function fmt(str) {
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const { user, authFetch, socket } = useAuth();

  const [events,        setEvents]        = useState([]);
  const [totalEvents,   setTotalEvents]   = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [rsvpCount,     setRsvpCount]     = useState(0);
  const [newIds,        setNewIds]        = useState(new Set());
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [evRes, annRes, rsvpRes] = await Promise.all([
          authFetch(`${API_BASE}/events?page=1&limit=4`),
          authFetch(`${API_BASE}/announcements`),
          authFetch(`${API_BASE}/events/my-rsvps`),
        ]);
        const evData   = await evRes.json();
        const annData  = await annRes.json();
        const rsvpData = await rsvpRes.json();

        setEvents(evData.events || []);
        setTotalEvents(evData.total || 0);
        setAnnouncements(Array.isArray(annData) ? annData : []);
        setRsvpCount(Array.isArray(rsvpData) ? rsvpData.length : 0);
      } catch (e) {
        console.error('Dashboard load error', e);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Listen for real-time announcements ──────────────────────────────
  useEffect(() => {
    if (!socket) return;
    function onNew(ann) {
      setAnnouncements((prev) => [ann, ...prev]);
      setNewIds((prev) => new Set([...prev, ann.id]));
      setTimeout(() => {
        setNewIds((prev) => { const n = new Set(prev); n.delete(ann.id); return n; });
      }, 12_000);
    }
    socket.on('new_announcement', onNew);
    return () => socket.off('new_announcement', onNew);
  }, [socket]);

  if (loading) {
    return (
      <div className="page flex items-center" style={{ justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening on campus today</p>
      </div>

      {/* ── Stats ── */}
      <div className="stat-cards">
        <div className="glass-card stat-card">
          <div className="stat-number">{totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-number">{rsvpCount}</div>
          <div className="stat-label">My RSVPs</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-number">{announcements.length}</div>
          <div className="stat-label">Announcements</div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="dash-grid">

        {/* Upcoming events */}
        <div className="dash-section">
          <h2>🗓️ Upcoming Events</h2>
          {events.length === 0 ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No upcoming events
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="glass-card" style={{ padding: '18px', marginBottom: '12px' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-teal)', fontWeight: 700, marginBottom: 4 }}>
                      📅 {fmt(ev.date)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{ev.title}</div>
                    {ev.location && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 3 }}>
                        📍 {ev.location}
                      </div>
                    )}
                  </div>
                  <span className="badge badge-count">{ev.rsvpCount} RSVPs</span>
                </div>
              </div>
            ))
          )}
          <Link to="/events" className="btn btn-secondary" style={{ marginTop: 8 }}>
            View All Events →
          </Link>
        </div>

        {/* Announcements */}
        <div className="dash-section">
          <h2>
            📢 Announcements&nbsp;
            {socket && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                <span className="live-dot" />Live
              </span>
            )}
          </h2>

          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No announcements yet.</p>
          ) : (
            announcements.slice(0, 8).map((ann) => (
              <div
                key={ann.id}
                className={`ann-item ${newIds.has(ann.id) ? 'ann-new' : ''}`}
              >
                <div className="ann-title">{ann.title}</div>
                <div className="ann-content">{ann.content}</div>
                <div className="ann-meta">
                  <span>By {ann.creatorName}</span>
                  <span>{fmt(ann.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
