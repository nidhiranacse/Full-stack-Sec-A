import React from 'react';

/**
 * ValidationBadge Component
 * Task 5.1: Interactive error warning badges triggered if parameters violate security patterns or regex criteria.
 */
export default function ValidationBadge({ type = 'error', message, fieldName }) {
  if (!message) return null;

  return (
    <div
      className={`validation-badge-pill badge-${type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="badge-icon">
        {type === 'error' ? '🚫' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="badge-text">
        {fieldName && <strong className="badge-field">{fieldName}: </strong>}
        {message}
      </span>
    </div>
  );
}
