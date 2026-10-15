function StepTwo({
  formData,
  updateData,
  nextStep,
  prevStep,
}) {
  const handleNext = () => {
    if (!formData.age || !formData.city) {
      alert("Please fill in your age and city.");
      return;
    }

    nextStep();
  };

  return (
    <div className="wizard-step">

      <div className="step-title">
        <span>02</span>

        <div>
          <h3>Additional Details</h3>
          <p>Complete your profile information.</p>
        </div>
      </div>

      <div className="input-grid">

        <div className="input-group">
          <label>🎂 Age</label>

          <input
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) =>
              updateData({ age: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>📍 City</label>

          <input
            type="text"
            placeholder="Enter your city"
            value={formData.city}
            onChange={(e) =>
              updateData({ city: e.target.value })
            }
          />
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
          onClick={handleNext}
        >
          Continue →
        </button>

      </div>

    </div>
  );
}

export default StepTwo;