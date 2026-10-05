import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../store/eventSlice';
import { fetchAnnouncements } from '../store/announcementSlice';
import {
  Calendar,
  Bell,
  CheckCircle,
  Database,
  PlusCircle,
  TrendingUp,
  Shield,
  User,
  Zap,
  Radio
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { items: events, cacheStatus } = useSelector((state) => state.events);
  const { items: announcements } = useSelector((state) => state.announcements);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvents({ limit: 6 }));
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const isAdmin = user?.role === 'ADMIN';

  // Count student's RSVPs
  const myRsvps = events.filter((ev) =>
    ev.rsvpUsers?.some((u) => (typeof u === 'object' ? u._id === user?.id : u === user?.id))
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px 28px',
        marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(17, 24, 39, 0.8) 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
              {isAdmin ? <Shield size={12} style={{ marginRight: 4 }} /> : <User size={12} style={{ marginRight: 4 }} />}
              {user?.role} PORTAL
            </span>
            <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Radio size={14} className="pulse" /> Live Socket.io Sync Active
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6', marginBottom: 6 }}>
            Welcome back, {user?.name || 'Scholar'}!
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: 580 }}>
            {isAdmin
              ? 'You have administrative privileges to publish live campus announcements, create/edit college events, and monitor real-time student RSVPs.'
              : 'Explore upcoming academic seminars, cultural festivals, and workshops. RSVP to secure your spots and receive instant broadcast alerts.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/events" className="btn-primary">
            <Calendar size={16} />
            <span>Browse Events</span>
          </Link>
          {isAdmin && (
            <Link to="/announcements" className="btn-secondary">
              <PlusCircle size={16} />
              <span>Broadcast Announcement</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>Total Campus Events</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: 8, borderRadius: 8 }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f3f4f6' }}>
            {events.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
            Scheduled for this semester
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>
              {isAdmin ? 'Active RSVPs Total' : 'My Confirmed RSVPs'}
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: 8, borderRadius: 8 }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f3f4f6' }}>
            {isAdmin ? events.reduce((acc, ev) => acc + (ev.rsvpUsers?.length || 0), 0) : myRsvps.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
            {isAdmin ? 'Across all campus events' : 'Reserved attendee seats'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>Announcements</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: 8, borderRadius: 8 }}>
              <Bell size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f3f4f6' }}>
            {announcements.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
            Live push via WebSockets
          </div>
        </div>

        {/* Metric 4: Redis Cache Monitor */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>Redis Cache Layer</span>
            <div style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', padding: 8, borderRadius: 8 }}>
              <Database size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className={`badge ${cacheStatus === 'HIT' ? 'badge-cache-hit' : 'badge-cache-miss'}`}>
              <Zap size={11} style={{ marginRight: 4 }} />
              {cacheStatus ? `CACHE ${cacheStatus}` : 'ACTIVE'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 8 }}>
            TTL: 60s • Auto-invalidates on mutations
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Events & Live Announcements Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Events preview */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>Upcoming Events</h3>
            <Link to="/events" style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {events.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
              No scheduled events found yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.slice(0, 3).map((ev) => (
                <div key={ev._id} style={{
                  padding: 14,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#f3f4f6', marginBottom: 4 }}>{ev.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                      {new Date(ev.date).toLocaleDateString()} • {ev.location}
                    </span>
                  </div>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc' }}>
                    {ev.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements Preview */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>Latest Announcements</h3>
            <Link to="/announcements" style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Live Feed →
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
              No campus announcements posted yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann._id} style={{
                  padding: 14,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>{ann.title}</h4>
                    <span className={`badge badge-priority-${ann.priority?.toLowerCase() || 'medium'}`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4 }}>
                    {ann.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
