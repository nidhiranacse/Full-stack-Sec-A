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
    <div style={{ padding: '30px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ color: '#007bff' }}>CampusConnect Portal</h1>
        <button onClick={() => dispatch(logout())} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </header>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#555' }}>Welcome, {user?.name} <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '14px' }}>{user?.role}</span></h3>
      </div>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>📢 Live Announcements <span style={{ background: '#ff4757', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{unreadCount} new</span></h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {announcements.map((a, i) => (
            <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #ddd' }}>
              <strong style={{ color: '#333' }}>{a.title}</strong>: <span style={{ color: '#666' }}>{a.message}</span>
            </li>
          ))}
          {announcements.length === 0 && <li style={{ color: '#999' }}>No announcements yet</li>}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ borderLeft: '4px solid #007bff', paddingLeft: '10px' }}>Events Directory</h3>
        <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px', margin: '15px 0', borderRadius: '8px', border: '1px solid #ddd' }} />
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {events?.map((ev) => (
          <div key={ev._id} style={{ padding: '20px', background: '#fff', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontSize: '18px', color: '#333' }}>{ev.title}</strong>
              <span style={{ color: '#007bff', fontSize: '14px' }}>{new Date(ev.date).toLocaleDateString()}</span>
            </div>
            <p style={{ color: '#666', margin: '0 0 15px 0' }}>{ev.description}</p>
            {user?.role === 'STUDENT' && (
              <button onClick={() => handleRSVP(ev._id)} style={{ padding: '8px 16px', background: ev.rsvps.includes(user.id) ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {ev.rsvps.includes(user.id) ? 'RSVPed ✓' : 'RSVP'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
