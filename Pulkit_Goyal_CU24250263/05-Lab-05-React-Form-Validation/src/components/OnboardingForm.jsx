import React, { useState } from 'react';
import StepOne from './StepOne.jsx';
import StepTwo from './StepTwo.jsx';
import StepThree from './StepThree.jsx';

/**
 * OnboardingForm Component
 * Coordinates step progression, form validation rules, and submission.
 */
export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: 'Pulkit Goyal',
    cuid: 'CU24250263',
    email: 'pulkitgoyal0103@gmail.com',
    phone: '9876543210',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    section: 'A',
    rollNumber: 40,
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!formData.cuid.trim()) newErrors.cuid = 'CUID is required.';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be exactly 10 digits.';
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (step === 3) {
      if (!formData.rollNumber) newErrors.rollNumber = 'Roll number is required.';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must accept the terms before submitting.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
        <h3 style={{ color: '#10b981', margin: '0 0 8px' }}>Registration Completed Successfully!</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Welcome aboard, <strong>{formData.fullName}</strong> ({formData.cuid})!
        </p>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Roll Number: {formData.rollNumber} &bull; Section: {formData.section}
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setCurrentStep(1);
          }}
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
        >
          Reset Onboarding Wizard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper Breadcrumbs */}
      <div className="stepper">
        {[
          { num: 1, label: 'Profile' },
          { num: 2, label: 'Security' },
          { num: 3, label: 'Review' }
        ].map((s) => (
          <div
            key={s.num}
            className={`step-node ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}`}
          >
            <div className="step-circle">{currentStep > s.num ? '✓' : s.num}</div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <StepOne formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 2 && (
          <StepTwo formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 3 && (
          <StepThree formData={formData} errors={errors} onChange={handleChange} />
        )}

        <div className="wizard-footer">
          {currentStep > 1 ? (
            <button type="button" onClick={handlePrev} className="btn btn-secondary">
              &larr; Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button type="button" onClick={handleNext} className="btn btn-primary">
              Next Step &rarr;
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" style={{ background: '#10b981' }}>
              Submit Onboarding
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
