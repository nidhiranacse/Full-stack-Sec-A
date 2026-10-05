import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, PlusCircle } from 'lucide-react';
import API from '../services/api';

export const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '10:00 AM - 01:00 PM',
    venue: '',
    maxSeats: 60,
    organizer: 'Department of Computer Science',
    speaker: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/events', formData);
      onEventCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={22} color="var(--primary)" />
            Create Campus Event
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              required
              className="form-control"
              placeholder="e.g. Next.js & GraphQL Masterclass"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Placement Drive">Placement Drive</option>
                <option value="Seminar">Seminar</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Seat Capacity *</label>
              <input
                type="number"
                name="maxSeats"
                min="1"
                required
                className="form-control"
                value={formData.maxSeats}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                required
                className="form-control"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <input
                type="text"
                name="time"
                required
                className="form-control"
                placeholder="10:00 AM - 01:00 PM"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue / Hall *</label>
            <input
              type="text"
              name="venue"
              required
              className="form-control"
              placeholder="e.g. Seminar Hall 3, Tech Block"
              value={formData.venue}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Description *</label>
            <textarea
              name="description"
              required
              rows="3"
              className="form-control"
              placeholder="Detailed schedule, prerequisites, and learning outcomes..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Host / Organizer</label>
              <input
                type="text"
                name="organizer"
                className="form-control"
                value={formData.organizer}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Speaker / Guest</label>
              <input
                type="text"
                name="speaker"
                className="form-control"
                placeholder="Speaker Name & Designation"
                value={formData.speaker}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
