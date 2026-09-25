import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            if (response.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/student");
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Background decoration */}

            <div className="login-orb orb-one"></div>
            <div className="login-orb orb-two"></div>
            <div className="login-orb orb-three"></div>

            <div className="login-container">

                {/* Brand */}

                <div className="login-brand">

                    <div className="brand-icon">
                        ✦
                    </div>

                    <h1 className="gradient-text">
                        CampusConnect
                    </h1>

                    <p>
                        CONNECT • DISCOVER • PARTICIPATE
                    </p>

                </div>

                {/* Login Card */}

                <div className="login-card glass-card">

                    <div className="login-card-header">

                        <span className="welcome-badge">
                            ✨ Welcome Back
                        </span>

                        <h2>
                            Sign in to your
                            <span className="gradient-text">
                                {" "}Campus
                            </span>
                        </h2>

                        <p>
                            Access events, resources and
                            your campus community.
                        </p>

                    </div>

                    <form onSubmit={handleLogin}>

                        <div className="input-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        {message && (
                            <div className="login-error">
                                ⚠ {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In  →"}
                        </button>

                    </form>

                    <div className="login-footer">

                        <span>
                            CampusConnect
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            Student Event Portal
                        </span>

                    </div>

                </div>

                <div className="login-bottom-text">
                    Built for smarter campus experiences ✦
                </div>

            </div>

        </div>
    );
}

export default Login;