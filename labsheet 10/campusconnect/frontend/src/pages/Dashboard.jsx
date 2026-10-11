import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';
import { logout } from '../store/authSlice';

export const Dashboard = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');

  // WebSocket Live Connection
  useEffect(() => {
    if (!accessToken) return;

    const socket = io('http://localhost:5000', {
      auth: { token: accessToken },
      reconnectionAttempts: 5
    });

    socket.on('new-announcement', (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [accessToken]);

  // Load Cached Events
  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get(`/events?search=${search}`);
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, [search]);

  const handleRSVP = async (id) => {
    await axiosInstance.post(`/events/${id}/rsvp`);
    fetchEvents();
  };

  return (
    <div style={{ padding: 30 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>CampusConnect Portal</h1>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </header>

      <h3>Welcome, {user?.name} ({user?.role})</h3>

      <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 5, marginBottom: 20 }}>
        <h4>📢 Live Announcements <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: '50%' }}>{unreadCount}</span></h4>
        <ul>
          {announcements.map((a, i) => (
            <li key={i}><strong>{a.title}:</strong> {a.message}</li>
          ))}
        </ul>
      </div>

      <hr />

      <h3>Events Directory</h3>
      <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 15, padding: 5 }} />

      <ul>
        {events?.map((ev) => (
          <li key={ev._id} style={{ marginBottom: 10 }}>
            <strong>{ev.title}</strong> - {new Date(ev.date).toLocaleDateString()}
            <p>{ev.description}</p>
            {user?.role === 'STUDENT' && (
              <button onClick={() => handleRSVP(ev._id)}>
                {ev.rsvps.includes(user.id) ? 'RSVPed ✔' : 'RSVP'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
