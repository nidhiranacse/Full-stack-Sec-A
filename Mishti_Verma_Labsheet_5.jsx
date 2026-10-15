import React, { useState } from "react";

// PASSWORD STRENGTH CHECKER

function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  const getStrength = () => {
    if (score <= 1) return "Very Weak";
    if (score === 2) return "Weak";
    if (score === 3) return "Medium";
    if (score === 4) return "Good";
    return "Strong";
  };

  return (
    <div className="strength-box">

      <div className="strength-title">
        <span>Password Strength</span>

        <strong className={`strength-${score}`}>
          {getStrength()}
        </strong>
      </div>

      <div className="strength-bar">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={
              level <= score
                ? `strength-segment active level-${score}`
                : "strength-segment"
            }
          />
        ))}
      </div>

      <div className="requirements">

        <p className={checks.length ? "valid" : "invalid"}>
          {checks.length ? "✓" : "✕"} At least 8 characters
        </p>

        <p className={checks.uppercase ? "valid" : "invalid"}>
          {checks.uppercase ? "✓" : "✕"} One uppercase letter
        </p>

        <p className={checks.lowercase ? "valid" : "invalid"}>
          {checks.lowercase ? "✓" : "✕"} One lowercase letter
        </p>

        <p className={checks.number ? "valid" : "invalid"}>
          {checks.number ? "✓" : "✕"} One number
        </p>

        <p className={checks.special ? "valid" : "invalid"}>
          {checks.special ? "✓" : "✕"} One special character
          {" "}(!@#$%^&*)
        </p>

      </div>

      {score === 5 && (
        <div className="success-message">
          🛡 Great! Your password is strong.
        </div>
      )}

    </div>
  );
}


// ======================================================
// LOGIN FORM
// ======================================================

function LoginForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);


  // Email Regex

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  // Password Regex

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;


  const validateEmail = (value) => {

    setEmail(value);

    if (value === "") {
      setEmailError("Email is required");
    }
    else if (!emailRegex.test(value)) {
      setEmailError("Enter a valid email address");
    }
    else {
      setEmailError("");
    }
  };


  const validatePassword = (value) => {

    setPassword(value);

    if (value === "") {
      setPasswordError("Password is required");
    }
    else if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password does not meet security requirements"
      );
    }
    else {
      setPasswordError("");
    }
  };


  const handleLogin = (e) => {

    e.preventDefault();

    let valid = true;


    if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }


    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must contain 8+ characters, uppercase, lowercase, number and special character"
      );
      valid = false;
    }


    if (valid) {
      setLoggedIn(true);
    }
  };


  if (loggedIn) {

    return (
      <div className="login-success">

        <div className="success-icon">
          ✓
        </div>

        <h2>Login Successful!</h2>

        <p>
          Welcome back! You have successfully logged in.
        </p>

        <button
          onClick={() => setLoggedIn(false)}
          className="primary-btn"
        >
          Logout
        </button>

      </div>
    );
  }


  return (

    <div className="login-card">

      <div className="lock-icon">
        🔒
      </div>

      <h1>Welcome Back!</h1>

      <p className="subtitle">
        Please login to your account
      </p>


      <form onSubmit={handleLogin}>

        {/* EMAIL */}

        <label>Email</label>

        <input
          type="text"
          value={email}
          placeholder="Enter your email"
          onChange={(e) =>
            validateEmail(e.target.value)
          }
          className={emailError ? "input-error" : ""}
        />

        {emailError && (
          <div className="error-badge">
            ✕ {emailError}
          </div>
        )}


        {/* PASSWORD */}

        <label>Password</label>

        <div className="password-wrapper">

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Enter your password"
            onChange={(e) =>
              validatePassword(e.target.value)
            }
            className={
              passwordError ? "input-error" : ""
            }
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? "🙈" : "👁"}
          </button>

        </div>


        {passwordError && (
          <div className="error-badge">
            ✕ {passwordError}
          </div>
        )}


        {/* PASSWORD STRENGTH */}

        <PasswordStrength
          password={password}
        />


        <div className="login-options">

          <label className="remember">

            <input type="checkbox" />

            Remember me

          </label>

          <a href="#forgot">
            Forgot password?
          </a>

        </div>


        <button
          type="submit"
          className="primary-btn"
        >
          Login
        </button>


        <p className="signup">
          Don't have an account?
          <span> Sign up</span>
        </p>

      </form>

    </div>
  );
}


