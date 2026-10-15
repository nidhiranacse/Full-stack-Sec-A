import React from 'react';

/**
 * Step 3: Academic Preferences & Submission Review
 */
export default function StepThree({ formData, errors, onChange }) {
  return (
    <div>
      <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>Step 3: Department, Section &amp; Confirmation</h3>

      <div className="form-group">
        <label htmlFor="department">Engineering Department *</label>
        <select
          id="department"
          name="department"
          className="form-input"
          value={formData.department}
          onChange={onChange}
        >
          <option value="Computer Science & Engineering">Computer Science &amp; Engineering (CSE)</option>
          <option value="Information Technology">Information Technology (IT)</option>
          <option value="Artificial Intelligence">AI &amp; Machine Learning</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label htmlFor="section">Class Section *</label>
          <select
            id="section"
            name="section"
            className="form-input"
            value={formData.section}
            onChange={onChange}
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rollNumber">Class Roll Number *</label>
          <input
            type="number"
            id="rollNumber"
            name="rollNumber"
            className={`form-input ${errors.rollNumber ? 'error' : ''}`}
            value={formData.rollNumber}
            onChange={onChange}
          />
          {errors.rollNumber && <span className="error-text">{errors.rollNumber}</span>}
        </div>
      </div>

      {/* Review Summary Box */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '16px 0' }}>
        <h4 style={{ margin: '0 0 8px', color: '#4338ca', fontSize: '0.95rem' }}>Submission Summary Review</h4>
        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Name:</strong> {formData.fullName || '(Not provided)'}</p>
        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>CUID:</strong> {formData.cuid || '(Not provided)'}</p>
        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Email:</strong> {formData.email || '(Not provided)'}</p>
        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Section / Roll:</strong> {formData.section} / {formData.rollNumber}</p>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={onChange}
            style={{ width: '16px', height: '16px' }}
          />
          I accept the Full Stack Academic Lab code of conduct and academic honor pledge.
        </label>
        {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
      </div>
    </div>
  );
}
