import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import EventCard from '../components/EventCard.jsx';
import Pagination from '../components/Pagination.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Events() {
  const { authFetch } = useAuth();

  const [events,      setEvents]      = useState([]);
  const [search,      setSearch]      = useState('');
  const [debSearch,   setDebSearch]   = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [myRsvpSet,   setMyRsvpSet]   = useState(new Set());

  // Load user's existing RSVPs on mount
  useEffect(() => {
    authFetch(`${API_BASE}/events/my-rsvps`)
      .then((r) => r.json())
      .then((data) => {
        setMyRsvpSet(new Set((data || []).map((e) => e.id)));
      })
      .catch(() => {});
  }, []);

  // Debounce search input (400 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch events whenever debounced search or page changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = `${API_BASE}/events?search=${encodeURIComponent(debSearch)}&page=${page}&limit=6`;
        const res  = await authFetch(url);
        const data = await res.json();
        setEvents(data.events     || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total         || 0);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [debSearch, page]);

  function handleRsvpChange(eventId, rsvped) {
    setMyRsvpSet((prev) => {
      const next = new Set(prev);
      if (rsvped) next.add(eventId);
      else        next.delete(eventId);
      return next;
    });
  }

  return (
    <div className="page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Campus Events</h1>
          <p className="page-subtitle">{total} event{total !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="event-search"
            className="form-input search-input"
            type="search"
            placeholder="Search by title, description, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search events"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div className="spinner" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="emoji">🎭</div>
          <h3>No events found</h3>
          <p>{search ? 'Try a different search term.' : 'Check back soon for upcoming events!'}</p>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                userRsvped={myRsvpSet.has(ev.id)}
                onRsvpChange={handleRsvpChange}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
