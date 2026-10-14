import { useMemo } from "react";

// Task 5.2 — Reusable password strength checker: maps input variations to
// a dynamic progress bar. Receives `password` via props for reuse anywhere.
const STRENGTH_LEVELS = [
  { label: "Very Weak", color: "#ff5b6e", width: "20%" },
  { label: "Weak", color: "#ff8c42", width: "40%" },
  { label: "Fair", color: "#f5b642", width: "60%" },
  { label: "Good", color: "#4f8bff", width: "80%" },
  { label: "Strong", color: "#2ecf7d", width: "100%" },
];

function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  const rules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#^()_\-+=]/.test(password),
  };
  Object.values(rules).forEach((met) => met && score++);
  if (password.length >= 12) score++;
  return { score: Math.min(score, 5), rules };
}

export default function PasswordStrengthChecker({ password, showRules = true }) {
  const { score, rules } = useMemo(() => {
    const result = scorePassword(password);
    return result === 0 ? { score: 0, rules: {} } : result;
  }, [password]);
  const levelIndex = Math.max(score - 1, 0);
  const level = password ? STRENGTH_LEVELS[levelIndex] : null;
  return (
    <div className="strength-checker">
      <div className="strength-bar-track">
        <div
          className="strength-bar-fill"
          style={{
            width: level ? level.width : "0%",
            background: level ? level.color : "transparent",
          }}
        />
      </div>
      <div className="strength-label-row">
        <span className="strength-label" style={{ color: level ? level.color : "#6b7280" }}>
          {level ? level.label : "Enter a password"}
        </span>
        <span>{password ? `${password.length} chars` : ""}</span>
      </div>
      {showRules && password && (
        <div className="strength-rules">
          <div className={`strength-rule ${rules.length ? "met" : ""}`}>
            <span className="rule-dot" /> Minimum 8 characters
          </div>
          <div className={`strength-rule ${rules.uppercase ? "met" : ""}`}>
            <span className="rule-dot" /> Uppercase letter
          </div>
          <div className={`strength-rule ${rules.lowercase ? "met" : ""}`}>
            <span className="rule-dot" /> Lowercase letter
          </div>
          <div className={`strength-rule ${rules.number ? "met" : ""}`}>
            <span className="rule-dot" /> Number
          </div>
          <div className={`strength-rule ${rules.special ? "met" : ""}`}>
            <span className="rule-dot" /> Special character
          </div>
        </div>
      )}
    </div>
  );
}
