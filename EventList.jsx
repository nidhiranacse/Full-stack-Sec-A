import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, setSearch, setPage, toggleRsvp, deleteEvent } from '../store/eventSlice';

export default function EventList() {
  const dispatch = useDispatch();
  const { items, page, pages, search, total, loading, cache } = useSelector((s) => s.events);
  const { user } = useSelector((s) => s.auth);
  const [q, setQ] = useState(search);

  // debounce search-by-title
  useEffect(() => { const t = setTimeout(() => dispatch(setSearch(q)), 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { dispatch(fetchEvents({ page, search })); }, [page, search]);

  const rsvp = async (id) => { await dispatch(toggleRsvp(id)); dispatch(fetchEvents({ page, search })); };
  const remove = async (id) => { await dispatch(deleteEvent(id)); dispatch(fetchEvents({ page, search })); };

  return (
    <div className="page">
      <div className="row">
        <h2>Events <small className="muted">({total})</small></h2>
        {cache && <span className={`pill ${cache}`} title="X-Cache response header">Redis cache: {cache}</span>}
      </div>
      <input className="search" placeholder="Search by title…" aria-label="search" value={q} onChange={(e) => setQ(e.target.value)} />
      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length === 0 && <p className="muted">No events found.</p>}
      <ul className="events">
        {items.map((e) => {
          const going = e.rsvps?.includes(user.id);
          return (
            <li key={e._id} className="card event">
              <div>
                <h3>{e.title}</h3>
                <p className="muted">📍 {e.location || 'TBA'} · 📅 {new Date(e.date).toLocaleDateString()} · 👥 {e.rsvps?.length || 0} going</p>
              </div>
              {user.role === 'STUDENT'
                ? <button className={going ? 'ghost' : ''} onClick={() => rsvp(e._id)}>{going ? '✓ Going (cancel)' : 'RSVP'}</button>
                : <button className="danger" onClick={() => remove(e._id)}>Delete</button>}
            </li>);
        })}
      </ul>
      <div className="pager">
        <button className="ghost" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}>← Prev</button>
        <span>Page {page} of {pages}</span>
        <button className="ghost" disabled={page >= pages} onClick={() => dispatch(setPage(page + 1))}>Next →</button>
      </div>
    </div>
  );
}
