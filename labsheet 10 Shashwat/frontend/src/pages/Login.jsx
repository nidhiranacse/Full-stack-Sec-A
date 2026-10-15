import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DEMO_ACCOUNTS = [
  { label: '🛡 Login as Admin',   email: 'admin@campus.edu',   password: 'admin123',   role: 'ADMIN'   },
  { label: '🎒 Login as Student', email: 'student@campus.edu', password: 'student123', role: 'STUDENT' },
];

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function doLogin(credentials) {
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doLogin(form);
  }

  function handleDemoLogin(account) {
    setForm({ email: account.email, password: account.password });
    doLogin({ email: account.email, password: account.password });
  }

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div className="auth-logo">
          <h1>🎓 CampusConnect</h1>
          <p className="tagline">Real-time College Event Portal</p>
        </div>

        {/* ── Demo Quick-Login ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            ⚡ Quick Demo Access
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                id={`demo-${acc.role.toLowerCase()}`}
                className="btn btn-secondary"
                onClick={() => handleDemoLogin(acc)}
                disabled={loading}
                style={{ justifyContent: 'center', fontSize: 13, padding: '10px 8px', borderColor: 'var(--border-accent)' }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <hr className="divider" style={{ flex: 1, margin: 0 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>or sign in manually</span>
          <hr className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="you@campus.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="login-submit"
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '13px' }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-footer">
          New here?{' '}
          <Link to="/register" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
