import React, { useState } from 'react';

/**
 * LoginForm Component
 * Demonstrates touch detection (show errors only after field is blurred) and password toggle.
 */
export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: 'pulkitgoyal0103@gmail.com',
    password: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    email:
      !credentials.email.trim()
        ? 'Email is required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)
        ? 'Please enter a valid email address'
        : null,
    password:
      !credentials.password
        ? 'Password is required'
        : credentials.password.length < 6
        ? 'Password must be at least 6 characters'
        : null
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!errors.email && !errors.password) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Student Portal Authentication</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
        Log in to access your Full Stack lab evaluations and project submissions.
      </p>

      {submitted && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
          ✓ Authentication successful for Pulkit Goyal (CU24250263)!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Registered Email *</label>
          <input
            type="email"
            id="login-email"
            name="email"
            className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
            value={credentials.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            placeholder="student@example.com"
          />
          {touched.email && errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              name="password"
              className={`form-input ${touched.password && errors.password ? 'error' : ''}`}
              value={credentials.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '0.85rem'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {touched.password && errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
