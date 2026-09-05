import LoginForm from "./components/LoginForm";
import OnboardingWizard from "./components/OnboardingWizard";

function App() {
    return (
        <div className="app">

            <header>
                <h1>React Form Validation</h1>
                <p>Lab Sheet 05</p>
            </header>

            <main>
                <LoginForm />

                <OnboardingWizard />
            </main>

        </div>
    );
}

export default App;