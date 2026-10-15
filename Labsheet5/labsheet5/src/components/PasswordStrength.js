import React from "react";

function PasswordStrength({ password }) {

  let strength = 0;
  let label = "Very Weak";

  if (password.length >= 6) {
    strength++;
  }

  if (/[A-Z]/.test(password)) {
    strength++;
  }

  if (/[0-9]/.test(password)) {
    strength++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    strength++;
  }

  if (strength === 0) {
    label = "Very Weak";
  } else if (strength === 1) {
    label = "Weak";
  } else if (strength === 2) {
    label = "Medium";
  } else if (strength === 3) {
    label = "Strong";
  } else if (strength === 4) {
    label = "Very Strong";
  }

  const percentage = (strength / 4) * 100;

  return (
    <div className="password-strength">

      <div className="strength-header">
        <span>Password Strength</span>
        <span>{label}</span>
      </div>

      <div className="progress-container">

        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        >
        </div>

      </div>

    </div>
  );
}

export default PasswordStrength;