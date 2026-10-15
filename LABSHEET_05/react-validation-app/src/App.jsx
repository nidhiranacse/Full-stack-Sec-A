import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    key: "upper",
    label: "One uppercase letter",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    key: "lower",
    label: "One lowercase letter",
    test: (v) => /[a-z]/.test(v),
  },
  {
    key: "number",
    label: "One digit",
    test: (v) => /[0-9]/.test(v),
  },
  {
    key: "special",
    label: "One special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

function evaluatePassword(pw) {
  const results = RULES.map((r) => ({
    ...r,
    pass: r.test(pw),
  }));

  const score = results.filter((r) => r.pass).length;

  return { results, score };
}

/* ---------------- Task 5.2 ---------------- */

function ClearanceMeter({ password }) {
  const { score } = useMemo(
    () => evaluatePassword(password),
    [password]
  );

  const levels = [
    { label: "NO INPUT", color: "#26314A" },
    { label: "RESTRICTED", color: "#F0576A" },
    { label: "LOW", color: "#F0576A" },
    { label: "STANDARD", color: "#F5A524" },
    { label: "ELEVATED", color: "#F5A524" },
    { label: "MAXIMUM", color: "#2DD4BF" },
  ];

  const current =
    password.length === 0 ? levels[0] : levels[score];

  return (
    <div className="clearance-wrap">
      <div className="clearance-row">
        <span className="clearance-label">
          Clearance strength
        </span>

        <span
          className="clearance-level"
          style={{ color: current.color }}
        >
          {current.label}
        </span>
      </div>

      <div className="clearance-track">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={
              "clearance-seg" +
              (i < score ? " filled" : "")
            }
            style={{
              background:
                i < score ? current.color : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Task 5.1 ---------------- */

function LoginConsole() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const emailValid = EMAIL_RE.test(form.email);

  const {
    results: pwResults,
    score: pwScore,
  } = useMemo(
    () => evaluatePassword(form.password),
    [form.password]
  );

  const pwValid = pwScore === RULES.length;
  const formValid = emailValid && pwValid;

  const onChange = (field) => (e) => {
    setForm((f) => ({
      ...f,
      [field]: e.target.value,
    }));

    setTouched((t) => ({
      ...t,
      [field]: true,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (formValid) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="panel success-panel">
        <div className="success-glyph">✓</div>

        <h2>Access granted</h2>

        <p className="sub">
          Signed in as{" "}
          <strong>{form.email}</strong>
        </p>

        <button
          className="btn btn-ghost"
          onClick={() => {
            setSubmitted(false);
            setForm({
              email: "",
              password: "",
            });
            setTouched({
              email: false,
              password: false,
            });
          }}
        >
          ← Sign out & reset
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <p className="panel-title">
        <span className="dot"></span>
        Task 5.1 — Login controller
      </p>

      <form onSubmit={onSubmit} noValidate>

        <div className="field">
          <label htmlFor="login-email">
            Email address
          </label>

          <div className="input-wrap">
            <input
              id="login-email"
              type="text"
              placeholder="you@domain.com"
              value={form.email}
              onChange={onChange("email")}
              className={
                touched.email
                  ? emailValid
                    ? "valid"
                    : "invalid"
                  : ""
              }
              autoComplete="off"
            />

            {touched.email && (
              <span
                className={
                  "status-icon " +
                  (emailValid ? "ok" : "bad")
                }
              >
                {emailValid ? "OK" : "ERR"}
              </span>
            )}
          </div>

          {touched.email && !emailValid && (
            <div className="badge-list">
              <div className="badge error">
                ⚠ Does not match required pattern:
                name@domain.tld
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="login-password">
            Password
          </label>

          <div className="input-wrap">
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange("password")}
              className={
                touched.password
                  ? pwValid
                    ? "valid"
                    : "invalid"
                  : ""
              }
              autoComplete="off"
            />

            {touched.password && (
              <span
                className={
                  "status-icon " +
                  (pwValid ? "ok" : "bad")
                }
              >
                {pwValid ? "OK" : "ERR"}
              </span>
            )}
          </div>

          {touched.password && (
            <div className="badge-list">
              {pwResults
                .filter((r) => !r.pass)
                .map((r) => (
                  <div
                    key={r.key}
                    className="badge error"
                  >
                    ⚠ {r.label}
                  </div>
                ))}

              {pwValid && (
                <div className="badge ok">
                  ✓ All security patterns satisfied
                </div>
              )}
            </div>
          )}

          <ClearanceMeter
            password={form.password}
          />
        </div>

        <div className="btn-row">
          <span></span>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formValid}
          >
            Authenticate →
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Task 5.3 ---------------- */

const STEPS = [
  "Identity",
  "Security",
  "Profile",
  "Review",
];

function StepRail({ step }) {
  return (
    <div className="step-rail">
      {STEPS.map((name, i) => (
        <div className="step-node" key={name}>
          {i < STEPS.length - 1 && (
            <div
              className={
                "step-line" +
                (i < step ? " done" : "")
              }
            />
          )}

          <div
            className={
              "step-circle" +
              (i < step
                ? " done"
                : i === step
                ? " current"
                : "")
            }
          >
            {i < step ? "✓" : i + 1}
          </div>

          <div
            className={
              "step-name" +
              (i === step ? " active" : "")
            }
          >
            {name}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepIdentity({ data, update, errors }) {
  return (
    <>
      <div className="field">
        <label>Full name</label>

        <input
          value={data.name}
          onChange={(e) =>
            update({ name: e.target.value })
          }
          placeholder="Vani Gurcha"
          className={
            errors.name
              ? "invalid"
              : data.name
              ? "valid"
              : ""
          }
        />

        {errors.name && (
          <div className="badge-list">
            <div className="badge error">
              ⚠ {errors.name}
            </div>
          </div>
        )}
      </div>

      <div className="field">
        <label>Email address</label>

        <input
          value={data.email}
          onChange={(e) =>
            update({ email: e.target.value })
          }
          placeholder="you@domain.com"
          className={
            errors.email
              ? "invalid"
              : data.email
              ? "valid"
              : ""
          }
        />

        {errors.email && (
          <div className="badge-list">
            <div className="badge error">
              ⚠ {errors.email}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StepSecurity({ data, update, errors }) {
  const { results, score } = evaluatePassword(
    data.password
  );

  return (
    <>
      <div className="field">
        <label>Create password</label>

        <input
          type="password"
          value={data.password}
          onChange={(e) =>
            update({
              password: e.target.value,
            })
          }
          placeholder="••••••••"
          className={
            data.password
              ? score === RULES.length
                ? "valid"
                : "invalid"
              : ""
          }
        />

        <div className="badge-list">
          {results
            .filter((r) => !r.pass)
            .map((r) => (
              <div
                key={r.key}
                className="badge error"
              >
                ⚠ {r.label}
              </div>
            ))}
        </div>

        <ClearanceMeter
          password={data.password}
        />
      </div>

      <div className="field">
        <label>Confirm password</label>

        <input
          type="password"
          value={data.confirm}
          onChange={(e) =>
            update({
              confirm: e.target.value,
            })
          }
          placeholder="••••••••"
          className={
            data.confirm
              ? errors.confirm
                ? "invalid"
                : "valid"
              : ""
          }
        />

        {errors.confirm && (
          <div className="badge-list">
            <div className="badge error">
              ⚠ {errors.confirm}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StepProfile({ data, update }) {
  return (
    <>
      <div className="field">
        <label>Role / occupation</label>

        <input
          value={data.role}
          onChange={(e) =>
            update({ role: e.target.value })
          }
          placeholder="Student, Developer, ..."
        />
      </div>

      <div className="field">
        <label>Organization (optional)</label>

        <input
          value={data.org}
          onChange={(e) =>
            update({ org: e.target.value })
          }
          placeholder="College / Company"
        />
      </div>
    </>
  );
}

function StepReview({ data }) {
  return (
    <div>
      <div className="review-row">
        <span className="review-key">Name</span>
        <span className="review-val">
          {data.name || "—"}
        </span>
      </div>

      <div className="review-row">
        <span className="review-key">Email</span>
        <span className="review-val">
          {data.email || "—"}
        </span>
      </div>

      <div className="review-row">
        <span className="review-key">Password</span>
        <span className="review-val">
          {"•".repeat(data.password.length) || "—"}
        </span>
      </div>

      <div className="review-row">
        <span className="review-key">Role</span>
        <span className="review-val">
          {data.role || "—"}
        </span>
      </div>

      <div className="review-row">
        <span className="review-key">
          Organization
        </span>
        <span className="review-val">
          {data.org || "—"}
        </span>
      </div>
    </div>
  );
}

function AccessWizard() {
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "",
    org: "",
  });

  const [done, setDone] = useState(false);

  const update = (patch) => {
    setData((d) => ({
      ...d,
      ...patch,
    }));
  };

  const errorsFor = (s) => {
    const e = {};

    if (s === 0) {
      if (!data.name.trim()) {
        e.name = "Name is required";
      }

      if (!data.email) {
        e.email = "Email is required";
      } else if (!EMAIL_RE.test(data.email)) {
        e.email = "Enter a valid email address";
      }
    }

    if (s === 1) {
      const { score } = evaluatePassword(
        data.password
      );

      if (score < RULES.length) {
        e.password =
          "Password does not meet all criteria";
      }

      if (
        data.confirm !== data.password ||
        !data.confirm
      ) {
        e.confirm = "Passwords do not match";
      }
    }

    return e;
  };

  const currentErrors = errorsFor(step);

  const canAdvance =
    Object.keys(currentErrors).length === 0;

  const next = () => {
    if (canAdvance) {
      setStep((s) =>
        Math.min(s + 1, STEPS.length - 1)
      );
    }
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const finish = () => {
    if (canAdvance) {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="panel success-panel">
        <div className="success-glyph">✓</div>

        <h2>Onboarding complete</h2>

        <p className="sub">
          Welcome aboard,{" "}
          <strong>{data.name}</strong>.
        </p>

        <button
          className="btn btn-ghost"
          onClick={() => {
            setDone(false);
            setStep(0);
            setData({
              name: "",
              email: "",
              password: "",
              confirm: "",
              role: "",
              org: "",
            });
          }}
        >
          ← Start over
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <p className="panel-title">
        <span className="dot"></span>
        Task 5.3 — Onboarding wizard
      </p>

      <StepRail step={step} />

      {step === 0 && (
        <StepIdentity
          data={data}
          update={update}
          errors={currentErrors}
        />
      )}

      {step === 1 && (
        <StepSecurity
          data={data}
          update={update}
          errors={currentErrors}
        />
      )}

      {step === 2 && (
        <StepProfile
          data={data}
          update={update}
        />
      )}

      {step === 3 && (
        <StepReview data={data} />
      )}

      <div className="btn-row">
        <button
          className="btn btn-ghost"
          onClick={back}
          disabled={step === 0}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={!canAdvance}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={finish}
          >
            Submit application
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Main App ---------------- */

function App() {
  const [tab, setTab] = useState("login");

  return (
    <div>
      <div className="masthead">
        <span className="eyebrow">
          Lab Sheet 05 · Vani Gurcha
        </span>

        <h1>
          Form Validation Architecture &
          Controlled Inputs
        </h1>

        <p className="sub">
          A single React module demonstrating
          regex-driven login validation (5.1),
          a live password clearance meter (5.2),
          and a stateful multi-step onboarding
          wizard (5.3).
        </p>
      </div>

      <div className="tabs">
        <button
          className={
            "tab" +
            (tab === "login" ? " active" : "")
          }
          onClick={() => setTab("login")}
        >
          Login Console
        </button>

        <button
          className={
            "tab" +
            (tab === "wizard" ? " active" : "")
          }
          onClick={() => setTab("wizard")}
        >
          Onboarding Wizard
        </button>
      </div>

      {tab === "login" ? (
        <LoginConsole />
      ) : (
        <AccessWizard />
      )}

      <footer>
        REACT · CONTROLLED COMPONENTS · REGEX
        VALIDATION — LAB SHEET 05
      </footer>
    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);