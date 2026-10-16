import React, { useState } from "react";

/* =====================================================
   TASK 5.2 - PASSWORD STRENGTH CHECKER
   ===================================================== */

function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = "";
  if (score === 0) strength = "";
  else if (score <= 2) strength = "Weak";
  else if (score <= 4) strength = "Medium";
  else strength = "Strong";

  return (
    <div className="strength-box">
      <div className="strength-header">
        <span>Password Strength</span>
        <strong>{strength}</strong>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill strength-${score}`}
          style={{ width: `${score * 20}%` }}
        ></div>
      </div>

      <div className="password-rules">
        <p className={checks.length ? "valid" : ""}>
          {checks.length ? "✓" : "✗"} At least 8 characters
        </p>

        <p className={checks.uppercase ? "valid" : ""}>
          {checks.uppercase ? "✓" : "✗"} One uppercase letter
        </p>

        <p className={checks.lowercase ? "valid" : ""}>
          {checks.lowercase ? "✓" : "✗"} One lowercase letter
        </p>

        <p className={checks.number ? "valid" : ""}>
          {checks.number ? "✓" : "✗"} One number
        </p>

        <p className={checks.special ? "valid" : ""}>
          {checks.special ? "✓" : "✗"} One special character
        </p>
      </div>
    </div>
  );
}


/* =====================================================
   TASK 5.1 - LOGIN FORM WITH REGEX VALIDATION
   ===================================================== */

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain 8+ characters, uppercase, lowercase, number and special character";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setSuccess("Login validation successful!");

      console.log("Login Data:", formData);
    }
  };

  return (
    <div className="form-card">
      <h2>Login Form</h2>

      <p className="subtitle">
        Controlled React Inputs with Regex Validation
      </p>

      <form onSubmit={handleSubmit}>
        <label>Email</label>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        {errors.email && (
          <div className="error-badge">
            ⚠ {errors.email}
          </div>
        )}

        <label>Password</label>

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        {errors.password && (
          <div className="error-badge">
            ⚠ {errors.password}
          </div>
        )}

        <PasswordStrength password={formData.password} />

        <button type="submit">
          Login
        </button>

        {success && (
          <div className="success-message">
            ✓ {success}
          </div>
        )}
      </form>
    </div>
  );
}


/* =====================================================
   TASK 5.3 - MULTI STEP ONBOARDING FORM
   ===================================================== */

function StepOne({ data, setData }) {
  return (
    <div>
      <h3>Step 1: Personal Information</h3>

      <label>Full Name</label>

      <input
        type="text"
        placeholder="Enter your full name"
        value={data.name}
        onChange={(e) =>
          setData({
            ...data,
            name: e.target.value,
          })
        }
      />

      <label>Age</label>

      <input
        type="number"
        placeholder="Enter your age"
        value={data.age}
        onChange={(e) =>
          setData({
            ...data,
            age: e.target.value,
          })
        }
      />
    </div>
  );
}


function StepTwo({ data, setData }) {
  return (
    <div>
      <h3>Step 2: Contact Information</h3>

      <label>Email</label>

      <input
        type="email"
        placeholder="Enter your email"
        value={data.email}
        onChange={(e) =>
          setData({
            ...data,
            email: e.target.value,
          })
        }
      />

      <label>Phone Number</label>

      <input
        type="tel"
        placeholder="Enter phone number"
        value={data.phone}
        onChange={(e) =>
          setData({
            ...data,
            phone: e.target.value,
          })
        }
      />
    </div>
  );
}


function StepThree({ data, setData }) {
  return (
    <div>
      <h3>Step 3: Account Information</h3>

      <label>Username</label>

      <input
        type="text"
        placeholder="Choose username"
        value={data.username}
        onChange={(e) =>
          setData({
            ...data,
            username: e.target.value,
          })
        }
      />

      <label>Password</label>

      <input
        type="password"
        placeholder="Create password"
        value={data.password}
        onChange={(e) =>
          setData({
            ...data,
            password: e.target.value,
          })
        }
      />
    </div>
  );
}


function OnboardingForm() {
  const [step, setStep] = useState(1);

  const [userData, setUserData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    console.log("Onboarding Data:", userData);
  };

  if (submitted) {
    return (
      <div className="form-card success-card">
        <h2>Registration Complete!</h2>

        <p>
          Welcome, {userData.name}.
        </p>

        <p>
          Your onboarding information has been submitted successfully.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
          }}
        >
          Start Again
        </button>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h2>Multi-Step Onboarding</h2>

      <p className="subtitle">
        Step {step} of 3
      </p>

      <div className="step-indicator">
        <div className={step >= 1 ? "active-step" : ""}>
          1
        </div>

        <span></span>

        <div className={step >= 2 ? "active-step" : ""}>
          2
        </div>

        <span></span>

        <div className={step >= 3 ? "active-step" : ""}>
          3
        </div>
      </div>

      {step === 1 && (
        <StepOne
          data={userData}
          setData={setUserData}
        />
      )}

      {step === 2 && (
        <StepTwo
          data={userData}
          setData={setUserData}
        />
      )}

      {step === 3 && (
        <StepThree
          data={userData}
          setData={setUserData}
        />
      )}

      <div className="navigation-buttons">
        {step > 1 && (
          <button
            className="secondary-btn"
            onClick={previousStep}
          >
            Previous
          </button>
        )}

        {step < 3 ? (
          <button onClick={nextStep}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}


/* =====================================================
   MAIN APP
   ===================================================== */

function App() {
  return (
    <div className="app">
      <header>
        <h1>LAB SHEET 05</h1>
        <p>
          Form Validation Architecture & Controlled Inputs in React
        </p>
      </header>

      <main>
        <section>
          <LoginForm />
        </section>

        <section>
          <OnboardingForm />
        </section>
      </main>

      <footer>
        <p>React Form Validation Lab</p>
      </footer>
    </div>
  );
}

export default App;