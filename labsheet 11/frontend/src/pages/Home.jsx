import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Users, Award, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import API from '../services/api';
import { EventCard } from '../components/EventCard';

export const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/events?limit=3');
        setFeaturedEvents(res.data.events || []);
      } catch (e) {
        console.error('Failed to fetch featured events:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="container" style={{ textAlign: 'center', padding: '3.5rem 0 4rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.75rem'
        }}>
          <Sparkles size={16} />
          Collegiate Event & Academic Resource Management Portal
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          lineHeight: 1.15,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Empowering Campus Life, <br />
          Events & Academic Excellence.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7
        }}>
          Discover top-tier tech workshops, 36-hour hackathons, and placement drives. Register with live seat counters, and download verified semester lecture notes and solved question papers in one place.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/events" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Calendar size={18} />
            Explore Campus Events
            <ArrowRight size={16} />
          </Link>
          <Link to="/resources" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <BookOpen size={18} />
            Browse Notes & Papers
          </Link>
        </div>
      </section>

      {/* Feature Strip */}
      <section style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '2.5rem 0'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              100%
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real-Time Seat Tracking</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.25rem' }}>
              8+ Sem
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Organized Academic Notes</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#34d399', marginBottom: '0.25rem' }}>
              JWT + RBAC
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role-Secured Student Access</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f472b6', marginBottom: '0.25rem' }}>
              Instant
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>One-Click PDF/DOCX Downloads</div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="container" style={{ padding: '4.5rem 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upcoming Opportunities
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Featured Campus Events</h2>
          </div>

          <Link to="/events" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            View All Events
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading upcoming events...
          </div>
        ) : (
          <div className="grid-cards">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem'
        }}>
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '1.25rem'
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Event Roster & Registrations</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Browse upcoming placement drives, coding competitions, and guest seminars. Real-time capacity prevents overbooking.
            </p>
          </div>

          <div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              marginBottom: '1.25rem'
            }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Centralized Resource Bank</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Access vetted university previous year papers, laboratory manuals, and lecture slides organized neatly by branch and semester.
            </p>
          </div>

          <div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              marginBottom: '1.25rem'
            }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Faculty & Admin Analytics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Faculty coordinators can track attendance rosters, publish announcements, upload course materials, and export student lists.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
