import { useState } from "react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

function AccountStep({ data, onChange, onNext }) {
  const [error, setError] = useState("");

  const handle = (e) => {
    onChange({
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleNext = () => {
    if (!data.email || !data.password) {
      setError("Please fill in all fields.");
      return;
    }

    onNext();
  };

  return (
    <div className="wizard-card">
      <h2>Account Details</h2>

      <label>Email</label>

      <input
        name="email"
        type="email"
        value={data.email}
        onChange={handle}
        placeholder="Enter email"
      />

      <label>Password</label>

      <input
        name="password"
        type="password"
        value={data.password}
        onChange={handle}
        placeholder="Enter password"
      />

      <PasswordStrengthMeter
        password={data.password}
      />

      {error && (
        <p className="error-message">{error}</p>
      )}

      <div className="wizard-nav">
        <button
          type="button"
          onClick={handleNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default AccountStep;