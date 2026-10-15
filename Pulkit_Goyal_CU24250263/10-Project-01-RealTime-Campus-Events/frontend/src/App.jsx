import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

/**
 * Project 1 Client Application
 * Author: Pulkit Goyal (CUID: CU24250263 | Roll 40 | Section A)
 */
export default function App() {
  const [user, setUser] = useState({
    name: 'Pulkit Goyal',
    email: 'pulkitgoyal0103@gmail.com',
    role: 'admin',
    cuid: 'CU24250263'
  });

  const [events, setEvents] = useState([
    {
      id: 'e1',
      title: 'Annual Full Stack Hackathon 2026',
      description: '48-hour MERN stack coding competition with live mentoring.',
      venue: 'Campus Tech Auditorium',
      date: '2026-11-15',
      capacity: 120,
      attendees: 84
    },
    {
      id: 'e2',
      title: 'Workshop: High-Performance Redis Caching',
      description: 'Hands-on session exploring Cache-Aside patterns and memory optimization.',
      venue: 'Lab Block CSE-3',
      date: '2026-11-20',
      capacity: 60,
      attendees: 58
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 'a1',
      title: 'Exam Schedule & Viva Timings Published',
      content: 'All B.Tech CSE Section A students must report to Lab 3 at 9:00 AM.',
      priority: 'Emergency',
      timestamp: '10:45 AM'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [priority, setPriority] = useState('High');
  const [wsConnected, setWsConnected] = useState(true);

  // Simulated WebSocket connection
  useEffect(() => {
    try {
      const socket = io('http://localhost:5000', { autoConnect: false });
      socket.connect();
      socket.on('connect', () => setWsConnected(true));
      socket.on('disconnect', () => setWsConnected(false));
      socket.on('new_announcement', (item) => {
        setAnnouncements((prev) => [item, ...prev]);
      });
      return () => socket.disconnect();
    } catch {
      // Offline fallback
    }
  }, []);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      priority,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAnnouncements((prev) => [newItem, ...prev]);
    setNewTitle('');
    setNewContent('');
  };

  const handleRSVP = (eventId) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, attendees: ev.attendees + (ev.isJoined ? -1 : 1), isJoined: !ev.isJoined }
          : ev
      )
    );
  };

  return (
    <div className="app-container">
      <header className="header-bar">
        <div className="brand-title">
          <span>⚡ Real-Time Campus Portal</span>
          <span style={{ fontSize: '0.75rem', background: wsConnected ? '#10b981' : '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
            {wsConnected ? 'WebSocket Online' : 'Simulation Mode'}
          </span>
        </div>
        <div className="student-badge">
          Pulkit Goyal &bull; CU24250263 &bull; Roll 40 (Sec A)
        </div>
      </header>

      <main className="main-content">
        {/* Real-time Announcements Feed */}
        <section className="card">
          <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem' }}>📢 Live Broadcast Announcements</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((a) => (
              <div key={a.id} className="alert-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1rem' }}>{a.title}</strong>
                  <span className={`badge-priority badge-${a.priority.toLowerCase()}`}>{a.priority}</span>
                </div>
                <p style={{ margin: 0, color: '#475569' }}>{a.content}</p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  Posted at {a.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Admin Publish Box */}
          {user.role === 'admin' && (
            <form onSubmit={handlePublish} style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>Broadcast New Announcement (Admin Control)</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Headline..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: 2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Emergency">Emergency Alert</option>
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="Announcement message details..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px' }}
                required
              />
              <button type="submit" className="btn btn-primary">
                Broadcast via WebSocket &rarr;
              </button>
            </form>
          )}
        </section>

        {/* Campus Events Section */}
        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>📅 Upcoming Campus Events</h2>
          <div className="event-grid">
            {events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>{ev.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' }}>{ev.description}</p>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                    📍 <strong>Venue:</strong> {ev.venue}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '12px' }}>
                    🗓️ <strong>Date:</strong> {ev.date}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                    👥 {ev.attendees} / {ev.capacity} Attendees Registered
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => handleRSVP(ev.id)}
                    className={`btn ${ev.isJoined ? 'btn-danger' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                  >
                    {ev.isJoined ? 'Cancel My RSVP' : 'Register / RSVP Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
