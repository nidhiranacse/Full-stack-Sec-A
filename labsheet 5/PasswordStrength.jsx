function PasswordStrength({ password }) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  const percentage = (strength / 5) * 100;

  let text = "Very Weak"; 

  if (strength === 2) text = "Weak";
  if (strength === 3) text = "Medium";
  if (strength === 4) text = "Strong";
  if (strength === 5) text = "Very Strong";

  return (
    <div className="strength-container">
      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <p>Password Strength: {text}</p>
    </div>
  );
}

export default PasswordStrength;