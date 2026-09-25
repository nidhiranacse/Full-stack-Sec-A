import { useState } from "react";

import AccountStep from "./steps/AccountStep";
import ProfileStep from "./steps/ProfileStep";
import ReviewStep from "./steps/ReviewStep";

const STEPS = [
  "Account",
  "Profile Details",
  "Review & Submit",
];

function OnboardingWizard() {
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    account: {
      email: "",
      password: "",
    },

    profile: {
      fullName: "",
      dob: "",
      country: "",
    },
  });

  const updateData = (section, values) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
  };

  const next = () => {
    setStep((current) =>
      Math.min(current + 1, STEPS.length - 1)
    );
  };

  const back = () => {
    setStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const handleFinalSubmit = () => {
    console.log(
      "Final onboarding payload:",
      data
    );

    alert("Onboarding submitted successfully!");
  };

  return (
    <div className="wizard">
      <ol className="wizard-steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? "active"
                : index < step
                ? "done"
                : ""
            }
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <AccountStep
          data={data.account}
          onChange={(values) =>
            updateData("account", values)
          }
          onNext={next}
        />
      )}

      {step === 1 && (
        <ProfileStep
          data={data.profile}
          onChange={(values) =>
            updateData("profile", values)
          }
          onBack={back}
          onNext={next}
        />
      )}

      {step === 2 && (
        <ReviewStep
          data={data}
          onBack={back}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  );
}

export default OnboardingWizard;