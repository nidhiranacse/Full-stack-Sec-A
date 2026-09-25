import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {
  // Controlled input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error state
  const [errors, setErrors] = useState({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must contain 8+ characters, uppercase, lowercase, number and special character";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      alert("Login successful!");

      console.log("Login Data:", {
        email,
        password,
      });
    }
  };

  // Email change handler
  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    // Clear email error while typing
    if (errors.email) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        email: "",
      }));
    }
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    // Clear password error while typing
    if (errors.password) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        password: "",
      }));
    }
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>

        {/* EMAIL */}
        <div className="form-group">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleEmailChange}
          />

          {errors.email && (
            <span className="error-badge">
              ⚠ {errors.email}
            </span>
          )}
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={handlePasswordChange}
          />

          {errors.password && (
            <span className="error-badge">
              ⚠ {errors.password}
            </span>
          )}
        </div>

        {/* PASSWORD STRENGTH COMPONENT */}
        <PasswordStrength password={password} />

        {/* SUBMIT BUTTON */}
        <button type="submit">
          Login
        </button>

      </form>
    </div>
  );
}

export default LoginForm;