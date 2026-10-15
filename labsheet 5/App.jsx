import LoginForm from "./LoginForm";
import OnboardingWizard from "./OnboardingWizard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>React Form Module</h1>

      <LoginForm />

      <hr /> 

      <OnboardingWizard />
    </div>
  );
}

export default App;