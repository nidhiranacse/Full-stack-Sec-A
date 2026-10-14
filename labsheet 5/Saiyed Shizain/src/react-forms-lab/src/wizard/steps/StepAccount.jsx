// Step 1 — Account credentials. Controlled child: no local state.
export default function StepAccount({ data, onChange }) {
  const handle = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div>
      <div className="field-group">
        <label className="field-label" htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          className="field-input"
          placeholder="e.g. saiyed_s"
          value={data.username}
          onChange={handle}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="onboard-email">Email address</label>
        <input
          id="onboard-email"
          name="email"
          className="field-input"
          placeholder="you@example.com"
          value={data.email}
          onChange={handle}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="onboard-password">Password</label>
        <input
          id="onboard-password"
          name="password"
          type="password"
          className="field-input"
          placeholder="Create a password"
          value={data.password}
          onChange={handle}
        />
      </div>
    </div>
  );
}
