function ReviewStep({
  data,
  onBack,
  onSubmit,
}) {
  return (
    <div className="wizard-card">
      <h2>Review & Submit</h2>

      <div className="review-section">
        <h3>Account</h3>

        <p>
          <strong>Email:</strong>{" "}
          {data.account.email}
        </p>

        <p>
          <strong>Password:</strong>{" "}
          ••••••••
        </p>
      </div>

      <div className="review-section">
        <h3>Profile</h3>

        <p>
          <strong>Full Name:</strong>{" "}
          {data.profile.fullName}
        </p>

        <p>
          <strong>Date of Birth:</strong>{" "}
          {data.profile.dob}
        </p>

        <p>
          <strong>Country:</strong>{" "}
          {data.profile.country}
        </p>
      </div>

      <div className="wizard-nav">
        <button
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default ReviewStep;