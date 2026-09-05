import { useState } from "react";

function OnboardingWizard() {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        city: "",
        occupation: ""
    });

    const updateData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    const previousStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        alert(
            `Welcome ${formData.name}! Your onboarding is complete.`
        );

        console.log("Submitted Data:", formData);
    };

    return (
        <div className="form-card">
            <h2>User Onboarding</h2>

            <p className="step-indicator">
                Step {step} of 3
            </p>

            <form onSubmit={handleSubmit}>

                {step === 1 && (
                    <div>
                        <h3>Personal Information</h3>

                        <label>Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={updateData}
                            placeholder="Enter your name"
                        />

                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={updateData}
                            placeholder="Enter your email"
                        />
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3>Additional Information</h3>

                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={updateData}
                            placeholder="Enter your age"
                        />

                        <label>City</label>
                        <input
                            name="city"
                            value={formData.city}
                            onChange={updateData}
                            placeholder="Enter your city"
                        />
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h3>Professional Information</h3>

                        <label>Occupation</label>
                        <input
                            name="occupation"
                            value={formData.occupation}
                            onChange={updateData}
                            placeholder="Enter your occupation"
                        />

                        <div className="summary">
                            <h4>Review Information</h4>

                            <p>
                                <strong>Name:</strong>{" "}
                                {formData.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {formData.email}
                            </p>

                            <p>
                                <strong>Age:</strong>{" "}
                                {formData.age}
                            </p>

                            <p>
                                <strong>City:</strong>{" "}
                                {formData.city}
                            </p>

                            <p>
                                <strong>Occupation:</strong>{" "}
                                {formData.occupation}
                            </p>
                        </div>
                    </div>
                )}

                <div className="button-group">

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