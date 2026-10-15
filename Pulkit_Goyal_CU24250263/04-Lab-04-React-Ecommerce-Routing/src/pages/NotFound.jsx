import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '40px auto' }}>
      <h1 style={{ fontSize: '4rem', color: '#2563eb', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '8px 0 16px' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        The route you are looking for does not exist in this application.
      </p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
