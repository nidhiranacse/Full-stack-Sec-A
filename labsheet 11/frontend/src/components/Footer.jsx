import React from 'react';
import { GraduationCap, Heart, Code2, ShieldAlert } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(10, 15, 29, 0.9)',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <GraduationCap size={22} color="var(--primary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              CampusConnect
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Official student event discovery & academic resource sharing repository. Built for seamless campus engagement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Quick Portals</div>
            <div><a href="/events" style={{ color: 'var(--text-muted)' }}>Upcoming Events</a></div>
            <div><a href="/resources" style={{ color: 'var(--text-muted)' }}>Academic Notes & PYQs</a></div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Lab Sheet 11</div>
            <div>Full-Stack Engineering</div>
            <div>MongoDB • Express • React • Node</div>
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        <div>&copy; 2026 CampusConnect Portal. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Student Success
        </div>
      </div>
    </footer>
  );
};
