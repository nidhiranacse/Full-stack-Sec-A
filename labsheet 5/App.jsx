import { useState } from 'react';
import './App.css';

// ==========================================
// TASK 5.2: PASSWORD STRENGTH SUB-COMPONENT
// ==========================================
const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[a-z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = calculateStrength(password);
  
  // Dynamic color mapping based on security strength
  const getProgressColor = () => {
    if (strengthScore <= 25) return 'var(--danger-red)';
    if (strengthScore <= 50) return '#ea580c'; // Orange
    if (strengthScore <= 75) return 'var(--accent-yellow)';
    return '#22c55e'; // Green
  };

  return (
    <div className="strength-meter-container">
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${strengthScore}%`, 
            backgroundColor: getProgressColor() 
          }} 
        />
      </div>
      <small className="strength-label">
        Security Strength: {strengthScore}%
      </small>
    </div>
  );
};

// ==========================================
// TASK 5.3: MULTI-STEP ONBOARDING WIZARD
// ==========================================
export default function OnboardingWizard() {
  // Wizard Phase State
  const [currentStep, setCurrentStep] = useState(1);
  
  // Controlled Component Data State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    techStack: 'Python, React, JavaScript' // Defaulting to profile skills
  });

  // Validation State
  const [emailError, setEmailError] = useState('');

  // ==========================================
  // TASK 5.1: DYNAMIC REGEX VERIFICATION
  // ==========================================
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));

    // Standard RFC-2822 Email Regex Pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (value.length > 0 && !emailRegex.test(value)) {
      setEmailError('CRITICAL: Invalid email syntax detected.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleStackChange = (e) => {
    setFormData((prev) => ({ ...prev, techStack: e.target.value }));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    alert(`PAYLOAD COMPILED SUCCESSFULLY:\n\nEmail: ${formData.email}\nStack: ${formData.techStack}`);
    // In a real application, you would fire an API POST request here
  };

  return (
    <div className="wizard-layout">
      <div className="wizard-card">
        
        <header className="wizard-header">
          <h2>Auth Setup <span className="highlight">// Phase {currentStep}</span></h2>
          <p className="subtitle">Secure Controlled Form Architecture</p>
        </header>

        {/* --- PHASE 1: LOGIN CREDENTIALS --- */}
        {currentStep === 1 && (
          <div className="step-container fade-in">
            <div className="input-group">
              <label>Network Identity (Email)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={handleEmailChange}
                placeholder="developer@domain.com"
                className={emailError ? 'input-error' : ''}
              />
              {/* Task 5.1 Interactive Error Badge */}
              {emailError && <div className="error-badge">{emailError}</div>}
            </div>

            <div className="input-group">
              <label>Encryption Key (Password)</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={handlePasswordChange}
                placeholder="Enter highly secure password"
              />
              {/* Task 5.2 Dynamic Progress Tracker */}
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setCurrentStep(2)}
              disabled={!!emailError || !formData.email || !formData.password}
            >
              Initialize Phase 2 &rarr;
            </button>
          </div>
        )}

        {/* --- PHASE 2: PROFILE DETAILS --- */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmit} className="step-container fade-in">
            <div className="input-group">
              <label>Primary Tech Stack</label>
              <textarea 
                rows="4"
                value={formData.techStack} 
                onChange={handleStackChange}
                className="monospaced"
              />
            </div>

            <div className="action-row">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setCurrentStep(1)}
              >
                &larr; Revert
              </button>
              <button 
                type="submit" 
                className="btn-primary"
              >
                Transmit Payload
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}