import { useState } from "react";
import "./App.css";
import PasswordStrength from "./components/PasswordStrength";
import OnboardingWizard from "./components/OnboardingWizard";

function App() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    const emailValid = emailPattern.test(email);
    const passwordValid = passwordPattern.test(password);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!emailValid || !passwordValid) {
            setMessage("Please fix the validation errors before logging in.");
            return;
        }

        setMessage("Login validation successful!");
    };
    if (showOnboarding) {
      return (
        <OnboardingWizard
            onBackToLogin={() => setShowOnboarding(false)}
        />
      );
  }
    return (
        <div className="app">
            <div className="login-container">
                <div className="login-info">
                    <span className="tag">React Form Validation</span>
                    <h1>Welcome back.</h1>
                    <p>
                        Login using your account details. The form checks
                        your input in real time using React and regular
                        expressions.
                    </p>

                    <div className="info-item">
                        <span>✓</span>
                        <div>
                            <strong>Controlled Inputs</strong>
                            <small>React manages every input value.</small>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>✓</span>
                        <div>
                            <strong>Live Validation</strong>
                            <small>Errors are displayed while typing.</small>
                        </div>
                    </div>
                </div>

                <div className="login-card">
                    <h2>Sign in</h2>
                    <p className="subtitle">Enter your details to continue</p>

                    <form onSubmit={handleSubmit}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        

                        {email.length > 0 && (
                            <div className={`validation ${emailValid ? "valid" : "invalid"}`}>
                                {emailValid
                                    ? "✓ Valid email address"
                                    : "⚠ Enter a valid email address"}
                            </div>
                        )}

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <PasswordStrength password={password} />

                        {password.length > 0 && (
                            <div className={`validation ${passwordValid ? "valid" : "invalid"}`}>
                                {passwordValid
                                    ? "✓ Strong password format"
                                    : "⚠ Minimum 8 characters with uppercase, lowercase, number and special character"}
                            </div>
                        )}

                        <button type="submit">Login</button>

                        <button
                            type="button"
                            className="onboarding-button"
                            onClick={() => setShowOnboarding(true)}
                        >
                            Create New Account
                        </button>
                    </form>

                    {message && (
                        <div className={`form-message ${message.includes("successful") ? "success" : "error"}`}>
                            {message}
                        </div>
                    )}

                    <p className="demo-text">
                        Task 5.1 • Dynamic Regex Validation
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
