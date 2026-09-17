import React, { useState } from 'react';
import PasswordStrengthChecker from './PasswordStrengthChecker';

/* ==========================================================
   Task 5.1: Login Form with Controlled Inputs & Dynamic Regex
   Task 5.2: Integrated Password Strength Visual Tracker
   ========================================================== */

function LoginForm() {
  // Controlled form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Email regex verification pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle controlled input changes & dynamic verification
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: val,
    });

    // Dynamic regex criteria verification on change
    validateField(name, val);
  };

  // Validate specific field
  const validateField = (name, value) => {
    let errorMsg = '';

    if (name === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email is required';
      } else if (!emailRegex.test(value)) {
        errorMsg = 'Invalid email format (e.g. user@example.com)';
      }
    }

    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password cannot be blank';
      } else if (value.length < 8) {
        errorMsg = 'Password must be at least 8 characters';
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMsg,
    }));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check all fields
    const hasEmailErr = !formData.email || !emailRegex.test(formData.email);
    const hasPassErr = !formData.password || formData.password.length < 8;

    if (hasEmailErr || hasPassErr) {
      setErrors({
        email: hasEmailErr ? 'Please enter a valid email address' : '',
        password: hasPassErr ? 'Password must be at least 8 characters' : '',
      });
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ email: '', password: '', rememberMe: false });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="card">
      <h2>Login Form (Task 5.1 &amp; 5.2)</h2>
      <p className="card-subtitle">
        Controlled inputs with real-time dynamic regex validation and password strength tracker.
      </p>

      {submitted && (
        <div className="alert success">
          <strong>Login Successful!</strong> Form data validated against security patterns.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field with Controlled Input & Dynamic Regex Warning Badge */}
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. shashwat@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-badge">{errors.email}</span>}
        </div>

        {/* Password Field with Dynamic Strength Checker */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter secure password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <span className="error-badge">{errors.password}</span>}

          {/* Task 5.2 Password Strength Sub-Component */}
          <PasswordStrengthChecker password={formData.password} />
        </div>

        {/* Remember Me Checkbox */}
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember me
          </label>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          <button type="submit" className="btn btn-primary">Login</button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">Reset</button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
