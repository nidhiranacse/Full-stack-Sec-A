import { useState } from "react";
import StepAccount from "./steps/StepAccount.jsx";
import StepPersonalInfo from "./steps/StepPersonalInfo.jsx";
import StepFinish from "./steps/StepFinish.jsx";

// Task 5.3 — Multi-step onboarding wizard. The parent owns ALL wizard state;
// children are fully controlled via data + onChange props.
const STEP_LABELS = ["Account", "Personal Info", "Finish"];

const initialFormState = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  course: "",
  city: "",
};

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const updateFormData = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };
  const goNext = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleFinalSubmit = () => {
    setSubmitted(true);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepAccount data={formData} onChange={updateFormData} />;
      case 1:
        return <StepPersonalInfo data={formData} onChange={updateFormData} />;
      case 2:
        return <StepFinish data={formData} submitted={submitted} />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Onboarding Wizard</h2>
      <p className="card-subtitle">Task 5.3 — Parent-owned multi-step state</p>
      <ol className="stepper">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className={i === step ? "step current" : i < step ? "step done" : "step"}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      {renderStep()}
      <div className="wizard-nav">
        {step > 0 && (
          <button className="secondary-btn" onClick={goBack}>Back</button>
        )}
        {step < STEP_LABELS.length - 1 && (
          <button className="primary-btn" onClick={goNext}>Next</button>
        )}
        {step === STEP_LABELS.length - 1 && !submitted && (
          <button className="primary-btn" onClick={handleFinalSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
}
