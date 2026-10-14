// Step 3 — Review everything, then confirm submission.
export default function StepFinish({ data, submitted }) {
  const rows = [
    ["Username", data.username],
    ["Email", data.email],
    ["Full name", data.fullName],
    ["Course", data.course],
    ["City", data.city],
  ];
  return (
    <div>
      <h3>Review your details</h3>
      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div key={label} className="review-row">
            <dt>{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>
      {submitted && (
        <p className="footer-note">Onboarding complete — welcome aboard!</p>
      )}
    </div>
  );
}
