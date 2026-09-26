import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function fmt(str) {
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_EVENT = { title: '', description: '', date: '', location: '' };
const EMPTY_ANN   = { title: '', content: '' };

export default function AdminPanel() {
  const { authFetch } = useAuth();

  const [tab,          setTab]          = useState('events');
  const [events,       setEvents]       = useState([]);
  const [announcements,setAnnouncements]= useState([]);
  const [eventForm,    setEventForm]    = useState(EMPTY_EVENT);
  const [annForm,      setAnnForm]      = useState(EMPTY_ANN);
  const [editingId,    setEditingId]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [statusMsg,    setStatusMsg]    = useState({ text: '', ok: true });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    await Promise.all([loadEvents(), loadAnnouncements()]);
  }

  async function loadEvents() {
    try {
      const res  = await authFetch(`${API_BASE}/events?limit=100`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) { console.error(e); }
  }

  async function loadAnnouncements() {
    try {
      const res  = await authFetch(`${API_BASE}/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }

  function flash(text, ok = true) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg({ text: '', ok: true }), 4000);
  }

  // ── Event CRUD ─────────────────────────────────────────────────────
  async function handleEventSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT'  : 'POST';
    const url    = editingId
      ? `${API_BASE}/events/${editingId}`
      : `${API_BASE}/events`;

    try {
      const res  = await authFetch(url, { method, body: JSON.stringify(eventForm) });
      const data = await res.json();
      if (res.ok) {
        flash(editingId ? '✅ Event updated successfully!' : '✅ Event created successfully!');
        cancelEdit();
        loadEvents();
      } else {
        flash(`❌ ${data.errors?.[0]?.msg || data.error}`, false);
      }
    } catch { flash('❌ Network error', false); }
    setLoading(false);
  }

  function startEdit(ev) {
    setEditingId(ev.id);
    setEventForm({
      title:       ev.title,
      description: ev.description || '',
      date:        ev.date?.slice(0, 16),
      location:    ev.location || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEventForm(EMPTY_EVENT);
  }

  async function deleteEvent(id) {
    if (!window.confirm('Delete this event? RSVPs will also be removed.')) return;
    const res = await authFetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    if (res.ok) { flash('✅ Event deleted!'); loadEvents(); }
    else flash('❌ Delete failed', false);
  }

  // ── Announcement CRUD ──────────────────────────────────────────────
  async function handleAnnSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await authFetch(`${API_BASE}/announcements`, {
        method: 'POST',
        body:   JSON.stringify(annForm),
      });
      const data = await res.json();
      if (res.ok) {
        flash('✅ Announcement broadcast to all students! ⚡');
        setAnnForm(EMPTY_ANN);
        loadAnnouncements();
      } else {
        flash(`❌ ${data.errors?.[0]?.msg || data.error}`, false);
      }
    } catch { flash('❌ Network error', false); }
    setLoading(false);
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return;
    const res = await authFetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) { flash('✅ Announcement deleted!'); loadAnnouncements(); }
    else flash('❌ Delete failed', false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage events and broadcast announcements</p>
      </div>

      {/* Status message */}
      {statusMsg.text && (
        <div className={`status-msg ${statusMsg.ok ? 'status-ok' : 'status-err'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button id="tab-events"        className={`tab-btn ${tab === 'events'        ? 'active' : ''}`} onClick={() => setTab('events')}>🗓️ Events</button>
        <button id="tab-announcements" className={`tab-btn ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}>📢 Announcements</button>
      </div>

      {/* ── Events tab ── */}
      {tab === 'events' && (
        <>
          {/* Form */}
          <form className="glass-card admin-form" onSubmit={handleEventSubmit} id="event-form">
            <h3>{editingId ? '✏️ Edit Event' : '➕ Create New Event'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ev-title">Title *</label>
                <input id="ev-title" className="form-input" placeholder="e.g. Tech Fest 2025" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-location">Location</label>
                <input id="ev-location" className="form-input" placeholder="e.g. Main Auditorium" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-date">Date &amp; Time *</label>
                <input id="ev-date" className="form-input" type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-desc">Description</label>
                <input id="ev-desc" className="form-input" placeholder="Brief description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button id="ev-submit" className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? '…' : editingId ? 'Update Event' : 'Create Event'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>

          {/* Table */}
          <div className="glass-card table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th><th>Date</th><th>Location</th><th>RSVPs</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>{ev.title}</td>
                    <td>{fmt(ev.date)}</td>
                    <td>{ev.location || '—'}</td>
                    <td><span className="badge badge-student">{ev.rsvpCount}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary" onClick={() => startEdit(ev)}  style={{ fontSize: 11, padding: '5px 10px' }}>Edit</button>
                        <button className="btn btn-danger"    onClick={() => deleteEvent(ev.id)} style={{ fontSize: 11, padding: '5px 10px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 28 }}>
                      No events yet — create one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Announcements tab ── */}
      {tab === 'announcements' && (
        <>
          {/* Form */}
          <form className="glass-card admin-form" onSubmit={handleAnnSubmit} id="ann-form">
            <h3>📢 New Announcement</h3>
            <p style={{ fontSize: 13, color: 'var(--accent-teal)', marginBottom: 18 }}>
              ⚡ Instantly broadcast to all connected students via Socket.io
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="ann-title">Title *</label>
              <input id="ann-title" className="form-input" placeholder="Announcement headline" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ann-content">Content *</label>
              <textarea id="ann-content" className="form-textarea" placeholder="Write your announcement…" value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} required />
            </div>
            <button id="ann-submit" className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '…' : '📢 Broadcast Announcement'}
            </button>
          </form>

          {/* Table */}
          <div className="glass-card table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Content</th><th>Posted</th><th>Action</th></tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann.id}>
                    <td style={{ fontWeight: 600 }}>{ann.title}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 280 }}>
                      {ann.content.length > 80 ? ann.content.slice(0, 80) + '…' : ann.content}
                    </td>
                    <td>{fmt(ann.createdAt)}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => deleteAnnouncement(ann.id)} style={{ fontSize: 11, padding: '5px 10px' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 28 }}>
                      No announcements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
