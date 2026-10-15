import React, { useMemo } from 'react';

/**
 * PasswordStrengthMeter Component
 * Task 5.2: Maps text input variations across security criteria to a dynamic visual progress tracker bar.
 */
export default function PasswordStrengthMeter({ password = '' }) {
  const analysis = useMemo(() => {
    const checks = [
      { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
      { id: 'uppercase', label: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
      { id: 'lowercase', label: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
      { id: 'number', label: 'Contains a number (0-9)', met: /[0-9]/.test(password) },
      { id: 'special', label: 'Contains special symbol (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const metCount = checks.filter((c) => c.met).length;
    const percentage = password.length === 0 ? 0 : Math.round((metCount / checks.length) * 100);

    let level = 'None';
    let colorClass = 'bar-none';

    if (percentage > 0 && percentage <= 20) {
      level = 'Very Weak';
      colorClass = 'bar-very-weak';
    } else if (percentage > 20 && percentage <= 40) {
      level = 'Weak';
      colorClass = 'bar-weak';
    } else if (percentage > 40 && percentage <= 60) {
      level = 'Moderate';
      colorClass = 'bar-moderate';
    } else if (percentage > 60 && percentage <= 80) {
      level = 'Strong';
      colorClass = 'bar-strong';
    } else if (percentage > 80) {
      level = 'Very Strong';
      colorClass = 'bar-bulletproof';
    }

    return { checks, percentage, level, colorClass, metCount };
  }, [password]);

  if (!password) {
    return (
      <div className="strength-meter-empty">
        <span className="hint-text">Enter password to evaluate security strength criteria</span>
      </div>
    );
  }

  return (
    <div className="strength-meter-subcomponent" aria-label="Password Security Strength">
      <div className="meter-header-row">
        <span className="meter-label">Security Entropy:</span>
        <span className={`meter-status-tag ${analysis.colorClass}`}>
          {analysis.level} ({analysis.percentage}%)
        </span>
      </div>

      {/* Dynamic Visual Progress Tracker Bar */}
      <div className="progress-track-bg" role="progressbar" aria-valuenow={analysis.percentage} aria-valuemin="0" aria-valuemax="100">
        <div
          className={`progress-bar-fill ${analysis.colorClass}`}
          style={{ width: `${analysis.percentage}%` }}
        ></div>
      </div>

      {/* Criterion Checklist Mapping */}
      <ul className="strength-checklist">
        {analysis.checks.map((check) => (
          <li key={check.id} className={`checklist-item ${check.met ? 'met' : 'unmet'}`}>
            <span className="check-icon">{check.met ? '✓' : '○'}</span>
            <span className="check-text">{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
