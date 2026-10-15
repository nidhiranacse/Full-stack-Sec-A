// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import Pagination from '../components/Pagination';

const CATEGORIES = ['workshop', 'hackathon', 'placement', 'seminar', 'other'];

export default function Events() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: '', date: '', upcoming: true });
  const [q, setQ] = useState('');            // debounced search text
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQ(filters.q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/events', { params: { q, category: filters.category, date: filters.date, upcoming: filters.upcoming, page, limit: 10 } })
      .then((r) => active && setData(r.data))
      .catch((e) => active && setMsg({ type: 'error', text: errMsg(e) }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q, filters.category, filters.date, filters.upcoming, page]);

  const change = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    if (k !== 'q') setPage(1);
  };

  const toggle = async (ev) => {
    setMsg({ type: '', text: '' });
    try {
      const updated = ev.isRegistered
        ? (await api.delete(`/events/${ev.id}/register`), { ...ev, isRegistered: false, registered: ev.registered - 1, seatsLeft: ev.seatsLeft + 1 })
        : (await api.post(`/events/${ev.id}/register`)).data;
      setData((d) => ({ ...d, data: d.data.map((x) => (x.id === ev.id ? updated : x)) }));
      setMsg({ type: 'ok', text: ev.isRegistered ? 'Unregistered successfully' : 'Registered successfully' });
    } catch (e) {
      setMsg({ type: 'error', text: errMsg(e) });
    }
  };

  return (
    <section>
      <h2>Events</h2>
      <div className="filters">
        <input placeholder="Search by name..." value={filters.q} onChange={change('q')} />
        <select value={filters.category} onChange={change('category')}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={change('date')} />
        <label className="check"><input type="checkbox" checked={filters.upcoming} onChange={change('upcoming')} /> Upcoming only</label>
      </div>

      {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'error'}>{msg.text}</p>}
      {loading && <p>Loading...</p>}
      {!loading && data.data.length === 0 && <p>No events found.</p>}

      <div className="grid">
        {data.data.map((ev) => (
          <article className="card" key={ev.id}>
            <span className={`tag ${ev.category}`}>{ev.category}</span>
            <h3>{ev.title}</h3>
            <p className="muted">{new Date(ev.date).toLocaleString()} | {ev.venue}</p>
            {ev.description && <p>{ev.description}</p>}
            <p><strong>{ev.seatsLeft}</strong> of {ev.capacity} seats left</p>
            {user.role === 'student' && (
              <button
                className={ev.isRegistered ? 'secondary' : ''}
                disabled={!ev.isRegistered && ev.seatsLeft === 0}
                onClick={() => toggle(ev)}
              >
                {ev.isRegistered ? 'Unregister' : ev.seatsLeft === 0 ? 'Full' : 'Register'}
              </button>
            )}
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </section>
  );
}
