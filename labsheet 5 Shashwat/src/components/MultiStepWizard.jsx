import React, { useState } from 'react';
import PasswordStrengthChecker from './PasswordStrengthChecker';

/* ==========================================================
   Child Step Components for Onboarding Wizard
   ========================================================== */

// Step 1: Personal Details
function StepPersonal({ data, onChange, errors }) {
  return (
    <div>
      <h3>Step 1: Personal Details</h3>
      <div className="form-group">
        <label>Full Name:</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Shashwat Saini"
          value={data.name}
          onChange={onChange}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-badge">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Phone Number:</label>
        <input
          type="tel"
          name="phone"
          placeholder="e.g. 9876543210"
          value={data.phone}
          onChange={onChange}
          className={errors.phone ? 'input-error' : ''}
        />
        {errors.phone && <span className="error-badge">{errors.phone}</span>}
      </div>
    </div>
  );
}

// Step 2: Account & Security
function StepAccount({ data, onChange, errors }) {
  return (
    <div>
      <h3>Step 2: Account &amp; Role</h3>
      <div className="form-group">
        <label>Email Address:</label>
        <input
          type="email"
          name="email"
          placeholder="e.g. shashwat@example.com"
          value={data.email}
          onChange={onChange}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error-badge">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={data.password}
          onChange={onChange}
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && <span className="error-badge">{errors.password}</span>}
        <PasswordStrengthChecker password={data.password} />
      </div>

      <div className="form-group">
        <label>Primary Role:</label>
        <select name="role" value={data.role} onChange={onChange}>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
        </select>
      </div>
    </div>
  );
}

// Step 3: Review & Final Submission
function StepReview({ data }) {
  return (
    <div>
      <h3>Step 3: Review Your Data</h3>
      <div className="summary-box">
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Phone:</strong> {data.phone}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Role:</strong> {data.role}</p>
        <p><strong>Password:</strong> •••••••• ({data.password.length} chars)</p>
      </div>
    </div>
  );
}

/* ==========================================================
   Task 5.3: Main Multi-Step Wizard Controller
   Maintains state until submittal routines finalize
   ========================================================== */

function MultiStepWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Full Stack Developer',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Controlled change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step validation before proceeding
  const validateCurrentStep = () => {
    const errs = {};
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Name is required';
      if (!formData.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errs.phone = 'Enter a valid 10-digit phone number';
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = 'Valid email is required';
      }
      if (!formData.password || formData.password.length < 8) {
        errs.password = 'Password must be at least 8 characters';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'Full Stack Developer',
    });
    setStep(1);
    setErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="card">
        <h2>Onboarding Completed!</h2>
        <div className="alert success">
          <strong>Submission Finalized!</strong> All child component states were successfully gathered and submitted.
        </div>
        <pre className="json-preview">{JSON.stringify(formData, null, 2)}</pre>
        <button onClick={handleReset} className="btn btn-primary" style={{ marginTop: '15px' }}>
          Start New Onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>User Onboarding Wizard (Task 5.3)</h2>
      <p className="card-subtitle">
        Multi-step form encapsulating child components and maintaining state.
      </p>

      {/* Step Indicators */}
      <div className="step-indicator">
        <span className={`step-dot ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1. Personal</span>
        <span className={`step-dot ${step === 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2. Account</span>
        <span className={`step-dot ${step === 3 ? 'active' : ''}`}>3. Review</span>
      </div>

      {/* Render Current Step Component */}
      <div className="step-content">
        {step === 1 && <StepPersonal data={formData} onChange={handleChange} errors={errors} />}
        {step === 2 && <StepAccount data={formData} onChange={handleChange} errors={errors} />}
        {step === 3 && <StepReview data={formData} />}
      </div>

      {/* Navigation Buttons */}
      <div className="btn-group wizard-nav">
        {step > 1 && (
          <button type="button" onClick={handleBack} className="btn btn-secondary">
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} className="btn btn-primary">
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default MultiStepWizard;