// ======================================================
// STEP 1 - PERSONAL INFORMATION
// ======================================================

function PersonalStep({ data, updateData, next }) {

  return (

    <div className="step-content">

      <h2>Personal Information</h2>

      <p>Enter your basic personal details.</p>


      <label>Full Name</label>

      <input
        value={data.name}
        placeholder="John Doe"
        onChange={(e) =>
          updateData("name", e.target.value)
        }
      />


      <label>Email</label>

      <input
        type="email"
        value={data.email}
        placeholder="john.doe@example.com"
        onChange={(e) =>
          updateData("email", e.target.value)
        }
      />


      <label>Phone Number</label>

      <input
        value={data.phone}
        placeholder="9876543210"
        onChange={(e) =>
          updateData("phone", e.target.value)
        }
      />


      <button
        className="primary-btn"
        onClick={next}
      >
        Next →
      </button>

    </div>
  );
}


// ======================================================
// STEP 2 - ACCOUNT INFORMATION
// ======================================================

function AccountStep({ data, updateData, next, back }) {

  return (

    <div className="step-content">

      <h2>Account Information</h2>

      <p>Create your login credentials.</p>


      <label>Username</label>

      <input
        value={data.username}
        placeholder="johndoe25"
        onChange={(e) =>
          updateData("username", e.target.value)
        }
      />


      <label>Password</label>

      <input
        type="password"
        value={data.accountPassword}
        placeholder="Create password"
        onChange={(e) =>
          updateData(
            "accountPassword",
            e.target.value
          )
        }
      />


      <label>Confirm Password</label>

      <input
        type="password"
        value={data.confirmPassword}
        placeholder="Confirm password"
        onChange={(e) =>
          updateData(
            "confirmPassword",
            e.target.value
          )
        }
      />


      <div className="step-buttons">

        <button
          className="secondary-btn"
          onClick={back}
        >
          ← Back
        </button>

        <button
          className="primary-btn"
          onClick={next}
        >
          Next →
        </button>

      </div>

    </div>
  );
}


// ======================================================
// STEP 3 - PROFILE INFORMATION
// ======================================================

function ProfileStep({ data, updateData, next, back }) {

  return (

    <div className="step-content">

      <h2>Profile Information</h2>

      <p>Tell us a little about yourself.</p>


      <div className="profile-avatar">
        👤
      </div>


      <label>Bio</label>

      <textarea
        value={data.bio}
        placeholder="Frontend Developer | React Enthusiast"
        onChange={(e) =>
          updateData("bio", e.target.value)
        }
      />


      <label>Location</label>

      <input
        value={data.location}
        placeholder="India"
        onChange={(e) =>
          updateData("location", e.target.value)
        }
      />


      <div className="step-buttons">

        <button
          className="secondary-btn"
          onClick={back}
        >
          ← Back
        </button>

        <button
          className="primary-btn"
          onClick={next}
        >
          Next →
        </button>

      </div>

    </div>
  );
}


// ======================================================
// STEP 4 - REVIEW AND SUBMIT
// ======================================================

