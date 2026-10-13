import React, { useState } from 'react';
import PasswordStrength from './PasswordStrength.jsx';

/**
 * Step 2: Account Security & Password Creation
 */
export default function StepTwo({ formData, errors, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>Step 2: Password &amp; Security</h3>

      <div className="form-group">
        <label htmlFor="password">Create Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Min 8 characters with letter, number & symbol"
            value={formData.password}
            onChange={onChange}
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
        {errors.password && <span className="error-text">{errors.password}</span>}
        <PasswordStrength password={formData.password} />
      </div>

      <div className="form-group" style={{ marginTop: '16px' }}>
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Re-type your password"
          value={formData.confirmPassword}
          onChange={onChange}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>
    </div>
  );
}
