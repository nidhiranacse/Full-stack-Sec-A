import React, { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  /*
   * Dynamic security regex patterns
   */

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


  /*
   * Controlled input handler
   */

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });

    validateField(name, value);
  };


  /*
   * Dynamic regex validation
   */

  const validateField = (name, value) => {

    let message = "";

    if (name === "email") {

      if (!emailRegex.test(value)) {
        message = "Enter a valid email address.";
      }

    }

    if (name === "password") {

      if (!passwordRegex.test(value)) {
        message =
          "Password must contain 8+ characters, uppercase, lowercase, number and special character.";
      }

    }

    setErrors((previous) => ({
      ...previous,
      [name]: message
    }));
  };


  /*
   * Form submission
   */

  const handleSubmit = (event) => {

    event.preventDefault();

    const newErrors = {};

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password does not meet security requirements.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {

      alert("Login validation successful!");

      console.log("Login Data:", formData);
    }
  };


  return (
    <section className="card">

      <h2>Task 5.1 & 5.2</h2>

      <h3>Login Form</h3>

      <form onSubmit={handleSubmit}>

        {/* Email */}

        <label>Email Address</label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        {errors.email && (
          <div className="error-badge">
            ⚠ {errors.email}
          </div>
        )}


        {/* Password */}

        <label>Password</label>

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />

        {errors.password && (
          <div className="error-badge">
            ⚠ {errors.password}
          </div>
        )}

        {/* Password strength component */}

        <PasswordStrength
          password={formData.password}
        />


        <button type="submit">
          Login
        </button>

      </form>

    </section>
  );
}

export default LoginForm;