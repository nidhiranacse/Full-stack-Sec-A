import React from 'react';
import ValidationBadge from '../ValidationBadge.jsx';
import PasswordStrengthMeter from '../PasswordStrengthMeter.jsx';

export default function Step1Account({ data, updateData, errors }) {
  return (
    <div className="wizard-step-body">
      <div className="step-header">
        <h3 className="step-heading">Step 1: Account &amp; Authentication Credentials</h3>
        <p className="step-subheading">Define your unique identifier and security credentials with regex verification.</p>
      </div>

      <div className="form-group-item">
        <label htmlFor="w-email" className="field-label">Work / University Email Address:</label>
        <input
          id="w-email"
          type="email"
          value={data.email}
          onChange={(e) => updateData('email', e.target.value)}
          placeholder="e.g. rahul.raj@developer.org"
          className={`controlled-text-input ${errors.email ? 'field-violated' : ''}`}
        />
        {errors.email && (
          <ValidationBadge type="warning" fieldName="Email Pattern" message={errors.email} />
        )}
      </div>

      <div className="form-group-item">
        <label htmlFor="w-username" className="field-label">Developer Username Handle:</label>
        <input
          id="w-username"
          type="text"
          value={data.username}
          onChange={(e) => updateData('username', e.target.value)}
          placeholder="e.g. rahul_raj99 (3-20 chars alphanumeric)"
          className={`controlled-text-input ${errors.username ? 'field-violated' : ''}`}
        />
        {errors.username && (
          <ValidationBadge type="warning" fieldName="Username Pattern" message={errors.username} />
        )}
      </div>

      <div className="form-group-item">
        <label htmlFor="w-password" className="field-label">Master Security Password:</label>
        <input
          id="w-password"
          type="password"
          value={data.password}
          onChange={(e) => updateData('password', e.target.value)}
          placeholder="Enter a strong password with mixed characters"
          className={`controlled-text-input ${errors.password ? 'field-violated' : ''}`}
        />
        {errors.password && (
          <ValidationBadge type="warning" fieldName="Password Strength" message={errors.password} />
        )}
        <PasswordStrengthMeter password={data.password} />
      </div>
    </div>
  );
}
