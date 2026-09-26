import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import axios from "../api/axios";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            if (response.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/student");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <Link to="/" className="auth-brand">
                    <span className="brand-mark">C</span>
                    CampusConnect
                </Link>

                <div className="auth-intro">
                    <div className="hero-badge">
                        <Sparkles size={15} />
                        Welcome back
                    </div>

                    <h1>
                        Your campus.
                        <br />
                        <span>Your opportunities.</span>
                    </h1>

                    <p>
                        Sign in to discover events, manage your
                        registrations and access your academic resources.
                    </p>
                </div>

                <div className="auth-feature">
                    <div className="auth-feature-icon">
                        <ArrowRight size={18} />
                    </div>
                    <div>
                        <strong>Everything in one place</strong>
                        <span>
                            Events, resources and your campus activities.
                        </span>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-heading">
                        <h2>Welcome back</h2>
                        <p>Sign in to your CampusConnect account.</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email address</label>

                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <LockKeyhole size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}

                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>New to CampusConnect?</span>
                    </div>

                    <Link to="/signup" className="auth-secondary-btn">
                        Create an account
                    </Link>

                    <Link to="/" className="back-home">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;