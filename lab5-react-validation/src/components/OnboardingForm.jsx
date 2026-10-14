import { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import AccountInfo from "./AccountInfo";
import ReviewInfo from "./ReviewInfo";

function OnboardingForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    email: "",
    password: "",
    phone: ""
  });

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value
    }));

    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name.trim() ||
        !formData.age ||
        !formData.city.trim()
      ) {
        setError("Please complete all personal information.");
        return false;
      }
    }

    if (step === 2) {
      if (
        !formData.email.trim() ||
        !formData.password ||
        !formData.phone.trim()
      ) {
        setError("Please complete all account information.");
        return false;
      }

      if (formData.password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((previousStep) => previousStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep((previousStep) => previousStep - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    console.log("Submitted Onboarding Data:", formData);
  };

  if (submitted) {
    return (
      <div className="success-screen">
        <h2>Registration Successful!</h2>

        <p>
          Your onboarding form has been submitted successfully.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setFormData({
              name: "",
              age: "",
              city: "",
              email: "",
              password: "",
              phone: ""
            });
          }}
        >
          Start Again
        </button>
      </div>
    );
  }

  return (
    <div className="onboarding-card">

      <h1>User Onboarding</h1>

      <div className="step-indicator">
        <span className={step >= 1 ? "active" : ""}>
          1
        </span>

        <span className={step >= 2 ? "active" : ""}>
          2
        </span>

        <span className={step >= 3 ? "active" : ""}>
          3
        </span>
      </div>

      <form onSubmit={handleSubmit}>

        {step === 1 && (
          <PersonalInfo
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        {step === 2 && (
          <AccountInfo
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        {step === 3 && (
          <ReviewInfo
            formData={formData}
          />
        )}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <div className="navigation-buttons">

          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="back-button"
            >
              Back
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="next-button"
            >
              Next
            </button>
          )}

          {step === 3 && (
            <button
              type="submit"
              className="submit-button"
            >
              Submit
            </button>
          )}

        </div>

      </form>

    </div>
  );
}

export default OnboardingForm;