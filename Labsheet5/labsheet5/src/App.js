import React from "react";
import LoginForm from "./components/LoginForm";
import OnboardingForm from "./components/OnboardingForm";
import "./App.css";

function App() {
  return (
    <div className="app">

      <header className="header">
        <h1>Lab Sheet 05</h1>
        <p>
          Form Validation Architecture & Controlled Inputs in React
        </p>
      </header>

      <main>

        {/* Task 5.1 and Task 5.2 */}
        <LoginForm />

        {/* Task 5.3 */}
        <OnboardingForm />

      </main>

      <footer>
        <p>React JS Lab Sheet 05</p>
      </footer>

    </div>
  );
}

export default App;