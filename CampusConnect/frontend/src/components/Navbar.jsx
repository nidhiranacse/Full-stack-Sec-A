import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    GraduationCap,
    Calendar,
    BookOpen,
    LayoutDashboard,
    Shield,
    LogOut,
    LogIn,
    UserPlus,
    Menu,
    X
} from "lucide-react";

const Navbar = () => {
    const { user, logout, isAdmin, isStudent } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{
            background: "#ffffff",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "var(--shadow-sm)"
        }}>
            <div style={{
                maxWidth: "1240px",
                margin: "0 auto",
                padding: "0 16px",
                height: "68px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                {/* Brand Logo */}
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                    <div style={{
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#fff",
                        padding: "8px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <span style={{ fontSize: "19px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" }}>
                            Campus<span style={{ color: "var(--primary)" }}>Connect</span>
                        </span>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "-3px" }}>
                            Student & Resource Portal
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link
                        to="/events"
                        className="btn"
                        style={{
                            background: isActive("/events") ? "var(--primary-light)" : "transparent",
                            color: isActive("/events") ? "var(--primary)" : "var(--text-muted)"
                        }}
                    >
                        <Calendar size={17} />
                        Events
                    </Link>

                    <Link
                        to="/resources"
                        className="btn"
                        style={{
                            background: isActive("/resources") ? "var(--primary-light)" : "transparent",
                            color: isActive("/resources") ? "var(--primary)" : "var(--text-muted)"
                        }}
                    >
                        <BookOpen size={17} />
                        Resources
                    </Link>

                    {isStudent && (
                        <Link
                            to="/student/dashboard"
                            className="btn"
                            style={{
                                background: isActive("/student/dashboard") ? "var(--primary-light)" : "transparent",
                                color: isActive("/student/dashboard") ? "var(--primary)" : "var(--text-muted)"
                            }}
                        >
                            <LayoutDashboard size={17} />
                            My Dashboard
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            className="btn"
                            style={{
                                background: isActive("/admin/dashboard") ? "var(--primary-light)" : "transparent",
                                color: isActive("/admin/dashboard") ? "var(--primary)" : "var(--text-muted)"
                            }}
                        >
                            <Shield size={17} />
                            Admin Console
                        </Link>
                    )}
                </nav>

                {/* Desktop User Actions */}
                <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ textAlign: "right", lineHeight: "1.2" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                                    {user.name}
                                </div>
                                <span className={`badge ${isAdmin ? "badge-purple" : "badge-blue"}`}>
                                    {isAdmin ? "Faculty Admin" : "Student"}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary btn-sm"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Link to="/login" className="btn btn-secondary btn-sm">
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                <UserPlus size={16} />
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        display: "none",
                        padding: "8px",
                        borderRadius: "6px",
                        color: "var(--text-main)"
                    }}
                    className="mobile-toggle"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div style={{
                    padding: "16px",
                    background: "#ffffff",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}>
                    <Link
                        to="/events"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn btn-secondary"
                        style={{ justifyContent: "flex-start" }}
                    >
                        <Calendar size={18} /> Events
                    </Link>
                    <Link
                        to="/resources"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn btn-secondary"
                        style={{ justifyContent: "flex-start" }}
                    >
                        <BookOpen size={18} /> Academic Resources
                    </Link>
                    {isStudent && (
                        <Link
                            to="/student/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="btn btn-secondary"
                            style={{ justifyContent: "flex-start" }}
                        >
                            <LayoutDashboard size={18} /> My Student Dashboard
                        </Link>
                    )}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="btn btn-secondary"
                            style={{ justifyContent: "flex-start" }}
                        >
                            <Shield size={18} /> Admin Dashboard
                        </Link>
                    )}
                    <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
                    {user ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{user.name} ({user.role})</div>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ width: "100%" }}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
