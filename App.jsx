import { useState } from "react";
import LoginForm from "./LoginForm";
import OnboardingWizard from "./OnboardingWizard";

export default function App() {
  const [tab, setTab] = useState("login");
  return (
    <main>
      <h1>Lab 05 - Form Validation in React</h1>
      <div className="tabs">
        <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Login + Strength Meter</button>
        <button className={tab === "wizard" ? "active" : ""} onClick={() => setTab("wizard")}>Onboarding Wizard</button>
      </div>
      {tab === "login" ? <LoginForm /> : <OnboardingWizard />}
    </main>
  );
}
