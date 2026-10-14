// Step 2 — Personal information. Controlled child like Step 1.
export default function StepPersonalInfo({ data, onChange }) {
  const handle = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div>
      <div className="field-group">
        <label className="field-label" htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          className="field-input"
          placeholder="e.g. Saiyed Shizain"
          value={data.fullName}
          onChange={handle}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="course">Course / Program</label>
        <input
          id="course"
          name="course"
          className="field-input"
          placeholder="e.g. BTech CSE"
          value={data.course}
          onChange={handle}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          className="field-input"
          placeholder="e.g. New Delhi"
          value={data.city}
          onChange={handle}
        />
      </div>
    </div>
  );
}
