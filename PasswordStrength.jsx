import { PASSWORD_RULES } from "./validators";

const LEVELS = [
  { label: "Too short", color: "#9ca3af" },
  { label: "Very weak", color: "#ef4444" },
  { label: "Weak", color: "#f97316" },
  { label: "Fair", color: "#eab308" },
  { label: "Good", color: "#84cc16" },
  { label: "Strong", color: "#16a34a" },
];

// Task 5.2 - maps password text to a progress bar (0-5 rules satisfied)
export default function PasswordStrength({ password }) {
  const score = password ? PASSWORD_RULES.filter((r) => r.test(password)).length : 0;
  const level = LEVELS[score];
  return (
    <div className="strength" aria-live="polite">
      <div className="strength-track">
        <div
          className="strength-bar"
          style={{ width: `${(score / PASSWORD_RULES.length) * 100}%`, background: level.color }}
        />
      </div>
      <span className="strength-label" style={{ color: level.color }}>
        {password ? level.label : "Enter a password"}
      </span>
      <ul className="rules">
        {PASSWORD_RULES.map((r) => (
          <li key={r.id} className={r.test(password) ? "ok" : ""}>
            {r.test(password) ? "✓" : "○"} {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
