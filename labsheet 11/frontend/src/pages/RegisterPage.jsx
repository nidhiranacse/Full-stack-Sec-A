import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Hash, Building2, Layers, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: 'Computer Science & Engineering',
    semester: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter both fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const user = await register(submitData);
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)'
          }}>
            <GraduationCap size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join CampusConnect to unlock events & resources
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
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="text" name="name" required id="reg-name"
                  className="form-control" style={{ paddingLeft: '2.5rem' }}
                  placeholder="Vanshika Chauhan"
                  value={formData.name} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">College Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="email" name="email" required id="reg-email"
                  className="form-control" style={{ paddingLeft: '2.5rem' }}
                  placeholder="yourname@campusconnect.edu"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            {/* Passwords in grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="password" name="password" required id="reg-password"
                    className="form-control" style={{ paddingLeft: '2.5rem' }}
                    placeholder="Min 6 chars"
                    value={formData.password} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="password" name="confirmPassword" required id="reg-confirm-password"
                    className="form-control" style={{ paddingLeft: '2.5rem' }}
                    placeholder="Re-enter"
                    value={formData.confirmPassword} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Role selection */}
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['student', 'admin'].map((r) => (
                  <label key={r} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    background: formData.role === r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${formData.role === r ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)', transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio" name="role" value={r}
                      checked={formData.role === r}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {r === 'admin' ? '🛡️ Admin' : '👩‍🎓 Student'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Student Roll No.</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input type="text" name="studentId"
                      className="form-control" style={{ paddingLeft: '2.5rem' }}
                      placeholder="CU240250953"
                      value={formData.studentId} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <div style={{ position: 'relative' }}>
                    <Layers size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <select name="semester" className="form-control" style={{ paddingLeft: '2.5rem' }}
                      value={formData.semester} onChange={handleChange}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={17} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="text" name="department"
                  className="form-control" style={{ paddingLeft: '2.5rem' }}
                  placeholder="Computer Science & Engineering"
                  value={formData.department} onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
