// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Pagination from '../components/Pagination';

const CATEGORIES = ['workshop', 'hackathon', 'placement', 'seminar', 'other'];
const EMPTY = { title: '', description: '', category: 'workshop', date: '', venue: '', capacity: 50 };
const toLocalInput = (iso) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminEvents() {
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [list, setList] = useState({ data: [], totalPages: 1 });
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [regs, setRegs] = useState(null); // { title, rows }
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.get('/events', { params: { page, limit: 10 } }).then((r) => setList(r.data)).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [page, reload]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return setMsg({ type: 'error', text: 'Title must be at least 3 characters' });
    if (!form.date) return setMsg({ type: 'error', text: 'Pick a date and time' });
    if (form.venue.trim().length < 2) return setMsg({ type: 'error', text: 'Venue is required' });
    if (!(Number(form.capacity) >= 1)) return setMsg({ type: 'error', text: 'Capacity must be at least 1' });
    const payload = { ...form, capacity: Number(form.capacity), date: new Date(form.date).toISOString() };
    try {
      if (editId) await api.put(`/events/${editId}`, payload);
      else await api.post('/events', payload);
      setMsg({ type: 'ok', text: editId ? 'Event updated' : 'Event created' });
      setForm(EMPTY);
      setEditId(null);
      setReload((n) => n + 1);
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const edit = (ev) => {
    setEditId(ev.id);
    setForm({ title: ev.title, description: ev.description || '', category: ev.category, date: toLocalInput(ev.date), venue: ev.venue, capacity: ev.capacity });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}" and its registrations?`)) return;
    try {
      await api.delete(`/events/${ev.id}`);
      setReload((n) => n + 1);
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const showRegs = async (ev) => {
    try {
      const r = await api.get(`/events/${ev.id}/registrations`);
      setRegs({ title: ev.title, rows: r.data.data });
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <>
      <form className="card form" onSubmit={submit}>
        <h3>{editId ? 'Edit event' : 'Create event'}</h3>
        {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'error'}>{msg.text}</p>}
        <input placeholder="Title" value={form.title} onChange={set('title')} />
        <select value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="datetime-local" value={form.date} onChange={set('date')} />
        <input placeholder="Venue" value={form.venue} onChange={set('venue')} />
        <input type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={set('capacity')} />
        <textarea placeholder="Description" rows="3" value={form.description} onChange={set('description')} />
        <div>
          <button>{editId ? 'Update' : 'Create'}</button>{' '}
          {editId && <button type="button" className="secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Date</th><th>Category</th><th>Seats</th><th>Actions</th></tr></thead>
          <tbody>
            {list.data.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{new Date(ev.date).toLocaleString()}</td>
                <td>{ev.category}</td>
                <td>{ev.registered}/{ev.capacity}</td>
                <td className="actions">
                  <button className="link" onClick={() => showRegs(ev)}>Students</button>
                  <button className="link" onClick={() => edit(ev)}>Edit</button>
                  <button className="link danger" onClick={() => remove(ev)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={list.totalPages} onChange={setPage} />
      </div>

      {regs && (
        <div className="card">
          <h3>Registered students: {regs.title}</h3>
          {regs.rows.length === 0 ? <p>No registrations yet.</p> : (
            <ul>{regs.rows.map((s) => <li key={s.id}>{s.name} <span className="muted">{s.email}</span></li>)}</ul>
          )}
          <button className="secondary" onClick={() => setRegs(null)}>Close</button>
        </div>
      )}
    </>
  );
}
