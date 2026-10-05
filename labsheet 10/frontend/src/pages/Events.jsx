import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchEvents,
  createNewEvent,
  updateExistingEvent,
  removeEvent,
  rsvpToEvent,
  setSearchQuery,
  setSelectedCategory
} from '../store/eventSlice';
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Check,
  Trash2,
  Edit2,
  X,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ['ALL', 'ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'GENERAL'];

const Events = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: events, pagination, cacheStatus, loading, searchQuery, selectedCategory } = useSelector((state) => state.events);

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'GENERAL',
    capacity: 50
  });

  const isAdmin = user?.role === 'ADMIN';

  // Load events
  useEffect(() => {
    dispatch(
      fetchEvents({
        page: pagination.page,
        search: searchQuery,
        category: selectedCategory
      })
    );
  }, [dispatch, searchQuery, selectedCategory]);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleCategorySelect = (cat) => {
    dispatch(setSelectedCategory(cat));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(
        fetchEvents({
          page: newPage,
          search: searchQuery,
          category: selectedCategory
        })
      );
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      location: '',
      category: 'GENERAL',
      capacity: 50
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (ev) => {
    setEditingEventId(ev._id);
    setFormData({
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date).toISOString().slice(0, 16),
      location: ev.location,
      category: ev.category,
      capacity: ev.capacity
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingEventId) {
      await dispatch(updateExistingEvent({ id: editingEventId, data: formData }));
    } else {
      await dispatch(createNewEvent(formData));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will invalidate the Redis cache.')) {
      await dispatch(removeEvent(id));
    }
  };

  const handleRsvp = async (id) => {
    await dispatch(rsvpToEvent(id));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6' }}>Campus Events</h1>
            <span
              id="redis-cache-badge"
              className={`badge ${cacheStatus === 'HIT' ? 'badge-cache-hit' : 'badge-cache-miss'}`}
              title="Redis Caching Layer (TTL: 60s)"
            >
              <Database size={11} style={{ marginRight: 4 }} />
              Redis {cacheStatus || 'MISS'}
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: 4 }}>
            Explore workshops, seminars, and gatherings across the campus.
          </p>
        </div>

        {isAdmin && (
          <button
            id="create-event-btn"
            onClick={handleOpenCreate}
            className="btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <Plus size={18} />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: 18, marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              id="search-events-input"
              type="text"
              placeholder="Search events by title..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="form-input"
              style={{ width: '100%', paddingLeft: 40 }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#6366f1' : 'var(--border-color)',
                  background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedCategory === cat ? '#a5b4fc' : '#9ca3af',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#818cf8' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading events from CampusConnect...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Calendar size={48} color="#4b5563" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6', marginBottom: 8 }}>No Events Found</h3>
          <p style={{ color: '#9ca3af', maxWidth: 400, margin: '0 auto' }}>
            No campus events matched your search query or selected category filter.
          </p>
        </div>
      ) : (
        <div
          id="event-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
            marginBottom: 32
          }}
        >
          {events.map((ev) => {
            const isRsvpd = ev.rsvpUsers?.some((u) =>
              typeof u === 'object' ? u._id === user?.id : u === user?.id
            );
            const rsvpCount = ev.rsvpUsers?.length || 0;
            const spotsRemaining = Math.max(0, ev.capacity - rsvpCount);
            const isFull = spotsRemaining === 0;

            return (
              <div
                key={ev._id}
                className="glass-panel event-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Category & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                      {ev.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: spotsRemaining > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                      {spotsRemaining > 0 ? `${spotsRemaining} spots left` : 'Fully Booked'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.25rem', color: '#f3f4f6', marginBottom: 8, lineHeight: 1.3 }}>
                    {ev.title}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 16 }}>
                    {ev.description}
                  </p>

                  {/* Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#d1d5db' }}>
                      <Calendar size={14} color="#818cf8" />
                      <span>{new Date(ev.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#d1d5db' }}>
                      <MapPin size={14} color="#818cf8" />
                      <span>{ev.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#d1d5db' }}>
                      <Users size={14} color="#818cf8" />
                      <span>Capacity: {rsvpCount} / {ev.capacity} attendees</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-color)',
                  marginTop: 8
                }}>
                  {/* Student RSVP Action */}
                  <button
                    onClick={() => handleRsvp(ev._id)}
                    disabled={!isRsvpd && isFull}
                    className={`btn-rsvp ${isRsvpd ? 'rsvpd' : ''}`}
                    aria-label={`RSVP for ${ev.title}`}
                  >
                    {isRsvpd ? (
                      <>
                        <Check size={16} />
                        <span>RSVP Confirmed</span>
                      </>
                    ) : isFull ? (
                      <span>Full</span>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>RSVP Now</span>
                      </>
                    )}
                  </button>

                  {/* Admin Edit/Delete Actions */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px' }}
                        title="Edit event"
                        aria-label="Edit event"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(ev._id)}
                        className="btn-danger"
                        style={{ padding: '6px 10px' }}
                        title="Delete event"
                        aria-label="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create / Edit Event Modal (Admin Only) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', color: '#f3f4f6' }}>
                {editingEventId ? 'Edit Campus Event' : 'Create New Campus Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="event-title">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual AI & Robotics Hackathon"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="event-desc">Description</label>
                <textarea
                  id="event-desc"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide comprehensive details about the schedule, requirements, and agenda..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="event-date">Date & Time</label>
                  <input
                    id="event-date"
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="event-cat">Category</label>
                  <select
                    id="event-cat"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="SEMINAR">SEMINAR</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="event-location">Venue / Location</label>
                  <input
                    id="event-location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Main Auditorium Hall 2"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="event-capacity">Capacity</label>
                  <input
                    id="event-capacity"
                    type="number"
                    min={1}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEventId ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
