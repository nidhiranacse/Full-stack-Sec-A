import { useState } from "react";
import "./App.css";

function PasswordStrength({ password }) {
const checks = [
password.length >= 8,
/[A-Z]/.test(password),
/[a-z]/.test(password),
/[0-9]/.test(password),
/[^A-Za-z0-9]/.test(password)
];

const score = checks.filter(Boolean).length;
const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

return ( <div className="strength-container"> <div className="strength-bar">
<div
className={`strength-fill strength-${score}`}
style={{ width: `${score * 20}%` }}
></div> </div> <p>
Password Strength:{" "}
{password ? labels[Math.max(0, score - 1)] : "Not entered"} </p> </div>
);
}

function LoginForm({ onLogin }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errors, setErrors] = useState({});
const [showPassword, setShowPassword] = useState(false);

const validateForm = () => {
const newErrors = {};


if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  newErrors.email = "Please enter a valid email address.";
}

if (password.length < 8) {
  newErrors.password = "Password must contain at least 8 characters.";
} else if (!/[A-Z]/.test(password)) {
  newErrors.password = "Password must contain an uppercase letter.";
} else if (!/[a-z]/.test(password)) {
  newErrors.password = "Password must contain a lowercase letter.";
} else if (!/[0-9]/.test(password)) {
  newErrors.password = "Password must contain a number.";
} else if (!/[^A-Za-z0-9]/.test(password)) {
  newErrors.password = "Password must contain a special character.";
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;

};

const handleSubmit = (e) => {
e.preventDefault();


if (validateForm()) {
  onLogin(email);
}


};

return ( <form onSubmit={handleSubmit} noValidate> <h2>Login Form</h2> <p className="subtitle">Enter your details to continue</p>


  <label>Email Address</label>
  <input
    type="email"
    value={email}
    onChange={(e) => {
      setEmail(e.target.value);
      setErrors({ ...errors, email: "" });
    }}
    placeholder="Enter your email"
  />
  {errors.email && <p className="error">{errors.email}</p>}

  <label>Password</label>
  <div className="password-input">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setErrors({ ...errors, password: "" });
      }}
      placeholder="Enter your password"
    />
    <button
      type="button"
      className="show-btn"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  <PasswordStrength password={password} />

  {errors.password && <p className="error">{errors.password}</p>}

  <button type="submit" className="primary-btn">
    Login
  </button>
</form>


);
}

function OnboardingForm({ onComplete }) {
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({
name: "",
email: "",
age: "",
course: ""
});
const [error, setError] = useState("");

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
setError("");
};

const handleNext = (e) => {
e.preventDefault();

if (step === 1) {
  if (!formData.name.trim()) {
    setError("Please enter your full name.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setError("Please enter a valid email address.");
    return;
  }
}

if (step === 2) {
  if (
    !formData.age ||
    Number(formData.age) < 1 ||
    Number(formData.age) > 120 ||
    !formData.course.trim()
  ) {
    setError("Please enter a valid age and course.");
    return;
  }
}

setError("");
setStep(step + 1);


};

const handleBack = () => {
setError("");
setStep(step - 1);
};

const handleSubmit = (e) => {
e.preventDefault();
onComplete(formData);
};

return (
<form onSubmit={step < 3 ? handleNext : handleSubmit}> <h2>Onboarding Form</h2> <p className="subtitle">Step {step} of 3</p>


  <div className="progress-steps">
    {[1, 2, 3].map((number) => (
      <div
        key={number}
        className={step >= number ? "step active" : "step"}
      >
        {number}
      </div>
    ))}
  </div>

  {step === 1 && (
    <>
      <label>Full Name</label>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name"
      />

      <label>Email Address</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
      />
    </>
  )}

  {step === 2 && (
    <>
      <label>Age</label>
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Enter your age"
      />

      <label>Course</label>
      <input
        name="course"
        value={formData.course}
        onChange={handleChange}
        placeholder="Enter your course"
      />
    </>
  )}

  {step === 3 && (
    <div className="review-box">
      <h3>Review Your Details</h3>
      <p><strong>Name:</strong> {formData.name}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Age:</strong> {formData.age}</p>
      <p><strong>Course:</strong> {formData.course}</p>
    </div>
  )}

  {error && <p className="error">{error}</p>}

  <div className="button-row">
    {step > 1 && (
      <button
        type="button"
        className="secondary-btn"
        onClick={handleBack}
      >
        Back
      </button>
    )}

    <button type="submit" className="primary-btn">
      {step === 3 ? "Submit Details" : "Next"}
    </button>
  </div>
</form>


);
}

export default function App() {
const [page, setPage] = useState("login");
const [message, setMessage] = useState("");

const handleLogin = (email) => {
setMessage(`Form validation successful for ${email}.`);
};

const handleComplete = (data) => {
setMessage(
`Welcome, ${data.name}! Your details were submitted successfully.`
);
setPage("success");
};

return ( <div className="app-container"> <div className="form-card">
{page === "login" && (
<> <LoginForm onLogin={handleLogin} />


        {message && (
          <div className="success-message">
            <p>{message}</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setMessage("");
                setPage("onboarding");
              }}
            >
              Continue to Onboarding
            </button>
          </div>
        )}

        {!message && (
          <p className="switch-text">
            New user?{" "}
            <button
              type="button"
              onClick={() => setPage("onboarding")}
            >
              Register here
            </button>
          </p>
        )}
      </>
    )}

    {page === "onboarding" && (
      <OnboardingForm onComplete={handleComplete} />
    )}

    {page === "success" && (
      <div className="success-screen">
        <h2>Registration Successful</h2>
        <p>{message}</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setPage("login");
            setMessage("");
          }}
        >
          Back to Login
        </button>
      </div>
    )}
  </div>
</div>


);
}
