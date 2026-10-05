import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { disconnectSocket } from '../socket/socketClient';
import { Calendar, Bell, LayoutDashboard, LogOut, Sparkles, Shield, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const unreadCount = useSelector((state) => state.announcements.unreadCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    disconnectSocket();
    await dispatch(logoutUser());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Brand */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#fff'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            padding: 8,
            borderRadius: 10,
            display: 'flex',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Campus<span style={{ color: '#818cf8' }}>Connect</span>
            </span>
            <span style={{ fontSize: '0.68rem', display: 'block', color: '#9ca3af', marginTop: -3 }}>
              College Portal v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/dashboard') ? '#818cf8' : '#9ca3af',
              background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/events"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/events') ? '#818cf8' : '#9ca3af',
              background: isActive('/events') ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Calendar size={17} />
            <span>Events</span>
          </Link>

          <Link
            to="/announcements"
            id="nav-announcements-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              position: 'relative',
              color: isActive('/announcements') ? '#818cf8' : '#9ca3af',
              background: isActive('/announcements') ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={17} />
            <span>Announcements</span>
            {unreadCount > 0 && (
              <span
                id="unread-badge-counter"
                style={{
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 999,
                  minWidth: 18,
                  textAlign: 'center',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f3f4f6' }}>
                {user?.name || 'User'}
              </div>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-student'}`}>
                {user?.role === 'ADMIN' ? <Shield size={10} style={{ marginRight: 4 }} /> : <UserIcon size={10} style={{ marginRight: 4 }} />}
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
