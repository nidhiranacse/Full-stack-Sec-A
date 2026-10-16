import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password security pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain 8+ characters, uppercase, lowercase, number and special character."
      );
      return;
    }

    alert("Login successful!");
  };

  return (
    <div className="card">
      <h2>Task 5.1 - Login Form</h2>

      <form onSubmit={handleSubmit}>
        <label>Email Address</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {email !== "" && !emailRegex.test(email) && (
          <div className="error-badge">
            ❌ Invalid email format
          </div>
        )}

        {email !== "" && emailRegex.test(email) && (
          <div className="success-badge">
            ✅ Valid email
          </div>
        )}

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {password !== "" && !passwordRegex.test(password) && (
          <div className="error-badge">
            ❌ Password does not meet security requirements
          </div>
        )}

        {password !== "" && passwordRegex.test(password) && (
          <div className="success-badge">
            ✅ Strong password
          </div>
        )}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;