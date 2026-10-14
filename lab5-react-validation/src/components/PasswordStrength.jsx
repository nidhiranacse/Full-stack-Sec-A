import { useState } from "react";

function PasswordStrength() {
  const [password, setPassword] = useState("");

  const calculateStrength = (value) => {
    let score = 0;

    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[@$!%*?&]/.test(value)) score++;

    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthText = () => {
    if (password.length === 0) return "Enter a password";
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="strength-container">

      <label htmlFor="strengthPassword">
        Password Strength Checker
      </label>

      <input
        id="strengthPassword"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
      />

      <div className="progress-background">
        <div
          className="progress-bar"
          style={{
            width: `${strength * 20}%`
          }}
        ></div>
      </div>

      <p className="strength-text">
        Strength: <strong>{getStrengthText()}</strong>
      </p>

      <ul className="requirements">
        <li className={password.length >= 8 ? "valid" : ""}>
          At least 8 characters
        </li>

        <li className={/[a-z]/.test(password) ? "valid" : ""}>
          Lowercase letter
        </li>

        <li className={/[A-Z]/.test(password) ? "valid" : ""}>
          Uppercase letter
        </li>

        <li className={/[0-9]/.test(password) ? "valid" : ""}>
          Number
        </li>

        <li className={/[@$!%*?&]/.test(password) ? "valid" : ""}>
          Special character
        </li>
      </ul>

    </div>
  );
}

export default PasswordStrength;