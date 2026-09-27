import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosInstance';
import EventModal from '../components/EventModal';
import AnnouncementModal from '../components/AnnouncementModal';
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Megaphone,
  Trash2,
  Edit,
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { refetchAnnouncements } = useSocket();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalEvents: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6,
  });

  // Redis cache indicator state
  const [cacheStatus, setCacheStatus] = useState({ cached: false, responseTimeMs: 0 });

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 6,
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data?.success) {
        setEvents(res.data.events);
        setPagination(res.data.pagination);
        setCacheStatus({
          cached: res.data.cached,
          responseTimeMs: res.data.responseTimeMs || 0,
        });
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleSaveEvent = async (eventData) => {
    if (selectedEvent) {
      // Update
      await api.put(`/events/${selectedEvent._id}`, eventData);
      setActionMessage('Event updated successfully! (Redis cache invalidated)');
    } else {
      // Create
      await api.post('/events', eventData);
      setActionMessage('Event created successfully! (Redis cache invalidated)');
    }
    setTimeout(() => setActionMessage(''), 4000);
    fetchEvents();
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setActionMessage('Event deleted successfully! (Redis cache invalidated)');
      setTimeout(() => setActionMessage(''), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleToggleRsvp = async (id) => {
    try {
      const res = await api.post(`/events/${id}/rsvp`);
      setActionMessage(res.data.message);
      setTimeout(() => setActionMessage(''), 3000);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Role Banner */}
      <div
        style={{
          background: isAdmin
            ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
            : 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {user?.role} Portal
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px', marginTop: '4px', maxWidth: '600px' }}>
            {isAdmin
              ? 'Manage college events, coordinate attendee RSVPs, and broadcast instant real-time announcements to students.'
              : 'Explore upcoming campus hackathons, workshops, and seminars. RSVP with one click and stay updated with live notifications.'}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={openCreateModal}
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Plus size={18} />
              <span>Create Event</span>
            </button>
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Megaphone size={18} />
              <span>Broadcast Live</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter / Search & Redis Caching Status Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Search & Category Filter Form */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search events by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative', width: '160px' }}>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#fff',
                outline: 'none',
              }}
            >
              <option value="">All Categories</option>
              <option value="Workshop">Workshop</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Seminar">Seminar</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="General">General</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '9px 18px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Search
          </button>
        </form>

        {/* Task 3 Redis Cache Performance Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: cacheStatus.cached ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${cacheStatus.cached ? '#86efac' : '#e2e8f0'}`,
            fontSize: '12px',
            fontWeight: 600,
            color: cacheStatus.cached ? '#15803d' : '#64748b',
          }}
          title="Redis caching status for GET /api/events with 60-second TTL"
        >
          <Zap size={15} color={cacheStatus.cached ? '#16a34a' : '#94a3b8'} />
          <span>
            Cache: <strong>{cacheStatus.cached ? 'HIT (Redis 60s TTL)' : 'MISS (MongoDB)'}</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span>{cacheStatus.responseTimeMs} ms</span>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600 }}>Loading events from CampusConnect...</p>
        </div>
      ) : events.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>No events found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {search || category ? 'Try adjusting your search query or filters.' : 'Check back later for new campus events!'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {events.map((event) => {
            const isRsvpd = event.rsvps?.some((r) => (r._id || r) === user?.id);
            const rsvpCount = event.rsvps?.length || 0;
            const eventDate = new Date(event.date);

            return (
              <div
                key={event._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#eef2ff',
                        color: '#4f46e5',
                      }}
                    >
                      {event.category || 'General'}
                    </span>

                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(event)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#475569',
                          }}
                          title="Edit Event"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#dc2626',
                          }}
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {event.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: 1.5,
                      marginBottom: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      <Calendar size={15} color="#4f46e5" />
                      <span>{eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      <Clock size={15} color="#4f46e5" />
                      <span>{eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      <MapPin size={15} color="#4f46e5" />
                      <span>{event.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      <Users size={15} color="#4f46e5" />
                      <span>
                        {rsvpCount} / {event.capacity} attending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: RSVP */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {isRsvpd && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#16a34a',
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle size={15} /> Attending
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleRsvp(event._id)}
                    style={{
                      marginLeft: 'auto',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: isRsvpd ? '#fef2f2' : '#4f46e5',
                      color: isRsvpd ? '#dc2626' : '#ffffff',
                      border: isRsvpd ? '1px solid #fecaca' : 'none',
                    }}
                  >
                    {isRsvpd ? 'Cancel RSVP' : 'RSVP Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls (Task 4) */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            marginTop: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: pagination.hasPrevPage ? '#334155' : '#94a3b8',
              cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalEvents} total)
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: pagination.hasNextPage ? '#334155' : '#94a3b8',
              cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        initialData={selectedEvent}
      />

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onCreated={() => {
          setActionMessage('Announcement broadcasted in real-time to all connected students!');
          setTimeout(() => setActionMessage(''), 5000);
          refetchAnnouncements();
        }}
      />
    </div>
  );
};

export default DashboardPage;
