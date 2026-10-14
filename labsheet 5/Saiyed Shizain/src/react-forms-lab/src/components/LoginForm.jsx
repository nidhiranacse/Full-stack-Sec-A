import { useState } from "react";

// Task 5.1 — Controlled login form with regex email/password validation
// and interactive error badges rendered on invalid patterns.
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

function validateEmail(value) {
  if (!value) return "Email is required.";
  if (!EMAIL_PATTERN.test(value))
    return "Enter a valid email address (e.g. name@domain.com).";
  return "";
}

function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!PASSWORD_PATTERN.test(value))
    return "Must include uppercase, lowercase, number & special character.";
  return "";
}

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg =
      name === "email" ? validateEmail(value) : validatePassword(value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    if (!emailError && !passwordError) {
      setSubmitted(true);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Sign in to your account</h2>
      <p className="card-subtitle">Task 5.1 — Controlled Login Form with Regex Validation</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="text"
            className={`field-input ${
              touched.email ? (errors.email ? "invalid" : "valid") : ""
            }`}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && (
            <div className="error-badge">⚠ {errors.email}</div>
          )}
          {touched.email && !errors.email && (
            <div className="success-badge">✓ Looks good</div>
          )}
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className={`field-input ${
              touched.password ? (errors.password ? "invalid" : "valid") : ""
            }`}
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.password && errors.password && (
            <div className="error-badge">⚠ {errors.password}</div>
          )}
          {touched.password && !errors.password && (
            <div className="success-badge">✓ Strong pattern match</div>
          )}
        </div>
        <button type="submit" className="primary-btn" disabled={submitted}>
          {submitted ? "Signed In ✓" : "Sign In"}
        </button>
        {submitted && (
          <p className="footer-note">Authentication successful — welcome back!</p>
        )}
      </form>
    </div>
  );
}
