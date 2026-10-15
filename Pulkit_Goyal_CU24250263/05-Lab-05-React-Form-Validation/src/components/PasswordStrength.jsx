import React from 'react';

/**
 * PasswordStrength Component
 * Evaluates password entropy against 4 standards and renders a reactive visual meter.
 */
export default function PasswordStrength({ password = '' }) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least one special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const percentage = (metCount / criteria.length) * 100;

  let color = '#ef4444'; // Red
  let label = 'Weak';

  if (metCount >= 4) {
    color = '#10b981'; // Green
    label = 'Strong';
  } else if (metCount >= 2) {
    color = '#f59e0b'; // Amber
    label = 'Medium';
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
        <span style={{ color: '#64748b' }}>Password Strength:</span>
        <span style={{ color, fontWeight: 'bold' }}>{password ? label : 'None'}</span>
      </div>

      <div className="strength-container">
        <div
          className="strength-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>

      <ul className="criteria-list">
        {criteria.map((c, i) => (
          <li key={i} className={`criteria-item ${c.met ? 'met' : ''}`}>
            {c.met ? '✓' : '○'} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
