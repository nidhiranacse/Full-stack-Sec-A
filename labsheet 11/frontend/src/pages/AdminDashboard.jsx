import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, BookOpen, Users, TrendingUp, Plus, Upload, Eye } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CreateEventModal } from '../components/CreateEventModal';
import { UploadResourceModal } from '../components/UploadResourceModal';
import { AttendeesModal } from '../components/AttendeesModal';

const AnalyticsCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.25rem'
  }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '12px',
      background: `${color}20`, border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.775rem', color, marginTop: '0.2rem', fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [uploadResourceOpen, setUploadResourceOpen] = useState(false);
  const [attendeesEvent, setAttendeesEvent] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await API.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load admin analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Loading admin analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0', color: '#f87171' }}>
          {error}
        </div>
      </div>
    );
  }

  const { analytics, events, recentRegistrations } = data;

  return (
    <div className="main-content">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              <ShieldCheck size={16} /> Faculty Administration Portal
            </div>
            <h1 style={{ fontSize: '2.25rem' }}>Admin Control Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.3rem' }}>
              Welcome, {user?.name} · Full analytics & management access
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => setCreateEventOpen(true)} className="btn btn-primary">
              <Plus size={17} /> New Event
            </button>
            <button onClick={() => setUploadResourceOpen(true)} className="btn btn-secondary">
              <Upload size={17} /> Upload Resource
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <AnalyticsCard icon={<Calendar size={24} />} label="Total Published Events" value={analytics.totalEvents} color="var(--primary)" />
          <AnalyticsCard icon={<BookOpen size={24} />} label="Academic Resources" value={analytics.totalResources} color="var(--accent)" />
          <AnalyticsCard icon={<Users size={24} />} label="Enrolled Students" value={analytics.totalStudents} color="#a855f7" />
          <AnalyticsCard
            icon={<TrendingUp size={24} />}
            label="Total Registrations"
            value={analytics.totalRegistrations}
            sub={`${analytics.occupancyRate}% Campus Occupancy`}
            color="var(--success)"
          />
        </div>

        {/* Seat Occupancy Banner */}
        {analytics.totalCapacity > 0 && (
          <div style={{
            background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            padding: '1.5rem', marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Campus Seat Occupancy Overview</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {analytics.totalBooked} booked / {analytics.totalCapacity} total capacity
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '999px',
                width: `${analytics.occupancyRate}%`,
                background: analytics.occupancyRate > 80
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, #10b981, #6366f1)',
                transition: 'width 0.6s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
              {analytics.occupancyRate}% Campus Fill Rate
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Events Roster Table */}
          <div>
            <div style={{
              background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden'
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--primary)" /> Events Roster & Fill Rates
                </h2>
                <Link to="/events" className="btn btn-secondary btn-sm">Manage Events</Link>
              </div>

              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No events published yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Event</th>
                        <th style={{ padding: '0.85rem' }}>Date</th>
                        <th style={{ padding: '0.85rem', textAlign: 'center' }}>Seats</th>
                        <th style={{ padding: '0.85rem', textAlign: 'center' }}>Fill %</th>
                        <th style={{ padding: '0.85rem' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev, idx) => {
                        const fillPct = ev.fillPercentage || 0;
                        return (
                          <tr key={ev._id} style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                          }}>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{ev.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ev.category}</div>
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '0.85rem', textAlign: 'center', color: ev.seatsAvailable === 0 ? '#ef4444' : '#34d399', fontWeight: 600 }}>
                              {ev.registeredCount} / {ev.maxSeats}
                            </td>
                            <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <div style={{ width: '64px', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{
                                    height: '100%', borderRadius: '999px', width: `${fillPct}%`,
                                    background: fillPct === 100 ? '#ef4444' : fillPct > 75 ? '#f59e0b' : '#10b981'
                                  }} />
                                </div>
                                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{fillPct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem' }}>
                              <button
                                onClick={() => setAttendeesEvent(ev)}
                                className="btn btn-secondary btn-sm"
                                style={{ gap: '0.3rem' }}
                              >
                                <Eye size={14} /> Roster
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Registrations Feed */}
          <div>
            <div style={{
              background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden'
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={19} color="#a855f7" /> Recent Registrations
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Latest 10 student sign-ups</p>
              </div>

              {(recentRegistrations || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                  No student registrations yet.
                </div>
              ) : (
                <div>
                  {recentRegistrations.map((reg) => (
                    <div key={reg._id} style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                          {reg.student?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          → {reg.event?.title?.length > 35 ? reg.event.title.substring(0, 33) + '…' : reg.event?.title}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                        {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal isOpen={createEventOpen} onClose={() => setCreateEventOpen(false)} onEventCreated={fetchDashboard} />
      <UploadResourceModal isOpen={uploadResourceOpen} onClose={() => setUploadResourceOpen(false)} onResourceUploaded={fetchDashboard} />
      <AttendeesModal isOpen={!!attendeesEvent} event={attendeesEvent} onClose={() => setAttendeesEvent(null)} />
    </div>
  );
};
