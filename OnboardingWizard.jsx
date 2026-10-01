import { useState } from "react";
import PasswordStrength from "./PasswordStrength";
import {
  validateEmail, validatePassword, USERNAME_RE, PHONE_RE,
} from "./validators";

// ---- child step components (state lives in the parent wizard) ----
function AccountStep({ data, onChange, errors }) {
  return (
    <>
      <Field label="Username" name="username" value={data.username} onChange={onChange} error={errors.username} />
      <Field label="Email" name="email" type="email" value={data.email} onChange={onChange} error={errors.email} />
      <Field label="Password" name="password" type="password" value={data.password} onChange={onChange} error={errors.password} />
      <PasswordStrength password={data.password} />
    </>
  );
}

function ProfileStep({ data, onChange, errors }) {
  return (
    <>
      <Field label="Full name" name="fullName" value={data.fullName} onChange={onChange} error={errors.fullName} />
      <Field label="Mobile (10 digits)" name="phone" value={data.phone} onChange={onChange} error={errors.phone} />
      <label htmlFor="course">Course</label>
      <select id="course" name="course" value={data.course} onChange={onChange}>
        <option>B.Tech CSE</option><option>B.Tech IT</option><option>BCA</option><option>MCA</option>
      </select>
    </>
  );
}

function ReviewStep({ data }) {
  const rows = [
    ["Username", data.username], ["Email", data.email], ["Name", data.fullName],
    ["Mobile", data.phone], ["Course", data.course], ["Password", "•".repeat(data.password.length)],
  ];
  return (
    <table className="review">
      <tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody>
    </table>
  );
}

function Field({ label, name, type = "text", value, onChange, error }) {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange}
        className={error ? "invalid" : ""} />
      {error && <span className="badge error">⚠ {error}</span>}
    </>
  );
}

const INITIAL = { username: "", email: "", password: "", fullName: "", phone: "", course: "B.Tech CSE" };
const STEPS = ["Account", "Profile", "Review"];

function validateStep(step, d) {
  const e = {};
  if (step === 0) {
    if (!USERNAME_RE.test(d.username)) e.username = "4-16 chars, start with a letter; letters, digits, _ only";
    e.email = validateEmail(d.email);
    e.password = validatePassword(d.password);
  }
  if (step === 1) {
    if (d.fullName.trim().length < 3) e.fullName = "Enter your full name";
    if (!PHONE_RE.test(d.phone)) e.phone = "Enter a valid 10-digit mobile number";
  }
  Object.keys(e).forEach((k) => !e[k] && delete e[k]);
  return e;
}

// Task 5.3 - multi-step wizard; data persists across steps until final submit
export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const next = () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (!Object.keys(e).length) setStep(step + 1);
  };
  const back = () => setStep(step - 1);
  const submit = () => setDone(true);
  const reset = () => { setData(INITIAL); setStep(0); setDone(false); };

  if (done) {
    return (
      <div className="card">
        <h2>🎉 Onboarding complete</h2>
        <p>Welcome, {data.fullName}! Submitted payload:</p>
        <pre>{JSON.stringify({ ...data, password: "***" }, null, 2)}</pre>
        <button onClick={reset}>Start over</button>
      </div>
    );
  }

  return (
    <div className="card">
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "active" : i < step ? "done" : ""}>{i + 1}. {s}</li>
        ))}
      </ol>
      {step === 0 && <AccountStep data={data} onChange={onChange} errors={errors} />}
      {step === 1 && <ProfileStep data={data} onChange={onChange} errors={errors} />}
      {step === 2 && <ReviewStep data={data} />}
      <div className="nav">
        {step > 0 && <button type="button" className="secondary" onClick={back}>Back</button>}
        {step < 2 ? <button type="button" onClick={next}>Next</button>
                  : <button type="button" onClick={submit}>Submit</button>}
      </div>
    </div>
  );
}
