import { useState } from "react";
import PasswordStrengthChecker from "./PasswordStrengthChecker.jsx";

// Parent owning the password state, passed down to the reusable checker.
export default function PasswordStrengthDemo() {
  const [password, setPassword] = useState("");
  return (
    <div className="card">
      <h2 className="card-title">Create a new password</h2>
      <p className="card-subtitle">Task 5.2 — Reusable Password Strength Sub-Component</p>
      <div className="field-group">
        <label className="field-label" htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          className="field-input"
          placeholder="Type to test strength..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <PasswordStrengthChecker password={password} showRules />
      <button className="primary-btn" style={{ marginTop: 24 }}>
        Set Password
      </button>
    </div>
  );
}
