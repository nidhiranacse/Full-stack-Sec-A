import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, BookOpen, CheckCircle, Clock, Download } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem'
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
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
    </div>
  </div>
);

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/student');
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ color: '#f87171' }}>{error}</div>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Events</Link>
        </div>
      </div>
    );
  }

  const { stats, myEvents, recommendedResources } = data;
  const now = new Date();
  const upcomingEvents = myEvents?.filter((reg) => new Date(reg.event?.date) >= now) || [];
  const pastEvents = myEvents?.filter((reg) => new Date(reg.event?.date) < now) || [];
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="main-content">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            <LayoutDashboard size={16} /> Student Portal
          </div>
          <h1 style={{ fontSize: '2.25rem' }}>
            Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.3rem' }}>
            {user?.department} • Semester {user?.semester} • {user?.studentId}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <StatCard icon={<Calendar size={24} />} label="Total Registered Events" value={stats?.totalRegistered || 0} color="var(--primary)" />
          <StatCard icon={<Clock size={24} />} label="Upcoming Events" value={stats?.upcomingEvents || 0} color="var(--accent)" />
          <StatCard icon={<CheckCircle size={24} />} label="Attended Events" value={stats?.completedEvents || 0} color="var(--success)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* My Events Section */}
          <div>
            <div style={{
              background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden'
            }}>
              <div style={{
                padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'
              }}>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--primary)" /> My Event Registrations
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['upcoming', 'past'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600,
                      cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s',
                      background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                      borderColor: activeTab === tab ? 'var(--primary)' : 'var(--border-color)'
                    }}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'upcoming' ? upcomingEvents.length : pastEvents.length})
                    </button>
                  ))}
                </div>
              </div>

              {displayedEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  <Calendar size={40} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem' }} />
                  <p>
                    {activeTab === 'upcoming'
                      ? "No upcoming registrations. Explore and register for events!"
                      : "No completed events in your history yet."}
                  </p>
                  {activeTab === 'upcoming' && (
                    <Link to="/events" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Events</Link>
                  )}
                </div>
              ) : (
                <div>
                  {displayedEvents.map((reg) => {
                    const ev = reg.event;
                    if (!ev) return null;
                    const eventDate = new Date(ev.date);
                    const isUpcoming = eventDate >= now;

                    return (
                      <div key={reg.registrationId} style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{ev.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{ev.venue}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                            background: isUpcoming ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                            color: isUpcoming ? '#34d399' : 'var(--text-dim)',
                            border: `1px solid ${isUpcoming ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`
                          }}>
                            {isUpcoming ? '🟢 Upcoming' : '⏳ Completed'}
                          </span>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            background: {
                              Workshop: 'rgba(99,102,241,0.12)', Hackathon: 'rgba(236,72,153,0.12)',
                              'Placement Drive': 'rgba(16,185,129,0.12)', Seminar: 'rgba(245,158,11,0.12)', Cultural: 'rgba(168,85,247,0.12)'
                            }[ev.category] || 'rgba(99,102,241,0.12)',
                            color: {
                              Workshop: '#818cf8', Hackathon: '#f472b6',
                              'Placement Drive': '#34d399', Seminar: '#fbbf24', Cultural: '#c084fc'
                            }[ev.category] || '#818cf8'
                          }}>
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Resources Sidebar */}
          <div>
            <div style={{
              background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden'
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={19} color="var(--accent)" /> Recommended Resources
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  For Sem {user?.semester} • {user?.department}
                </p>
              </div>

              {(recommendedResources || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                  <BookOpen size={36} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.875rem' }}>No resources available yet for your semester.</p>
                  <Link to="/resources" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>Browse All Resources</Link>
                </div>
              ) : (
                <div>
                  {recommendedResources.slice(0, 6).map((res) => (
                    <div key={res._id} style={{
                      padding: '0.9rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', lineHeight: 1.35 }}>
                          {res.title.length > 50 ? res.title.substring(0, 48) + '…' : res.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                          {res.subject} • Sem {res.semester}
                        </div>
                      </div>
                      <a
                        href={`/api/resources/${res._id}/download`}
                        download
                        style={{
                          color: 'var(--accent)', display: 'flex', alignItems: 'center',
                          padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.25)',
                          background: 'rgba(6,182,212,0.08)', flexShrink: 0
                        }}
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <Link to="/resources" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      View All Resources
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
