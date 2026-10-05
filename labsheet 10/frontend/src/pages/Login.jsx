import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../store/authSlice';
import { Sparkles, Shield, User, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    if (error) dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const res = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(res)) {
        navigate('/dashboard');
      }
    } else {
      const res = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (loginUser.fulfilled.match(res)) {
        navigate('/dashboard');
      }
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'ADMIN') {
      setFormData({
        name: 'Dean Admin',
        email: 'admin@campusconnect.edu',
        password: 'AdminPassword123!',
        role: 'ADMIN'
      });
    } else {
      setFormData({
        name: 'Alex Student',
        email: 'student@campusconnect.edu',
        password: 'StudentPassword123!',
        role: 'STUDENT'
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 460,
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            padding: 12,
            borderRadius: 16,
            marginBottom: 16,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f3f4f6', marginBottom: 6 }}>
            {isRegister ? 'Join CampusConnect' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            {isRegister
              ? 'Create your college portal account'
              : 'Enter your credentials to access campus events & updates'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#fda4af',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@campusconnect.edu"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: 38, width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: 38, width: '100%' }}
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="role">Account Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="STUDENT">Student (View & RSVP, Live Notifications)</option>
                <option value="ADMIN">Admin (Manage Events & Broadcast Announcements)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: 8, padding: 12 }}
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              dispatch(clearError());
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Demo Credentials Helper */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 10 }}>
            Quick fill for demo & testing:
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setDemoCredentials('STUDENT')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Fill Student
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('ADMIN')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Fill Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
