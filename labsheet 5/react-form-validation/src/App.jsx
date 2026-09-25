import LoginForm from "./components/LoginForm";
import OnboardingWizard from "./OnboardingWizard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Labsheet 5</h1>
        <p>React Form Validation</p>
      </header>

      <section className="section">
        <h2>Task 5.1 — Regex Validation</h2>
        <LoginForm />
      </section>

      <section className="section">
        <h2>Task 5.3 — Multi-Step Onboarding Wizard</h2>
        <OnboardingWizard />
      </section>
    </div>
  );
}

export default App;