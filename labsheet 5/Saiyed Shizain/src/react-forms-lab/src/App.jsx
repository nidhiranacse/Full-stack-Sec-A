import { useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import PasswordStrengthDemo from "./components/PasswordStrengthDemo.jsx";
import OnboardingWizard from "./wizard/OnboardingWizard.jsx";

// Lab Sheet 5 — Saiyed Shizain: three form demos behind a simple tab switcher.
const TABS = [
  { id: "login", label: "5.1 Login Form" },
  { id: "strength", label: "5.2 Password Strength" },
  { id: "wizard", label: "5.3 Onboarding Wizard" },
];

function App() {
  const [tab, setTab] = useState("login");
  return (
    <div className="app">
      <header className="app-header">
        <h1>React Forms Lab</h1>
        <p>Saiyed Shizain — controlled inputs, validation, parent-child state</p>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "tab active" : "tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      {tab === "login" && <LoginForm />}
      {tab === "strength" && <PasswordStrengthDemo />}
      {tab === "wizard" && <OnboardingWizard />}
    </div>
  );
}

export default App;
