import LoginForm from "./components/LoginForm";
import OnboardingForm from "./components/OnboardingForm";
import "./App.css";

function App() {
    return (
        <div className="app">


            <p className="subtitle">
                Form Validation Architecture & Controlled Inputs in React
            </p>

            <LoginForm />

            <OnboardingForm />

        </div>
    );
}

export default App;