import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EventCard = ({
  event,
  onRegister,
  onUnregister,
  onViewAttendees,
  onDelete,
  loadingAction
}) => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryBadgeClass = {
    Workshop: 'badge-workshop',
    Hackathon: 'badge-hackathon',
    'Placement Drive': 'badge-placement',
    Seminar: 'badge-seminar',
    Cultural: 'badge-cultural'
  }[event.category] || 'badge-workshop';

  const seatsAvailable = Math.max(0, event.maxSeats - (event.registeredCount || 0));
  const fillPercentage = Math.min(100, Math.round(((event.registeredCount || 0) / event.maxSeats) * 100));
  const isFull = seatsAvailable === 0;

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative'
      }}
    >
      {/* Top Meta: Category & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className={`badge ${categoryBadgeClass}`}>
          {event.category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', color: '#fff', lineHeight: 1.35 }}>
        {event.title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '1.25rem',
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {event.description}
      </p>

      {/* Event Details: Time & Venue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={15} color="var(--text-dim)" />
          <span>{event.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={15} color="var(--text-dim)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue}</span>
        </div>
      </div>

      {/* Seat Availability Tracker */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isFull ? '#ef4444' : 'var(--text-muted)' }}>
            <Users size={14} />
            {isFull ? 'Seats Full' : `${seatsAvailable} seats available`}
          </span>
          <span style={{ color: fillPercentage >= 90 ? '#f59e0b' : 'var(--text-muted)' }}>
            {event.registeredCount || 0} / {event.maxSeats} ({fillPercentage}%)
          </span>
        </div>

        <div className="seat-bar-container">
          <div
            className="seat-bar-fill"
            style={{
              width: `${fillPercentage}%`,
              background: isFull
                ? '#ef4444'
                : fillPercentage > 75
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #10b981, #6366f1)'
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
        {isAdmin ? (
          <>
            <button
              onClick={() => onViewAttendees(event)}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, gap: '0.35rem' }}
            >
              <Eye size={15} />
              Attendees ({event.registeredCount || 0})
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="btn btn-danger btn-sm"
              title="Delete Event"
              disabled={loadingAction === event._id}
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : isStudent ? (
          event.isRegistered ? (
            <button
              onClick={() => onUnregister(event._id)}
              disabled={loadingAction === event._id}
              className="btn btn-danger btn-sm"
              style={{ width: '100%', gap: '0.4rem' }}
            >
              <AlertCircle size={15} />
              {loadingAction === event._id ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          ) : (
            <button
              onClick={() => onRegister(event._id)}
              disabled={isFull || loadingAction === event._id}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', gap: '0.4rem' }}
            >
              <CheckCircle size={15} />
              {isFull ? 'Sold Out' : loadingAction === event._id ? 'Registering...' : 'Register For Event'}
            </button>
          )
        ) : (
          <a
            href="/login"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', textAlign: 'center' }}
          >
            Sign In to Register
          </a>
        )}
      </div>
    </div>
  );
};
