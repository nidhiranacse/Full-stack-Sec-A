import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X } from 'lucide-react';

const NotificationToast = () => {
  const { activeToast, dismissToast } = useSocket();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 7000); // Auto-dismiss after 7 seconds
      return () => clearTimeout(timer);
    }
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '420px',
        background: '#ffffff',
        border: '1px solid #c7d2fe',
        borderLeft: '5px solid #4f46e5',
        borderRadius: '10px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: '#eef2ff',
              color: '#4f46e5',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bell size={18} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
            Live Announcement
          </span>
        </div>
        <button
          onClick={dismissToast}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
          }}
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
          {activeToast.title}
        </h4>
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
          {activeToast.content}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <span
          style={{
            fontSize: '11px',
            background: '#f1f5f9',
            color: '#64748b',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 500,
          }}
        >
          {activeToast.category || 'General'}
        </span>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Just now</span>
      </div>
    </div>
  );
};

export default NotificationToast;
