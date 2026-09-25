import LoginForm from "./components/LoginForm";
import OnboardingWizard from "./components/OnboardingWizard";

function App() {
  return (
    <div className="app">
      <h1>React Form Validation Lab</h1>

      <section>
        <h2>Login Form</h2>
        <LoginForm />
      </section>

      <section>
        <h2>User Onboarding Wizard</h2>
        <OnboardingWizard />
      </section>
    </div>
  );
}

export default App;