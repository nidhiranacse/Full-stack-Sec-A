import { useState } from "react";
import ErrorBadge from "./ErrorBadge";

const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validate = (name, value) => {
    if (name === "email") {
      return EMAIL_REGEX.test(value)
        ? ""
        : "Invalid email format";
    }

    if (name === "password") {
      return PASSWORD_REGEX.test(value)
        ? ""
        : "Needs 1 uppercase, 1 number & 1 special character";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, value),
    }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const isValid =
    !errors.email &&
    !errors.password &&
    form.email &&
    form.password;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isValid) {
      console.log("Submitting:", form);
      alert("Login form submitted successfully!");
    }
  };

  return (
    <form
      className="login-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2>Sign In</h2>

      <label>Email Address</label>

      <input
        name="email"
        type="text"
        value={form.email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={
          touched.email && errors.email
            ? "input-error"
            : ""
        }
        placeholder="Enter your email"
      />

      {touched.email && (
        <ErrorBadge message={errors.email} />
      )}

      <label>Password</label>

      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        onBlur={handleBlur}
        className={
          touched.password && errors.password
            ? "input-error"
            : ""
        }
        placeholder="Enter your password"
      />

      {touched.password && (
        <ErrorBadge message={errors.password} />
      )}

      <button type="submit" disabled={!isValid}>
        {isValid
          ? "Sign In"
          : "Sign In (disabled — fix errors)"}
      </button>
    </form>
  );
}

export default LoginForm;