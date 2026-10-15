import React, { useState } from 'react';
import ValidationBadge from './ValidationBadge.jsx';
import PasswordStrengthMeter from './PasswordStrengthMeter.jsx';

/**
 * LoginForm Component
 * Primary Syllabus Reference & Task 5.1:
 * Functional, responsive Login Form with controlled component inputs,
 * dynamic regex criteria verification, and interactive error warning badges.
 */
export default function LoginForm() {
  // Controlled component states
  const [formData, setFormData] = useState({
    identifier: '', // email or username
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loginStatus, setLoginStatus] = useState(null); // null | 'success' | 'submitting'

  // Dynamic Regex Patterns & Security Filters
  const REGEX = {
    // RFC 5322 compliant email regex pattern
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // Alphanumeric username pattern (3-24 characters, letters, digits, underscores)
    username: /^[a-zA-Z0-9_]{3,24}$/,
    // Malicious injection patterns (SQLi / XSS heuristics)
    unsafePatterns: /(--|;|\/\*|\*\/|<script|javascript:|SELECT\s|DROP\s|INSERT\s|UPDATE\s)/i,
  };

  /**
   * Dynamic validator running regex checks on input parameters
   */
  const validateField = (name, value) => {
    let error = '';

    // Security Pattern Check: Disallow SQL injection or script injection signatures
    if (REGEX.unsafePatterns.test(value)) {
      return 'Security Alert: Input violates safe parameter rules. Suspicious symbols or SQL/Script signatures detected.';
    }

    if (name === 'identifier') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Email or Username parameter is required.';
      } else if (trimmed.includes('@')) {
        // Test against strict Email regex pattern
        if (!REGEX.email.test(trimmed)) {
          error = 'Invalid email syntax format. Expected pattern: name@domain.tld';
        }
      } else {
        // Test against Username alphanumeric regex pattern
        if (!REGEX.username.test(trimmed)) {
          error = 'Username must be 3-24 alphanumeric characters or underscores only.';
        }
      }
    }

    if (name === 'password') {
      if (!value) {
        error = 'Security credential password parameter is required.';
      } else if (value.length < 8) {
        error = 'Password parameter violates minimum length policy (at least 8 characters required).';
      }
    }

    return error;
  };

  // Controlled input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    if (type !== 'checkbox') {
      const fieldError = validateField(name, val);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Submission Routine
  const handleSubmit = (e) => {
    e.preventDefault();

    const identifierErr = validateField('identifier', formData.identifier);
    const passwordErr = validateField('password', formData.password);

    const newErrors = {
      identifier: identifierErr,
      password: passwordErr,
    };

    setErrors(newErrors);
    setTouched({ identifier: true, password: true });

    if (!identifierErr && !passwordErr) {
      setLoginStatus('submitting');
      setTimeout(() => {
        setLoginStatus('success');
      }, 700);
    }
  };

  return (
    <div className="login-module-card">
      <div className="module-header">
        <div className="header-badge">Task 5.1 &bull; Regex Security Controller</div>
        <h2 className="module-title">Secure Portal Authentication</h2>
        <p className="module-desc">
          Controlled component inputs with dynamic regular expression criteria verification and interactive error warning badges.
        </p>
      </div>

      {loginStatus === 'success' ? (
        <div className="login-success-view" role="status">
          <div className="success-icon-badge">✓</div>
          <h3>Authentication Parameters Verified!</h3>
          <p>
            Welcome, <strong>{formData.identifier}</strong>. All regex security criteria and credentials strictly validated.
          </p>
          <button
            type="button"
            className="btn-login-reset"
            onClick={() => {
              setFormData({ identifier: '', password: '', rememberMe: false });
              setErrors({});
              setTouched({});
              setLoginStatus(null);
            }}
          >
            Authenticate Another User &rarr;
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-controlled-form" noValidate>
          {/* Field 1: Email or Username Identifier */}
          <div className="form-group-item">
            <label htmlFor="identifier-input" className="field-label">
              User Identifier (Email or Username):
            </label>
            <div className="input-field-wrap">
              <input
                id="identifier-input"
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. rahul.raj@domain.edu or rahul_raj"
                className={`controlled-text-input ${
                  touched.identifier && errors.identifier ? 'field-violated' : ''
                }`}
                aria-invalid={!!errors.identifier}
                autoComplete="username"
              />
              <span className="input-regex-hint">Pattern: [Email RFC 5322] | [User /^[a-zA-Z0-9_]{3,24}$/]</span>
            </div>

            {/* Interactive Error Warning Badge (Task 5.1) */}
            {touched.identifier && errors.identifier && (
              <ValidationBadge
                type={errors.identifier.includes('Security Alert') ? 'error' : 'warning'}
                fieldName="Validation Parameter"
                message={errors.identifier}
              />
            )}
          </div>

          {/* Field 2: Password */}
          <div className="form-group-item">
            <label htmlFor="password-input" className="field-label">
              Account Security Password:
            </label>
            <div className="input-field-wrap">
              <input
                id="password-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter password (minimum 8 chars with mixed criteria)"
                className={`controlled-text-input ${
                  touched.password && errors.password ? 'field-violated' : ''
                }`}
                aria-invalid={!!errors.password}
                autoComplete="current-password"
              />
            </div>

            {/* Interactive Error Warning Badge (Task 5.1) */}
            {touched.password && errors.password && (
              <ValidationBadge
                type="warning"
                fieldName="Security Policy"
                message={errors.password}
              />
            )}

            {/* Task 5.2: Password Strength Checker Sub-Component */}
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Checkbox: Remember Me */}
          <div className="checkbox-row-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="controlled-checkbox"
              />
              <span>Remember secure session on this device</span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-submit-login"
            disabled={loginStatus === 'submitting'}
          >
            {loginStatus === 'submitting' ? 'Verifying Security Parameters...' : 'Verify & Authorize Login →'}
          </button>
        </form>
      )}
    </div>
  );
}
