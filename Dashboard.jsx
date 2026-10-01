import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, postAnnouncement } from '../store/eventSlice';

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const { notifications, total } = useSelector((s) => s.events);
  const dispatch = useDispatch();
  const [ev, setEv] = useState({ title: '', location: '', date: '' });
  const [an, setAn] = useState({ title: '', body: '' });
  const [msg, setMsg] = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const addEvent = async (e) => { e.preventDefault(); const r = await dispatch(createEvent(ev)); if (createEvent.fulfilled.match(r)) { flash('✅ Event created (cache invalidated)'); setEv({ title: '', location: '', date: '' }); } else flash('❌ Could not create event'); };
  const announce = async (e) => { e.preventDefault(); const r = await dispatch(postAnnouncement(an)); if (postAnnouncement.fulfilled.match(r)) { flash('📢 Announcement broadcast to all students'); setAn({ title: '', body: '' }); } else flash('❌ Could not post'); };

  return (
    <div className="page">
      <h2>{user.role === 'ADMIN' ? 'Admin Dashboard' : 'Student Dashboard'}</h2>
      <p className="muted">Welcome, <strong>{user.name}</strong>. You are signed in as <em className={`role ${user.role}`}>{user.role}</em>.</p>
      {msg && <div className="flash">{msg}</div>}
      {user.role === 'ADMIN' ? (
        <div className="grid2">
          <form className="card" onSubmit={addEvent}>
            <h3>Create event</h3>
            <input placeholder="Title" value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} required />
            <input placeholder="Location" value={ev.location} onChange={(e) => setEv({ ...ev, location: e.target.value })} />
            <input type="date" value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} required />
            <button type="submit">Create</button>
          </form>
          <form className="card" onSubmit={announce}>
            <h3>Post announcement</h3>
            <input placeholder="Title" value={an.title} onChange={(e) => setAn({ ...an, title: e.target.value })} required />
            <textarea placeholder="Message to all students" rows="3" value={an.body} onChange={(e) => setAn({ ...an, body: e.target.value })} required />
            <button type="submit">Broadcast</button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3>Live announcements</h3>
          {notifications.length === 0 ? <p className="muted">No new announcements yet. They appear here instantly – no refresh needed.</p>
            : notifications.map((n) => <div key={n._id} className="ann"><strong>{n.title}</strong><p>{n.body}</p><small>— {n.by}</small></div>)}
        </div>
      )}
    </div>
  );
}
