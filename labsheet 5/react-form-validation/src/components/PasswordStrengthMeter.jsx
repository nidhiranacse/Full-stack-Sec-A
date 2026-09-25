function getStrength(password) {
  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[!@#$%^&*]/.test(password)) {
    score++;
  }

  return score;
}

const LEVELS = [
  {
    label: "Weak",
    color: "#ef4444",
    min: 0,
  },
  {
    label: "Fair",
    color: "#f59e0b",
    min: 2,
  },
  {
    label: "Good",
    color: "#3b82f6",
    min: 3,
  },
  {
    label: "Strong",
    color: "#22c55e",
    min: 4,
  },
];

function PasswordStrengthMeter({ password }) {
  const score = getStrength(password);

  const level = [...LEVELS]
    .reverse()
    .find((item) => score >= item.min);

  const widthPct = (score / 4) * 100;

  return (
    <div className="strength-meter">
      <div className="strength-track">
        <div
          className="strength-fill"
          style={{
            width: `${widthPct}%`,
            backgroundColor: level.color,
          }}
        />
      </div>

      <span style={{ color: level.color }}>
        {password ? level.label : ""}
      </span>
    </div>
  );
}

export default PasswordStrengthMeter;