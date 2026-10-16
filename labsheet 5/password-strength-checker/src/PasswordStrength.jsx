function PasswordStrength({ password }) {
  const criteria = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&]/.test(password),
  ];

  const score = criteria.filter(Boolean).length;

  let strength = "Weak";

  if (score >= 5) {
    strength = "Very Strong";
  } else if (score >= 4) {
    strength = "Strong";
  } else if (score >= 2) {
    strength = "Medium";
  }

  return (
    <div className="strength-box">
      <h2>Password Strength Checker</h2>

      <div className="progress-container">
        <progress value={score} max="5"></progress>
      </div>

      <p className="strength-text">
        Password Strength: <strong>{strength}</strong>
      </p>

      <p>
        {score}/5 security criteria satisfied
      </p>

      <div className="criteria">
        <p>{criteria[0] ? "✓" : "✗"} At least 8 characters</p>
        <p>{criteria[1] ? "✓" : "✗"} Uppercase letter</p>
        <p>{criteria[2] ? "✓" : "✗"} Lowercase letter</p>
        <p>{criteria[3] ? "✓" : "✗"} Number</p>
        <p>{criteria[4] ? "✓" : "✗"} Special character</p>
      </div>
    </div>
  );
}

export default PasswordStrength;