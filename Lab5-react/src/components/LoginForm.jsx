import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const validateForm = () => {
    const newErrors = {};

    if (!emailPattern.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!passwordRules.length) {
      newErrors.password = "Password must contain at least 8 characters.";
    } else if (
      !passwordRules.uppercase ||
      !passwordRules.lowercase ||
      !passwordRules.number ||
      !passwordRules.special
    ) {
      newErrors.password =
        "Use uppercase, lowercase, number and special character.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      alert("Login validation successful! ✅");
    }
  };

  return (
    <section className="form-card login-card">

      <div className="card-heading">
        <div className="heading-icon blue-icon">🔐</div>

        <div>
          <h2>Task 5.1 — Login Form</h2>
          <div className="heading-line"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="input-grid">

          <div className="input-group">
            <label>📧 Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
            />

            {email && (
              <span
                className={
                  emailPattern.test(email)
                    ? "validation-badge valid"
                    : "validation-badge invalid"
                }
              >
                {emailPattern.test(email)
                  ? "✓ Valid email"
                  : "⚠ Invalid email format"}
              </span>
            )}

            {errors.email && (
              <span className="error">
                ⚠️ {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label>🔑 Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({});
              }}
            />

            {password && (
              <div className="criteria-list">

                <span className={passwordRules.length ? "rule valid" : "rule"}>
                  {passwordRules.length ? "✓" : "○"} 8+ characters
                </span>

                <span
                  className={
                    passwordRules.uppercase ? "rule valid" : "rule"
                  }
                >
                  {passwordRules.uppercase ? "✓" : "○"} Uppercase
                </span>

                <span
                  className={
                    passwordRules.lowercase ? "rule valid" : "rule"
                  }
                >
                  {passwordRules.lowercase ? "✓" : "○"} Lowercase
                </span>

                <span
                  className={
                    passwordRules.number ? "rule valid" : "rule"
                  }
                >
                  {passwordRules.number ? "✓" : "○"} Number
                </span>

                <span
                  className={
                    passwordRules.special ? "rule valid" : "rule"
                  }
                >
                  {passwordRules.special ? "✓" : "○"} Special character
                </span>

              </div>
            )}

            {errors.password && (
              <span className="error">
                ⚠️ {errors.password}
              </span>
            )}
          </div>

        </div>

        <PasswordStrength password={password} />

        <button className="primary-btn" type="submit">
          🔒 Login →
        </button>

      </form>
    </section>
  );
}

export default LoginForm;