import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Login data:", {
            email,
            password
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>CampusConnect</h1>
                <p className="subtitle">Welcome back! Login to continue.</p>

                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>
                </form>

                <p className="switch-text">
                    Don't have an account?{" "}
                    <a href="/register">Register</a>
                </p>
            </div>
        </div>
    );
}

export default Login;