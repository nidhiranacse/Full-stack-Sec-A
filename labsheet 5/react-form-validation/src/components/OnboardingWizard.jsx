import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function OnboardingWizard({ onBackToLogin }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");

    const updateField = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const nextStep = () => {
        setMessage("");

        if (step === 1) {
            if (!formData.name || !formData.dob || !formData.phone) {
                setMessage("Please fill all personal information.");
                return;
            }
        }

        if (step === 2) {
            if (!formData.email || !formData.password || !formData.confirmPassword) {
                setMessage("Please fill all account details.");
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setMessage("Passwords do not match.");
                return;
            }

            if (formData.password.length < 8) {
                setMessage("Password must contain at least 8 characters.");
                return;
            }
        }

        setStep(step + 1);
    };

    const previousStep = () => {
        setMessage("");
        setStep(step - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("Onboarding completed successfully!");
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <span className="tag">React Form Validation</span>
                    <h1>Create your account</h1>
                    <p>Complete the following steps to create your account.</p>
                </div>

                <div className="step-indicator">
                    <div className={step >= 1 ? "step active" : "step"}>1</div>
                    <span></span>
                    <div className={step >= 2 ? "step active" : "step"}>2</div>
                    <span></span>
                    <div className={step >= 3 ? "step active" : "step"}>3</div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="wizard-section">
                            <h2>Personal Information</h2>
                            <p className="wizard-subtitle">
                                Tell us a little about yourself.
                            </p>

                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={updateField}
                            />

                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={updateField}
                            />

                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={updateField}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="wizard-section">
                            <h2>Account Details</h2>
                            <p className="wizard-subtitle">
                                Create your login credentials.
                            </p>

                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={updateField}
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={updateField}
                            />

                            <PasswordStrength password={formData.password} />

                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={updateField}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="wizard-section">
                            <h2>Confirm Details</h2>
                            <p className="wizard-subtitle">
                                Check your information before submitting.
                            </p>

                            <div className="summary-box">
                                <div>
                                    <strong>Full Name</strong>
                                    <span>{formData.name}</span>
                                </div>

                                <div>
                                    <strong>Date of Birth</strong>
                                    <span>{formData.dob}</span>
                                </div>

                                <div>
                                    <strong>Phone</strong>
                                    <span>{formData.phone}</span>
                                </div>

                                <div>
                                    <strong>Email</strong>
                                    <span>{formData.email}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`wizard-message ${message.includes("successfully") ? "success" : "error"}`}>
                            {message}
                        </div>
                    )}

                    <div className="wizard-buttons">
                        {step > 1 && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={previousStep}
                            >
                                Previous
                            </button>
                        )}

                        {step < 3 ? (
                            <button type="button" onClick={nextStep}>
                                Next
                            </button>
                        ) : (
                            <button type="submit">Submit Registration</button>
                        )}
                    </div>
                </form>

                <button
                    type="button"
                    className="back-login"
                    onClick={onBackToLogin}
                >
                    ← Back to Login
                </button>

                <p className="demo-text">
                    Task 5.3 • Multi-Step User Onboarding Form
                </p>
            </div>
        </div>
    );
}

export default OnboardingWizard;