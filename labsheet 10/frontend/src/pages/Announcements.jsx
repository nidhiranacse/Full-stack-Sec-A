import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnnouncements, publishAnnouncement, markAllRead } from '../store/announcementSlice';
import { Bell, Radio, Send, AlertTriangle, Info, AlertCircle, Shield, CheckCircle } from 'lucide-react';

const Announcements = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: announcements, loading, unreadCount } = useSelector((state) => state.announcements);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM'
  });
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    dispatch(fetchAnnouncements());
    // Clear unread counter when visiting announcements page
    dispatch(markAllRead());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setSuccessMessage('');
    try {
      await dispatch(publishAnnouncement(formData)).unwrap();
      setSuccessMessage('Announcement broadcasted to all connected students via WebSockets!');
      setFormData({ title: '', message: '', priority: 'MEDIUM' });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle size={16} color="#f43f5e" />;
      case 'LOW':
        return <Info size={16} color="#9ca3af" />;
      default:
        return <AlertCircle size={16} color="#f59e0b" />;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6' }}>Campus Broadcasts</h1>
          <span style={{
            fontSize: '0.8rem',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '4px 10px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Radio size={14} /> Live Socket.io Channel
          </span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: 4 }}>
          Urgent college notices, schedules, exam updates, and administrative announcements.
        </p>
      </div>

      {/* Admin Broadcast Publisher (Task 2) */}
      {isAdmin && (
        <div className="glass-panel" style={{
          padding: 24,
          marginBottom: 32,
          border: '1px solid rgba(99, 102, 241, 0.35)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: 8, borderRadius: 8, color: '#818cf8' }}>
              <Shield size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>Post Instant Announcement</h2>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                Broadcasts instantly to all connected student sockets with a live toast & badge counter
              </span>
            </div>
          </div>

          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="broadcast-title">Announcement Headline</label>
                <input
                  id="broadcast-title"
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination Schedule Released"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="broadcast-priority">Priority Level</label>
                <select
                  id="broadcast-priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH (Urgent Alert)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="broadcast-message">Announcement Details</label>
              <textarea
                id="broadcast-message"
                rows={3}
                required
                placeholder="Enter notice content for students..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              <Send size={15} />
              <span>{publishing ? 'Broadcasting...' : 'Broadcast to Students'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Announcements Feed */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: '#f3f4f6', marginBottom: 16 }}>Live Notice Feed</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#818cf8', padding: '32px 0' }}>Loading notices...</p>
        ) : announcements.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={40} color="#4b5563" style={{ marginBottom: 12 }} />
            <h4 style={{ color: '#f3f4f6', marginBottom: 6 }}>No Broadcasts Yet</h4>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
              Whenever an administrator issues a new notice, it will display here and trigger a live popup.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="glass-panel"
                style={{
                  padding: 20,
                  borderLeft: `4px solid ${
                    ann.priority === 'HIGH' ? '#f43f5e' : ann.priority === 'LOW' ? '#6b7280' : '#f59e0b'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getPriorityIcon(ann.priority)}
                    <h4 style={{ fontSize: '1.1rem', color: '#f3f4f6', fontWeight: 700 }}>
                      {ann.title}
                    </h4>
                  </div>
                  <span className={`badge badge-priority-${ann.priority?.toLowerCase() || 'medium'}`}>
                    {ann.priority}
                  </span>
                </div>

                <p style={{ color: '#d1d5db', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 12 }}>
                  {ann.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span>
                    Posted by <strong>{ann.createdBy?.name || 'College Admin'}</strong> ({ann.createdBy?.role || 'ADMIN'})
                  </span>
                  <span>
                    {new Date(ann.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
