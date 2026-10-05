import React, { useState, useEffect } from 'react';
import { X, Users, Mail, GraduationCap, Calendar, Download, Search } from 'lucide-react';
import API from '../services/api';

export const AttendeesModal = ({ isOpen, onClose, event }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !event) return;

    const fetchAttendees = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/events/${event._id}/attendees`);
        setAttendees(res.data.attendees || []);
      } catch (err) {
        setError(err.message || 'Failed to load attendees list.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const filteredAttendees = attendees.filter((a) => {
    const student = a.student || {};
    const term = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(term)) ||
      (student.email && student.email.toLowerCase().includes(term)) ||
      (student.studentId && student.studentId.toLowerCase().includes(term)) ||
      (student.department && student.department.toLowerCase().includes(term))
    );
  });

  const exportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Name', 'Student ID', 'Email', 'Department', 'Semester', 'Registration Date'];
    const rows = attendees.map((a) => [
      `"${a.student?.name || 'N/A'}"`,
      `"${a.student?.studentId || 'N/A'}"`,
      `"${a.student?.email || 'N/A'}"`,
      `"${a.student?.department || 'N/A'}"`,
      `"${a.student?.semester || 'N/A'}"`,
      `"${new Date(a.registeredAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Users size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.3rem' }}>Registered Students Roster</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {event.title} • {event.venue}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats & Search Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span>
              Registered:{' '}
              <strong style={{ color: 'var(--primary)' }}>
                {attendees.length} / {event.maxSeats}
              </strong>
            </span>
            <span>
              Remaining:{' '}
              <strong style={{ color: '#10b981' }}>
                {Math.max(0, event.maxSeats - attendees.length)} seats
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ padding: '0.45rem 0.75rem 0.45rem 2rem', fontSize: '0.85rem', width: '180px' }}
              />
            </div>

            <button
              onClick={exportCSV}
              disabled={attendees.length === 0}
              className="btn btn-secondary btn-sm"
              title="Export Roster to CSV"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        {/* Attendees Table / List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading attendee roster...
          </div>
        ) : error ? (
          <div style={{ color: '#f87171', padding: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-dim)' }}>
            No registered students found for this event.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem' }}>#</th>
                  <th style={{ padding: '0.75rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem' }}>Roll / Student ID</th>
                  <th style={{ padding: '0.75rem' }}>Department</th>
                  <th style={{ padding: '0.75rem' }}>Reg. Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((a, idx) => (
                  <tr
                    key={a.registrationId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '0.75rem', color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{a.student?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{a.student?.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {a.student?.studentId || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {a.student?.department} (Sem {a.student?.semester})
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {new Date(a.registeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
