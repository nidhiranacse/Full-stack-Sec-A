import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, ShieldAlert, GraduationCap, Shield } from "lucide-react";

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        department: "Computer Science & Engineering",
        semester: 6
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            setLoading(true);
            const result = await register(formData);
            if (result.success) {
                if (result.user.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/student/dashboard");
                }
            } else {
                setError(result.message || "Registration failed.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please check inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "520px", margin: "30px auto" }}>
            <div className="card">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
                        <UserPlus size={26} />
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Create an Account</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Join CampusConnect as a Student or Faculty/Admin
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ShieldAlert size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Role Selector Tabs */}
                    <div className="form-group">
                        <label className="form-label">Registering As:</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "student" })}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    border: formData.role === "student" ? "2px solid var(--primary)" : "1px solid var(--border)",
                                    background: formData.role === "student" ? "var(--primary-light)" : "#ffffff",
                                    color: formData.role === "student" ? "var(--primary)" : "var(--text-muted)"
                                }}
                            >
                                <GraduationCap size={18} /> Student
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "admin" })}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    border: formData.role === "admin" ? "2px solid #7e22ce" : "1px solid var(--border)",
                                    background: formData.role === "admin" ? "#f3e8ff" : "#ffffff",
                                    color: formData.role === "admin" ? "#7e22ce" : "var(--text-muted)"
                                }}
                            >
                                <Shield size={18} /> Faculty / Admin
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="e.g. Afroj Khan"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="e.g. student@campusconnect.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password * (minimum 6 characters)</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Academic Department</label>
                        <select
                            name="department"
                            className="form-control"
                            value={formData.department}
                            onChange={handleChange}
                        >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                        </select>
                    </div>

                    {formData.role === "student" && (
                        <div className="form-group">
                            <label className="form-label">Current Semester (1 - 8)</label>
                            <select
                                name="semester"
                                className="form-control"
                                value={formData.semester}
                                onChange={handleChange}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                    <option key={s} value={s}>Semester {s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "12px", padding: "12px" }}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : `Register as ${formData.role === "admin" ? "Faculty Admin" : "Student"}`}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
