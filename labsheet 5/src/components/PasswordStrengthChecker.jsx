import React from 'react';

/* ==========================================================
   Task 5.2: Password Strength Checker Sub-Component
   Maps text variations to a dynamic visual progress bar
   ========================================================== */

function PasswordStrengthChecker({ password }) {
  // Regex criteria checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score based on passed checks
  const score = Object.values(checks).filter(Boolean).length;

  // Map score to label and color
  const getStrengthData = () => {
    if (!password) return { label: 'Empty', width: '0%', color: '#ccc' };
    if (score <= 2) return { label: 'Weak', width: '30%', color: '#ef4444' };
    if (score === 3) return { label: 'Fair', width: '60%', color: '#f59e0b' };
    if (score === 4) return { label: 'Good', width: '80%', color: '#3b82f6' };
    return { label: 'Strong', width: '100%', color: '#10b981' };
  };

  const strength = getStrengthData();

  if (!password) return null;

  return (
    <div className="strength-container">
      <div className="strength-header">
        <span>Password Strength:</span>
        <strong style={{ color: strength.color }}>{strength.label}</strong>
      </div>

      {/* Dynamic Visual Progress Tracker Bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: strength.width, backgroundColor: strength.color }}
        ></div>
      </div>

      {/* Criteria Checklist */}
      <ul className="criteria-list">
        <li className={checks.length ? 'met' : 'unmet'}>Min 8 characters</li>
        <li className={checks.upper ? 'met' : 'unmet'}>Uppercase letter (A-Z)</li>
        <li className={checks.lower ? 'met' : 'unmet'}>Lowercase letter (a-z)</li>
        <li className={checks.number ? 'met' : 'unmet'}>Number (0-9)</li>
        <li className={checks.special ? 'met' : 'unmet'}>Special symbol (!@#$)</li>
      </ul>
    </div>
  );
}

export default PasswordStrengthChecker;
