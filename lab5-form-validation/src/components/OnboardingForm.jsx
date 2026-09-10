import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

function OnboardingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "", age: "", email: "", password: "",
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

    const handleSubmit = () => {

        console.log("Final Form Data:", formData);
        alert("Onboarding completed successfully!");

        setStep(1);
        setFormData({
            name: "", age: "", email: "", password: "",
        });
    };

    return (
        <div className="form-container">
            <h2>User Onboarding</h2>

            {step === 1 && (
                <StepOne
                    formData={formData}
                    setFormData={setFormData}
                />
            )}

            {step === 2 && (
                <StepTwo
                    formData={formData}
                    setFormData={setFormData}
                />
            )}

            {step === 3 && (
                <StepThree
                    formData={formData}
                />
            )}

            <div className="navigation-buttons">

                {step > 1 && (
                    <button onClick={previousStep}> Previous </button>
                )}
                {step < 3 && (
                    <button onClick={nextStep}> Next </button>
                )}
                {step === 3 && (
                    <button onClick={handleSubmit}> Submit</button>
                )}
            </div>
        </div>
    );
}

export default OnboardingForm;