import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, Sparkles } from 'lucide-react';
import API from '../services/api';
import { EventCard } from '../components/EventCard';
import { Pagination } from '../components/Pagination';
import { CreateEventModal } from '../components/CreateEventModal';
import { AttendeesModal } from '../components/AttendeesModal';
import { useAuth } from '../context/AuthContext';

export const EventsPage = () => {
  const { isAdmin, isStudent } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);

  const categories = ['All', 'Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Cultural'];

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 9,
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined
      };

      const res = await API.get('/events', { params });
      setEvents(res.data.events || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalEvents(res.data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    setActionLoading(eventId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await API.post(`/events/${eventId}/register`);
      setSuccessMsg(res.data.message || 'Successfully registered for event!');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setActionLoading(eventId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await API.post(`/events/${eventId}/unregister`);
      setSuccessMsg(res.data.message || 'Registration cancelled.');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event? All student registrations for this event will also be removed.')) return;
    setActionLoading(eventId);
    try {
      await API.delete(`/events/${eventId}`);
      setSuccessMsg('Event deleted successfully.');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Header Strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Calendar size={16} /> Campus Calendar
            </div>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem' }}>College Events & Drives</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Explore technical workshops, competitive hackathons, and placement drives.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Plus size={18} />
              Publish New Event
            </button>
          )}
        </div>

        {/* Success or Error Banners */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search events by title, keyword, or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginRight: '0.25rem' }}>
              Category:
            </span>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  style={{
                    background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Loading events catalog...
          </div>
        ) : events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <Calendar size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No events found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid-cards">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  onViewAttendees={(ev) => setAttendeesModalEvent(ev)}
                  onDelete={handleDeleteEvent}
                  loadingAction={actionLoading}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalEvents}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}
      </div>

      {/* Admin Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      <AttendeesModal
        isOpen={!!attendeesModalEvent}
        event={attendeesModalEvent}
        onClose={() => setAttendeesModalEvent(null)}
      />
    </div>
  );
};
