import { useState } from "react";

function LoginForm() {
  // Controlled input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Email validation using regular expression
  const validateEmail = (value) => {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value.trim() === "") {
      setEmailError("Email is required.");
      return false;
    }

    if (!emailPattern.test(value)) {
      setEmailError("Enter a valid email address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Password security validation using regular expression
  const validatePassword = (value) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (value === "") {
      setPasswordError("Password is required.");
      return false;
    }

    if (!passwordPattern.test(value)) {
      setPasswordError(
        "Password must contain 8+ characters, uppercase, lowercase, number and special character."
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage("");

    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (validEmail && validPassword) {
      setSuccessMessage("Login validation successful!");

      console.log("Login Data:", {
        email,
        password
      });
    }
  };

  return (
    <div className="login-card">

      <h1>Login</h1>

      <p className="subtitle">
        Sign in to your account
      </p>

      <form onSubmit={handleSubmit}>

        {/* Email input */}
        <div className="form-group">
          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(event) => {
              setEmail(event.target.value);
              validateEmail(event.target.value);
            }}
          />

          {emailError && (
            <span className="error-badge">
              {emailError}
            </span>
          )}
        </div>

        {/* Password input */}
        <div className="form-group">
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(event) => {
              setPassword(event.target.value);
              validatePassword(event.target.value);
            }}
          />

          {passwordError && (
            <span className="error-badge">
              {passwordError}
            </span>
          )}
        </div>

        <button
          className="login-button"
          type="submit"
        >
          Login
        </button>

        {successMessage && (
          <p className="success-message">
            {successMessage}
          </p>
        )}

      </form>

    </div>
  );
}

export default LoginForm;