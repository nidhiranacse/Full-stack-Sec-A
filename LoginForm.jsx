import { useState } from "react";
import PasswordStrength from "./PasswordStrength";
import { validateEmail, validatePassword } from "./validators";

// Task 5.1 - controlled inputs + live regex validation with error badges
export default function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState("");

  const errors = {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
  const isValid = !errors.email && !errors.password;

  const handleChange = (e) => {
    setSuccess("");
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (isValid) setSuccess(`Login successful for ${values.email}`);
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Login</h2>

      <label htmlFor="email">Email</label>
      <input
        id="email" name="email" type="email" autoComplete="email"
        value={values.email} onChange={handleChange} onBlur={handleBlur}
        className={touched.email && errors.email ? "invalid" : ""}
      />
      {touched.email && errors.email && <span className="badge error">⚠ {errors.email}</span>}

      <label htmlFor="password">Password</label>
      <input
        id="password" name="password" type="password" autoComplete="current-password"
        value={values.password} onChange={handleChange} onBlur={handleBlur}
        className={touched.password && errors.password ? "invalid" : ""}
      />
      {touched.password && errors.password && (
        <span className="badge error">⚠ {errors.password}</span>
      )}

      <PasswordStrength password={values.password} />

      <button type="submit" disabled={!isValid}>Sign in</button>
      {success && <span className="badge success">✓ {success}</span>}
    </form>
  );
}
