function StepOne({ formData, updateData, nextStep }) {
  const handleNext = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in your name and email.");
      return;
    }

    nextStep();
  };

  return (
    <div className="wizard-step">

      <div className="step-title">
        <span>01</span>
        <div>
          <h3>Personal Details</h3>
          <p>Tell us a little about yourself.</p>
        </div>
      </div>

      <div className="input-grid">

        <div className="input-group">
          <label>👤 Full Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) =>
              updateData({ name: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>📧 Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              updateData({ email: e.target.value })
            }
          />
        </div>

      </div>

      <button
        className="primary-btn green-btn"
        type="button"
        onClick={handleNext}
      >
        Continue →
      </button>

    </div>
  );
}

export default StepOne;