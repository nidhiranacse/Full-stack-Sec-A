function ProfileStep({
  data,
  onChange,
  onBack,
  onNext,
}) {
  const handle = (e) => {
    onChange({
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="wizard-card">
      <h2>Profile Details</h2>

      <label>Full Name</label>

      <input
        name="fullName"
        value={data.fullName}
        onChange={handle}
        placeholder="Enter full name"
      />

      <label>Date of Birth</label>

      <input
        name="dob"
        type="date"
        value={data.dob}
        onChange={handle}
      />

      <label>Country</label>

      <input
        name="country"
        value={data.country}
        onChange={handle}
        placeholder="Enter country"
      />

      <div className="wizard-nav">
        <button
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            !data.fullName ||
            !data.dob ||
            !data.country
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default ProfileStep;