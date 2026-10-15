import React from 'react';
import ValidationBadge from '../ValidationBadge.jsx';

export default function Step2Profile({ data, updateData, errors }) {
  return (
    <div className="wizard-step-body">
      <div className="step-header">
        <h3 className="step-heading">Step 2: Professional Engineering Profile</h3>
        <p className="step-subheading">Share your professional identity, engineering specialization, and background.</p>
      </div>

      <div className="form-group-item">
        <label htmlFor="w-fullname" className="field-label">Legal Full Name:</label>
        <input
          id="w-fullname"
          type="text"
          value={data.fullName}
          onChange={(e) => updateData('fullName', e.target.value)}
          placeholder="e.g. Rahul Raj"
          className={`controlled-text-input ${errors.fullName ? 'field-violated' : ''}`}
        />
        {errors.fullName && (
          <ValidationBadge type="warning" fieldName="Full Name" message={errors.fullName} />
        )}
      </div>

      <div className="form-group-item">
        <label htmlFor="w-role" className="field-label">Primary Engineering Role:</label>
        <select
          id="w-role"
          value={data.role}
          onChange={(e) => updateData('role', e.target.value)}
          className="controlled-select-input"
        >
          <option value="Full Stack Web Engineer">Full Stack Web Engineer</option>
          <option value="Frontend Specialist (React)">Frontend Specialist (React.js)</option>
          <option value="Backend Systems Architect (Django/Python)">Backend Systems Architect (Django/Python)</option>
          <option value="Cloud Platform / DevOps Engineer">Cloud Platform / DevOps Engineer</option>
          <option value="Computer Science Student / Researcher">Computer Science Student / Researcher</option>
        </select>
      </div>

      <div className="form-group-item">
        <label htmlFor="w-bio" className="field-label">Professional Engineering Summary / Bio:</label>
        <textarea
          id="w-bio"
          rows={3}
          value={data.bio}
          onChange={(e) => updateData('bio', e.target.value)}
          placeholder="Brief summary of engineering interests, focus areas, and technical expertise..."
          className="controlled-textarea"
        ></textarea>
      </div>
    </div>
  );
}
