function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = "";
  if (score === 1 || score === 2) {
    strength = "Weak";
  } else if (score === 3 || score === 4) {
    strength = "Medium";
  } else if (score === 5) {
    strength = "Strong";
  }

  const percentage = (score / 5) * 100;

  return (
    <div className="strength-container">
      <div className="strength-header">
        <span>Password Strength</span>
        <strong>{strength}</strong>
      </div>

      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <ul className="password-rules">
        <li className={checks.length ? "valid" : ""}>
          {checks.length ? "✓" : "✗"} At least 8 characters
        </li>

        <li className={checks.uppercase ? "valid" : ""}>
          {checks.uppercase ? "✓" : "✗"} One uppercase letter
        </li>

        <li className={checks.lowercase ? "valid" : ""}>
          {checks.lowercase ? "✓" : "✗"} One lowercase letter
        </li>

        <li className={checks.number ? "valid" : ""}>
          {checks.number ? "✓" : "✗"} One number
        </li>

        <li className={checks.special ? "valid" : ""}>
          {checks.special ? "✓" : "✗"} One special character
        </li>
      </ul>
    </div>
  );
}

export default PasswordStrength;