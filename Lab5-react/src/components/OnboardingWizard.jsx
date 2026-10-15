import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
  });

  const updateData = (data) => {
    setFormData((previous) => ({
      ...previous,
      ...data,
    }));
  };

  const nextStep = () => {
    setStep((previous) => previous + 1);
  };

  const prevStep = () => {
    setStep((previous) => previous - 1);
  };

  const handleSubmit = () => {
    alert("🎉 Onboarding completed successfully!");

    console.log("Final User Data:", formData);
  };

  return (
    <section className="form-card onboarding-card">

      <div className="card-heading">
        <div className="heading-icon green-icon">👤</div>

        <div>
          <h2>Task 5.3 — User Onboarding Wizard</h2>
          <div className="heading-line green-line"></div>
        </div>
      </div>

      {/* Step Progress */}

      <div className="step-progress">

        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Personal Details</span>
        </div>

        <div className={`step-line ${step >= 2 ? "active-line" : ""}`}></div>

        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Additional Details</span>
        </div>

        <div className={`step-line ${step >= 3 ? "active-line" : ""}`}></div>

        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Review & Submit</span>
        </div>

      </div>

      <div className="wizard-content">

        {step === 1 && (
          <StepOne
            formData={formData}
            updateData={updateData}
            nextStep={nextStep}
          />
        )}

        {step === 2 && (
          <StepTwo
            formData={formData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 3 && (
          <StepThree
            formData={formData}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        )}

      </div>

    </section>
  );
}

export default OnboardingWizard;