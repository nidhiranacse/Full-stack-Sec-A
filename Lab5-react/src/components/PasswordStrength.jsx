function PasswordStrength({ password }) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  const levels = [
    "Enter password",
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ];

  const strengthClass = [
    "empty",
    "very-weak",
    "weak",
    "fair",
    "strong",
    "very-strong",
  ][score];

  return (
    <div className="strength-box">

      <div className="strength-header">
        <span>🔐 Password Strength</span>

        <strong className={strengthClass}>
          {levels[score]}
        </strong>
      </div>

      <div className="progress">
        <div
          className={`progress-bar ${strengthClass}`}
          style={{ width: `${score * 20}%` }}
        ></div>
      </div>

      <div className="strength-segments">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  );
}

export default PasswordStrength;