import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
 
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    validateField(name, value);
  };

  const validateField = (name, value) => {
    let message = "";

    if (name === "email" && value && !emailRegex.test(value)) {
      message = "Invalid email format";
    }

    if (name === "password" && value && !passwordRegex.test(value)) {
      message =
        "Password must contain 8+ characters, uppercase, lowercase, number and special character";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: message
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password does not meet security requirements";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login Form</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
        />

        {errors.email && (
          <span className="error">{errors.email}</span>
        )}

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
        />

        <PasswordStrength password={formData.password} />

        {errors.password && (
          <span className="error">{errors.password}</span>
        )}

        <button type="submit">Login</button>
      </form>

      {submitted && (
        <p className="success">Login validation successful!</p>
      )}
    </div>
  );
}

export default LoginForm;