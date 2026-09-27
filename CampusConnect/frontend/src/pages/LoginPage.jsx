import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/events";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in both email and password.");
            return;
        }

        try {
            setLoading(true);
            const result = await login(email, password);
            if (result.success) {
                if (result.user.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/student/dashboard");
                }
            } else {
                setError(result.message || "Invalid credentials.");
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setError(err.response.data.message || "Too many login attempts. Please wait a moment.");
            } else {
                setError(err.response?.data?.message || "Failed to log in. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Quick fill helper for evaluator convenience
    const fillCredentials = (role) => {
        if (role === "admin") {
            setEmail("admin@campusconnect.edu");
            setPassword("admin123");
        } else {
            setEmail("student@campusconnect.edu");
            setPassword("student123");
        }
        setError("");
    };

    return (
        <div style={{ maxWidth: "460px", margin: "40px auto" }}>
            <div className="card">
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <div style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        width: "52px",
                        height: "52px",
                        borderRadius: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px"
                    }}>
                        <LogIn size={26} />
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Welcome Back</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Sign in to access your CampusConnect dashboard
                    </p>
                </div>

                {/* Quick 1-Click Demo Login Pills */}
                <div style={{
                    background: "var(--bg-main)",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "20px",
                    border: "1px dashed var(--border)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "var(--secondary)", marginBottom: "8px" }}>
                        <Sparkles size={14} color="var(--primary)" /> Demo Test Credentials (1-Click Fill):
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            onClick={() => fillCredentials("student")}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, fontSize: "12px" }}
                        >
                            <UserCheck size={14} /> Student Demo
                        </button>
                        <button
                            type="button"
                            onClick={() => fillCredentials("admin")}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, fontSize: "12px" }}
                        >
                            <UserCheck size={14} /> Admin Demo
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ShieldAlert size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="e.g. student@campusconnect.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "12px", padding: "12px" }}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
                    Don't have an account yet?{" "}
                    <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600" }}>
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
