function StepThree({
  formData,
  prevStep,
  handleSubmit,
}) {
  return (
    <div className="wizard-step">

      <div className="step-title">
        <span>03</span>

        <div>
          <h3>Review & Submit</h3>
          <p>Check your information before submitting.</p>
        </div>
      </div>

      <div className="review-grid">

        <div className="review-item">
          <span>👤 Name</span>
          <strong>{formData.name}</strong>
        </div>

        <div className="review-item">
          <span>📧 Email</span>
          <strong>{formData.email}</strong>
        </div>

        <div className="review-item">
          <span>🎂 Age</span>
          <strong>{formData.age}</strong>
        </div>

        <div className="review-item">
          <span>📍 City</span>
          <strong>{formData.city}</strong>
        </div>

      </div>

      <div className="button-row">

        <button
          className="secondary-btn"
          type="button"
          onClick={prevStep}
        >
          ← Back
        </button>

        <button
          className="primary-btn green-btn"
          type="button"
          onClick={handleSubmit}
        >
          ✓ Complete Registration
        </button>

      </div>

    </div>
  );
}

export default StepThree;