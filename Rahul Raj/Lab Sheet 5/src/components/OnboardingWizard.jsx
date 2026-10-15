import React, { useState } from 'react';
import Step1Account from './steps/Step1Account.jsx';
import Step2Profile from './steps/Step2Profile.jsx';
import Step3Preferences from './steps/Step3Preferences.jsx';
import Step4Summary from './steps/Step4Summary.jsx';

/**
 * OnboardingWizard Component
 * Task 5.3: Multi-step user onboarding form flow wizard encapsulating child step components
 * and maintaining unified state data until submittal routines finalize.
 */
export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Master Encapsulated State across all child steps
  const [formData, setFormData] = useState({
    // Step 1
    email: '',
    username: '',
    password: '',
    // Step 2
    fullName: '',
    role: 'Full Stack Web Engineer',
    bio: '',
    // Step 3
    preferredStack: 'React + Django Full Stack',
    editor: 'Visual Studio Code',
    enableTelemetry: true,
    agreeTerms: false,
  });

  const [stepErrors, setStepErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * Validate current step requirements before moving forward
   */
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const userRegex = /^[a-zA-Z0-9_]{3,20}$/;

      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        errors.email = 'Valid email address is required (e.g. name@domain.com).';
      }
      if (!formData.username.trim() || !userRegex.test(formData.username.trim())) {
        errors.username = 'Username must be 3-20 alphanumeric characters or underscores.';
      }
      if (!formData.password || formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters with mixed criteria.';
      }
    }

    if (step === 2) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        errors.fullName = 'Please enter your legal full name (at least 2 characters).';
      }
    }

    if (step === 3) {
      if (!formData.agreeTerms) {
        errors.agreeTerms = 'You must review and agree to ethics & compliance policies to finalize.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handlePrev = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    // Submittal routine
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const stepsLabels = [
    'Account & Auth',
    'Profile Details',
    'Preferences',
    'Summary & Submit',
  ];

  return (
    <div className="wizard-container-card">
      <div className="wizard-header-section">
        <div className="wizard-tag">Task 5.3 &bull; Encapsulated State Flow Wizard</div>
        <h2 className="wizard-title">Developer Onboarding Wizard</h2>
        <p className="wizard-sub">
          Step-by-step onboarding pipeline that encapsulates child components and preserves state across all stages until final submittal.
        </p>

        {/* Step Milestones Progress Bar */}
        <div className="wizard-stepper" role="tablist" aria-label="Onboarding Steps">
          {stepsLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep || isSubmitted;
            const isActive = stepNum === currentStep && !isSubmitted;

            return (
              <div
                key={label}
                className={`step-milestone ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
              >
                <div className="milestone-indicator">
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className="milestone-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Current Encapsulated Child Step */}
      <div className="wizard-body-card">
        {isSubmitted ? (
          <div className="onboarding-final-success" role="status">
            <div className="final-icon-badge">🎉</div>
            <h3 className="final-title">Onboarding Pipeline Finalized!</h3>
            <p className="final-desc">
              All multi-step states have been consolidated and officially submitted to the developer registry.
            </p>

            <div className="final-details-box">
              <div className="final-row">
                <span>Account Handle:</span>
                <strong>@{formData.username}</strong>
              </div>
              <div className="final-row">
                <span>Engineer:</span>
                <strong>{formData.fullName} ({formData.role})</strong>
              </div>
              <div className="final-row">
                <span>Primary Ecosystem:</span>
                <strong>{formData.preferredStack}</strong>
              </div>
              <div className="final-row">
                <span>Submittal Timestamp:</span>
                <code>{new Date().toLocaleString()}</code>
              </div>
            </div>

            <button
              type="button"
              className="btn-restart-wizard"
              onClick={() => {
                setFormData({
                  email: '',
                  username: '',
                  password: '',
                  fullName: '',
                  role: 'Full Stack Web Engineer',
                  bio: '',
                  preferredStack: 'React + Django Full Stack',
                  editor: 'Visual Studio Code',
                  enableTelemetry: true,
                  agreeTerms: false,
                });
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
            >
              Start New Onboarding Session &rarr;
            </button>
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <Step1Account
                data={formData}
                updateData={updateFormData}
                errors={stepErrors}
              />
            )}

            {currentStep === 2 && (
              <Step2Profile
                data={formData}
                updateData={updateFormData}
                errors={stepErrors}
              />
            )}

            {currentStep === 3 && (
              <Step3Preferences
                data={formData}
                updateData={updateFormData}
                errors={stepErrors}
              />
            )}

            {currentStep === 4 && (
              <Step4Summary
                data={formData}
                onEditStep={(step) => setCurrentStep(step)}
              />
            )}

            {/* Navigation Action Buttons */}
            <div className="wizard-actions-footer">
              <button
                type="button"
                className="btn-wizard-prev"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
              >
                &larr; Previous Step
              </button>

              <div className="step-counter-label">
                Step {currentStep} of {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="btn-wizard-next"
                  onClick={handleNext}
                >
                  Continue to Next Step &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-wizard-submit"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Finalizing Submittal Routine...' : 'Finalize & Submit Registration ✓'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
