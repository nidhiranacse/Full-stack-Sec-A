import LoginForm from "./components/LoginForm";
import OnboardingWizard from "./components/OnboardingWizard";

function App() {
  return (
    <div className="app">
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>

      <main className="container">

        <header className="hero">
          <div className="hero-icon">🔐</div>

          <div>
            <h1>React Form Validation Architecture</h1>

            <p>
              Controlled Inputs
              <span> • </span>
              Regex Validation
              <span> • </span>
              Password Strength
              <span> • </span>
              Multi-Step Wizard
            </p>
          </div>
        </header>

        <LoginForm />

        <OnboardingWizard />

        <footer>
          <span>💙</span> Built with React ⚛️
          <span> • </span>
          Form Validation
          <span> • </span>
          Better UX
        </footer>

      </main>
    </div>
  );
}

export default App;