function ReviewStep({ data, back, submit }) {

  return (

    <div className="step-content">

      <h2>Review & Submit</h2>

      <p>Check your information before submitting.</p>


      <div className="review">

        <div>
          👤
          <strong>{data.name}</strong>
        </div>

        <div>
          ✉️
          {data.email}
        </div>

        <div>
          📞
          {data.phone}
        </div>

        <div>
          🔑
          {data.username}
        </div>

        <div>
          📝
          {data.bio || "No bio added"}
        </div>

        <div>
          📍
          {data.location}
        </div>

      </div>


      <div className="step-buttons">

        <button
          className="secondary-btn"
          onClick={back}
        >
          ← Back
        </button>

        <button
          className="submit-btn"
          onClick={submit}
        >
          Submit ✓
        </button>

      </div>

    </div>
  );
}


// ======================================================
// ONBOARDING WIZARD
// ======================================================

function OnboardingWizard() {

  const [step, setStep] = useState(1);

  const [submitted, setSubmitted] = useState(false);


  // All form data is maintained in parent

  const [data, setData] = useState({

    name: "John Doe",

    email: "john.doe@example.com",

    phone: "9876543210",

    username: "johndoe25",

    accountPassword: "React@2025",

    confirmPassword: "React@2025",

    bio: "Frontend Developer | React Enthusiast",

    location: "India"

  });


  const updateData = (field, value) => {

    setData((previousData) => ({

      ...previousData,

      [field]: value

    }));

  };


  const next = () => {

    if (step < 4) {
      setStep(step + 1);
    }

  };


  const back = () => {

    if (step > 1) {
      setStep(step - 1);
    }

  };


  const submit = () => {

    setSubmitted(true);

  };


  if (submitted) {

    return (

      <div className="submitted">

        <div className="success-icon">
          ✓
        </div>

        <h2>Account Created!</h2>

        <p>
          Your onboarding has been completed successfully.
        </p>

        <button
          className="primary-btn"
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

    <div className="wizard-card">

      <h1>Create Your Account</h1>

      <p className="subtitle">
        Let's get you all set up.
      </p>


      {/* STEP INDICATOR */}

      <div className="step-indicator">

        {[1, 2, 3, 4].map((number) => (

          <React.Fragment key={number}>

            <div
              className={
                number <= step
                  ? "step active"
                  : "step"
              }
            >
              {number}
            </div>

            {number < 4 && (
              <div
                className={
                  number < step
                    ? "step-line active"
                    : "step-line"
                }
              />
            )}

          </React.Fragment>

        ))}

      </div>


      <div className="step-names">

        <span>Personal</span>
        <span>Account</span>
        <span>Profile</span>
        <span>Review</span>

      </div>


      {step === 1 && (
        <PersonalStep
          data={data}
          updateData={updateData}
          next={next}
        />
      )}


      {step === 2 && (
        <AccountStep
          data={data}
          updateData={updateData}
          next={next}
          back={back}
        />
      )}


      {step === 3 && (
        <ProfileStep
          data={data}
          updateData={updateData}
          next={next}
          back={back}
        />
      )}


      {step === 4 && (
        <ReviewStep
          data={data}
          back={back}
          submit={submit}
        />
      )}

    </div>
  );
}


// ======================================================
// MAIN APP
// ======================================================

function App() {

  const [page, setPage] = useState("login");


  return (

    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f7fc;
          color: #17233c;
        }

        .app {
          min-height: 100vh;
        }


        /* HEADER */

        .header {
          background: linear-gradient(
            120deg,
            #1769ff,
            #7144e8,
            #c832c8
          );

          color: white;

          padding: 22px 7%;

          display: flex;

          justify-content: space-between;

          align-items: center;
        }

        .logo {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .logo-icon {
          background: white;

          color: #1769ff;

          width: 42px;

          height: 42px;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 25px;

          font-weight: bold;
        }

        .logo h1 {
          margin: 0;

          font-size: 27px;
        }


        .header-buttons {
          display: flex;

          gap: 10px;
        }

        .header-buttons button {
          padding: 10px 18px;

          border-radius: 8px;

          border: 1px solid white;

          background: transparent;

          color: white;

          cursor: pointer;
        }

        .header-buttons button.active {
          background: white;

          color: #4f46e5;
        }


        /* MAIN */

        .main {
          min-height: calc(100vh - 90px);

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 40px 20px;
        }


        /* LOGIN */

        .login-card,
        .wizard-card {

          width: 100%;

          max-width: 600px;

          background: white;

          padding: 38px;

          border-radius: 18px;

          box-shadow:
            0 8px 35px rgba(30,45,80,0.10);
        }

        .login-card {

          max-width: 500px;
        }


        .lock-icon {

          width: 65px;

          height: 65px;

          margin: auto;

          border-radius: 50%;

          background: #eef1ff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 30px;
        }

        h1 {

          text-align: center;

          margin-bottom: 8px;
        }

        .subtitle {

          text-align: center;

          color: #68758e;

          margin-bottom: 28px;
        }


        label {

          display: block;

          font-weight: bold;

          margin: 16px 0 7px;

          font-size: 14px;
        }

        input,
        textarea {

          width: 100%;

          padding: 13px;

          border: 1px solid #d8deea;

          border-radius: 8px;

          font-size: 15px;

          outline: none;

          font-family: inherit;
        }

        textarea {

          min-height: 90px;

          resize: vertical;
        }

        input:focus,
        textarea:focus {

          border-color: #5365e8;
        }

        .input-error {

          border-color: #ef4444;
        }


        /* ERROR */

        .error-badge {

          color: #dc2626;

          font-size: 13px;

          margin-top: 6px;

          background: #fff1f2;

          padding: 7px 10px;

          border-radius: 6px;
        }


        /* PASSWORD */

        .password-wrapper {

          position: relative;
        }

        .password-wrapper input {

          padding-right: 45px;
        }

        .eye-btn {

          position: absolute;

          right: 10px;

          top: 8px;

          border: 0;

          background: transparent;

          cursor: pointer;

          font-size: 18px;
        }


        .strength-box {

          margin-top: 20px;
        }

        .strength-title {

          display: flex;

          justify-content: space-between;

          margin-bottom: 10px;
        }

        .strength-title strong {
          font-size: 14px;
        }

        .strength-1,
        .strength-2 {
          color: #ef4444;
        }

        .strength-3 {
          color: #f59e0b;
        }

        .strength-4,
        .strength-5 {
          color: #16a34a;
        }

        .strength-bar {

          display: flex;

          gap: 5px;

          height: 8px;
        }

        .strength-segment {

          flex: 1;

          background: #e5e7eb;

          border-radius: 5px;
        }

        .strength-segment.active {

          background: #22c55e;
        }


        .requirements {

          margin-top: 15px;
        }

        .requirements p {

          margin: 6px 0;

          font-size: 13px;
        }

        .valid {

          color: #16a34a;
        }

        .invalid {

          color: #ef4444;
        }

        .success-message {

          margin-top: 16px;

          padding: 12px;

          border: 1px solid #86efac;

          background: #f0fdf4;

          color: #15803d;

          border-radius: 8px;
        }


        /* OPTIONS */

        .login-options {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin: 20px 0;
        }

        .remember {

          display: flex;

          align-items: center;

          gap: 7px;

          margin: 0;

          font-weight: normal;
        }

        .remember input {

          width: auto;
        }

        a {

          color: #4f46e5;

          text-decoration: none;

          font-size: 14px;
        }


        /* BUTTONS */

        .primary-btn,
        .submit-btn {

          width: 100%;

          padding: 13px;

          border: none;

          border-radius: 8px;

          background: linear-gradient(
            120deg,
            #1769ff,
            #743bd8
          );

          color: white;

          font-size: 16px;

          font-weight: bold;

          cursor: pointer;

          margin-top: 15px;
        }

        .secondary-btn {

          padding: 12px 20px;

          border: 1px solid #d5dbea;

          border-radius: 8px;

          background: #f8f9fc;

          color: #334155;

          cursor: pointer;
        }

        .submit-btn {

          background: #16a34a;

          width: auto;

          padding: 12px 25px;
        }


        .signup {

          text-align: center;

          color: #68758e;

          margin-top: 20px;
        }

        .signup span {

          color: #4f46e5;

          font-weight: bold;
        }


        /* WIZARD */

        .wizard-card {

          max-width: 650px;
        }

        .wizard-card h1 {

          margin-top: 0;
        }

        .step-indicator {

          display: flex;

          align-items: center;

          justify-content: center;

          margin-top: 30px;
        }

        .step {

          width: 38px;

          height: 38px;

          border-radius: 50%;

          border: 2px solid #d5dbea;

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: bold;

          color: #64748b;

        }

        .step.active {

          background: #5b3be5;

          color: white;

          border-color: #5b3be5;
        }

        .step-line {

          height: 2px;

          width: 60px;

          background: #d5dbea;
        }

        .step-line.active {

          background: #5b3be5;
        }

        .step-names {

          display: flex;

          justify-content: space-between;

          margin: 10px 25px 30px;

          color: #64748b;

          font-size: 13px;
        }

        .step-content h2 {

          margin-top: 10px;

          text-align: center;
        }

        .step-content > p {

          text-align: center;

          color: #68758e;
        }

        .step-buttons {

          display: flex;

          justify-content: space-between;

          gap: 15px;

          margin-top: 25px;
        }

        .step-buttons .primary-btn {

          width: auto;

          padding: 12px 25px;

          margin-top: 0;
        }


        .profile-avatar {

          width: 80px;

          height: 80px;

          margin: 20px auto;

          border-radius: 50%;

          background: #edf0f8;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 40px;
        }


        /* REVIEW */

        .review {

          background: #f8f9fd;

          padding: 20px;

          border-radius: 10px;

          margin-top: 20px;
        }

        .review div {

          padding: 11px 0;

          border-bottom: 1px solid #e3e7ef;

          display: flex;

          gap: 12px;
        }

        .review div:last-child {

          border-bottom: none;
        }

        .review strong {

          margin-left: auto;
        }


        /* SUCCESS */

        .login-success,
        .submitted {

          background: white;

          padding: 50px;

          border-radius: 18px;

          text-align: center;

          max-width: 500px;

          box-shadow:
            0 8px 35px rgba(30,45,80,0.10);
        }

        .success-icon {

          width: 75px;

          height: 75px;

          margin: auto;

          border-radius: 50%;

          background: #dcfce7;

          color: #16a34a;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 40px;

          font-weight: bold;
        }


        @media (max-width: 600px) {

          .header {

            padding: 18px;

          }

          .logo h1 {

            font-size: 21px;

          }

          .header-buttons button {

            padding: 8px 10px;

            font-size: 12px;

          }

          .main {

            padding: 20px 12px;

          }

          .login-card,
          .wizard-card {

            padding: 25px 20px;

          }

          .step-line {

            width: 25px;

          }

          .step-names {

            margin-left: 5px;

            margin-right: 5px;

          }

          .step-buttons {

            flex-direction: column;

          }

          .step-buttons button {

            width: 100%;

          }

          .login-options {

            font-size: 13px;

          }

        }

      `}</style>


      <div className="app">

        <header className="header">

          <div className="logo">

            <div className="logo-icon">
              ✓
            </div>

            <h1>SecurePortal</h1>

          </div>


          <div className="header-buttons">

            <button
              className={
                page === "login"
                  ? "active"
                  : ""
              }
              onClick={() => setPage("login")}
            >
              Login
            </button>

            <button
              className={
                page === "onboarding"
                  ? "active"
                  : ""
              }
              onClick={() => setPage("onboarding")}
            >
              Create Account
            </button>

          </div>

        </header>


        <main className="main">

          {page === "login" ? (
            <LoginForm />
          ) : (
            <OnboardingWizard />
          )}

        </main>

      </div>

    </>
  );
}


export default App;