import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, LogOut, Radio, Calendar, CheckCheck, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected, unreadCount, announcements, markAllAsRead } = useSocket();
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  const toggleAnnouncements = () => {
    setShowAnnouncements((prev) => !prev);
    if (!showAnnouncements) {
      markAllAsRead();
    }
  };

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#fff',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar size={22} />
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#1e293b' }}>
            Campus<span style={{ color: '#4f46e5' }}>Connect</span>
          </span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              background: '#f1f5f9',
              color: '#64748b',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            Portal
          </span>
        </div>
      </div>

      {/* Center - Live Connection Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: isConnected ? '#16a34a' : '#d97706',
          background: isConnected ? '#f0fdf4' : '#fffbeb',
          padding: '4px 10px',
          borderRadius: '20px',
          border: `1px solid ${isConnected ? '#bbf7d0' : '#fde68a'}`,
        }}
        title={isConnected ? 'Socket.io connected (Real-time active)' : 'Socket.io connecting...'}
      >
        <Radio size={14} className={isConnected ? '' : 'pulse-badge'} />
        <span>{isConnected ? 'Live WebSocket Connected' : 'Reconnecting...'}</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notification Bell with Real-time Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleAnnouncements}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            title="Real-time Announcements"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  animation: 'pulseGlow 1.5s infinite',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Announcements Dropdown Panel */}
          {showAnnouncements && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '360px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                padding: '16px',
                zIndex: 100,
                maxHeight: '450px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '8px',
                }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  Announcements ({announcements.length})
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} /> Clear
                  </button>
                  <button
                    onClick={() => setShowAnnouncements(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {announcements.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '24px 0' }}>
                  No announcements yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {announcements.map((a, i) => (
                    <div
                      key={a._id || i}
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${
                          a.priority === 'URGENT'
                            ? '#ef4444'
                            : a.priority === 'HIGH'
                            ? '#f59e0b'
                            : '#4f46e5'
                        }`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{a.title}</strong>
                        <span
                          style={{
                            fontSize: '10px',
                            background: '#e2e8f0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: '#475569',
                            fontWeight: 600,
                          }}
                        >
                          {a.priority || 'NORMAL'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{a.content}</p>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                        Posted by {a.createdBy?.name || 'Admin'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info & Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{user?.name}</p>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: user?.role === 'ADMIN' ? '#fdf2f8' : '#eff6ff',
                color: user?.role === 'ADMIN' ? '#be185d' : '#1d4ed8',
                border: `1px solid ${user?.role === 'ADMIN' ? '#fbcfe8' : '#bfdbfe'}`,
              }}
            >
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="Log out"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
