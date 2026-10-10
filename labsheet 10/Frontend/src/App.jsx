import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

function Navbar({ badgeCount, resetBadge }) {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <h2>🎓 CampusConnect</h2>
      {user && (
        <div className="nav-links">
          <span>{user.name} ({user.role})</span>
          <Link to="/" onClick={resetBadge}>
            Announcements {badgeCount > 0 && <span className="badge">{badgeCount}</span>}
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, role } 
      : { email, password };

    try {
      const res = await axios.post(endpoint, payload);
      login(res.data.user, res.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-box">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
        <button 
          type="button" 
          onClick={() => { setIsRegister(false); setError(''); }}
          style={{ background: !isRegister ? '#3b82f6' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          Sign In
        </button>
        <button 
          type="button" 
          onClick={() => { setIsRegister(true); setError(''); }}
          style={{ background: isRegister ? '#3b82f6' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          Register New Account
        </button>
      </div>

      <h3>{isRegister ? 'Create Account' : 'Sign In'}</h3>
      {error && <p className="err" style={{ marginTop: '0.5rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        {isRegister && (
          <>
            <input 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', margin: '8px 0', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }}
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin / Faculty</option>
            </select>
          </>
        )}
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password (min 6 characters)" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
          {isRegister ? 'Register & Enter' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

function Login() {
  return <AuthForm />;
}

function Dashboard() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchEvents = async () => {
    const res = await axios.get(`/api/events?search=${search}`);
    setEvents(res.data.events);
  };

  useEffect(() => { fetchEvents(); }, [search]);

  const handleRSVP = async (id) => {
    await axios.post(`/api/events/${id}/rsvp`);
    fetchEvents();
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    await axios.post('/api/announcements', { title: newTitle, content: newContent });
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="dashboard">
      {user.role === 'ADMIN' && (
        <div className="card">
          <h4>Broadcast Announcement (Admin)</h4>
          <form onSubmit={handlePostAnnouncement}>
            <input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            <textarea placeholder="Message..." value={newContent} onChange={e => setNewContent(e.target.value)} required />
            <button type="submit">Send Notification</button>
          </form>
        </div>
      )}

      <div className="card">
        <h4>College Events</h4>
        <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="events-grid">
          {events.map(ev => (
            <div key={ev._id} className="event-item">
              <h5>{ev.title}</h5>
              <p>{ev.description}</p>
              <small>Location: {ev.location}</small><br/>
              <button onClick={() => handleRSVP(ev._id)}>
                RSVP ({ev.rsvps?.length || 0})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [badgeCount, setBadgeCount] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent badgeCount={badgeCount} setBadgeCount={setBadgeCount} />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent({ badgeCount, setBadgeCount }) {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:5000', { auth: { token } });
    socket.on('new-announcement', (data) => {
      setBadgeCount(prev => prev + 1);
      alert(`🔔 New Announcement: ${data.title}`);
    });
    return () => socket.disconnect();
  }, [token]);

  return (
    <>
      <Navbar badgeCount={badgeCount} resetBadge={() => setBadgeCount(0)} />
      <div className="container">
        <Routes>
          <Route path="/login" element={!user ? <AuthForm /> : <Navigate to="/" />} /> 
        </Routes>
      </div>
    </>
  );
}
