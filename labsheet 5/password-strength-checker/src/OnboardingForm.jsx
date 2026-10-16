import { useState } from "react";

// Step 1 Child Component
function PersonalInfo({ formData, handleChange, nextStep }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!formData.name || !formData.email) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    nextStep();
  };

  return (
    <div>
      <h3>Step 1: Personal Information</h3>

      <input
        name="name"
        placeholder="Enter Full Name"
        value={formData.name}
        onChange={handleChange}
      />

      <input
        name="email"
        type="email"
        placeholder="Enter Email Address"
        value={formData.email}
        onChange={handleChange}
      />

      {error && <p className="error-badge">❌ {error}</p>}

      <button type="button" onClick={handleNext}>
        Next →
      </button>
    </div>
  );
}

// Step 2 Child Component
function AccountInfo({
  formData,
  handleChange,
  nextStep,
  previousStep,
}) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    nextStep();
  };

  return (
    <div>
      <h3>Step 2: Account Information</h3>

      <input
        name="password"
        type="password"
        placeholder="Enter Password"
        value={formData.password}
        onChange={handleChange}
      />

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      {error && <p className="error-badge">❌ {error}</p>}

      <div className="button-group">
        <button type="button" onClick={previousStep}>
          ← Back
        </button>

        <button type="button" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

// Step 3 Child Component
function Confirmation({ formData, previousStep, handleSubmit }) {
  return (
    <div>
      <h3>Step 3: Confirmation</h3>

      <div className="confirmation">
        <p>
          <strong>Full Name:</strong> {formData.name}
        </p>

        <p>
          <strong>Email:</strong> {formData.email}
        </p>

        <p>
          <strong>Password:</strong> ********
        </p>
      </div>

      <div className="button-group">
        <button type="button" onClick={previousStep}>
          ← Back
        </button>

        <button type="button" onClick={handleSubmit}>
          Submit ✓
        </button>
      </div>
    </div>
  );
}

// Parent Component
function OnboardingForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const previousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Registration completed successfully!");
  };

  return (
    <div className="card">
      <h2>Task 5.3 - User Onboarding Form</h2>

      <div className="step-indicator">
        Step {step} of 3
      </div>

      {step === 1 && (
        <PersonalInfo
          formData={formData}
          handleChange={handleChange}
          nextStep={nextStep}
        />
      )}

      {step === 2 && (
        <AccountInfo
          formData={formData}
          handleChange={handleChange}
          nextStep={nextStep}
          previousStep={previousStep}
        />
      )}

      {step === 3 && (
        <Confirmation
          formData={formData}
          previousStep={previousStep}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default OnboardingForm;