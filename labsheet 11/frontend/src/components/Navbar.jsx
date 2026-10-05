import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  User
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 15, 29, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Campus<span style={{ color: 'var(--primary)' }}>Connect</span>
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Portal • 2026
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <NavLink
            to="/events"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.2s'
            })}
          >
            <Calendar size={17} />
            Events
          </NavLink>

          <NavLink
            to="/resources"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.2s'
            })}
          >
            <BookOpen size={17} />
            Resources
          </NavLink>

          {isAuthenticated && isStudent && (
            <NavLink
              to="/dashboard/student"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.925rem',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.2s'
              })}
            >
              <LayoutDashboard size={17} />
              My Events
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink
              to="/dashboard/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive ? '#a855f7' : 'var(--text-muted)',
                transition: 'color 0.2s'
              })}
            >
              <ShieldCheck size={17} />
              Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Right Action buttons / User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user?.name?.charAt(0) || <User size={14} />}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: isAdmin ? '#c084fc' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    {user?.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.45rem', borderRadius: '50%' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-only"
            style={{ display: 'none', padding: '0.45rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <Calendar size={18} /> Browse Events
          </Link>
          <Link to="/resources" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <BookOpen size={18} /> Academic Resources
          </Link>
          {isAuthenticated && isStudent && (
            <Link to="/dashboard/student" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)' }}>
              <LayoutDashboard size={18} /> Student Dashboard
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#a855f7' }}>
              <ShieldCheck size={18} /> Admin Management
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
