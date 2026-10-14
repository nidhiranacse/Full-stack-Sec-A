import { useState } from "react";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    city: "",
    role: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Final onboarding data:", data);

    alert("Onboarding completed successfully!");
  };

  return (
    <div className="form-card">
      <div className="steps">
        <span className={step >= 1 ? "active-step" : ""}>
          1
        </span>

        <span className={step >= 2 ? "active-step" : ""}>
          2
        </span>

        <span className={step >= 3 ? "active-step" : ""}>
          3
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <StepOne
            data={data}
            setData={setData}
          />
        )}

        {step === 2 && (
          <StepTwo
            data={data}
            setData={setData}
          />
        )}

        {step === 3 && (
          <StepThree
            data={data}
            setData={setData}
          />
        )}

        <div className="wizard-buttons">
          {step > 1 && (
            <button
              type="button"
              onClick={previousStep}
            >
              Previous
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={nextStep}
            >
              Next
            </button>
          )}

          {step === 3 && (
            <button type="submit">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default OnboardingWizard;