import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setFormData({ email: 'admin@campusconnect.edu', password: 'Admin@123' });
    } else {
      setFormData({ email: 'student@campusconnect.edu', password: 'Student@123' });
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
          }}>
            <GraduationCap size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access CampusConnect Portal
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem', fontSize: '0.875rem'
            }}>
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email" name="email" required id="login-email"
                  className="form-control" style={{ paddingLeft: '2.5rem' }}
                  placeholder="your@email.edu"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password" name="password" required id="login-password"
                  className="form-control" style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              <LogIn size={18} />
              {loading ? 'Signing In...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div style={{ marginTop: '1.75rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Quick Demo Access
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => fillDemo('student')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
                👩‍🎓 Student Demo
              </button>
              <button onClick={() => fillDemo('admin')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
                🛡️ Admin Demo
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New to CampusConnect?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create your account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
