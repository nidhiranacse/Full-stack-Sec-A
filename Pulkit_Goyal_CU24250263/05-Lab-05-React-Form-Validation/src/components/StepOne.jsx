import React from 'react';

/**
 * Step 1: Personal & Academic Identification
 */
export default function StepOne({ formData, errors, onChange }) {
  return (
    <div>
      <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>Step 1: Student Information</h3>

      <div className="form-group">
        <label htmlFor="fullName">Full Legal Name *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          className={`form-input ${errors.fullName ? 'error' : ''}`}
          placeholder="e.g. Pulkit Goyal"
          value={formData.fullName}
          onChange={onChange}
        />
        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="cuid">College University ID (CUID) *</label>
        <input
          type="text"
          id="cuid"
          name="cuid"
          className={`form-input ${errors.cuid ? 'error' : ''}`}
          placeholder="e.g. CU24250263"
          value={formData.cuid}
          onChange={onChange}
        />
        {errors.cuid && <span className="error-text">{errors.cuid}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="e.g. pulkitgoyal0103@gmail.com"
          value={formData.email}
          onChange={onChange}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number (10 digits) *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="9876543210"
          value={formData.phone}
          onChange={onChange}
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}
      </div>
    </div>
  );
}
