import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import AttendeeModal from "../components/AttendeeModal";
import {
    Shield,
    Calendar,
    Users,
    BookOpen,
    TrendingUp,
    Plus,
    Upload,
    Zap,
    CheckCircle2,
    Eye,
    Trash2,
    ExternalLink
} from "lucide-react";

const AdminDashboard = () => {
    const { user } = useAuth();

    const [adminData, setAdminData] = useState(null);
    const [benchmarkData, setBenchmarkData] = useState(null);
    const [benchmarkLoading, setBenchmarkLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);

    const fetchAdminDashboard = async () => {
        try {
            setLoading(true);
            const res = await API.get("/dashboard/admin");
            if (res.data.success) {
                setAdminData(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load admin dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const runBenchmark = async () => {
        try {
            setBenchmarkLoading(true);
            const res = await API.get("/dashboard/benchmark");
            if (res.data.success) {
                setBenchmarkData(res.data.optimizationDetails);
            }
        } catch (err) {
            alert("Benchmark failed.");
        } finally {
            setBenchmarkLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminDashboard();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                Loading admin analytics & overview...
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const { stats, popularEvents = [], recentEvents = [], recentResources = [], categoryCounts = {} } = adminData || {};

    return (
        <div>
            {/* Header Banner */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px"
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
                            Faculty & Admin Portal
                        </h1>
                        <span className="badge badge-purple">Admin Mode</span>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        Welcome back, {user?.name}. Monitor campus engagement, registrations, and resources.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <Link to="/events" className="btn btn-primary">
                        <Plus size={16} /> Manage Events
                    </Link>
                    <Link to="/resources" className="btn btn-secondary">
                        <Upload size={16} /> Manage Resources
                    </Link>
                </div>
            </div>

            {/* ANALYTICS STAT CARDS */}
            <div className="grid-cols-4" style={{ marginBottom: "32px" }}>
                <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>TOTAL EVENTS</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}>
                                {stats?.totalEvents || 0}
                            </div>
                        </div>
                        <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "12px", borderRadius: "10px" }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: "4px solid var(--success)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>TOTAL REGISTRATIONS</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px", color: "var(--success)" }}>
                                {stats?.totalRegistrations || 0}
                            </div>
                        </div>
                        <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "12px", borderRadius: "10px" }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: "4px solid #7e22ce" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>STUDENTS REGISTERED</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px", color: "#7e22ce" }}>
                                {stats?.totalStudents || 0}
                            </div>
                        </div>
                        <div style={{ background: "#f3e8ff", color: "#7e22ce", padding: "12px", borderRadius: "10px" }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: "4px solid var(--warning)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>SHARED RESOURCES</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px", color: "var(--warning)" }}>
                                {stats?.totalResources || 0}
                            </div>
                        </div>
                        <div style={{ background: "var(--warning-light)", color: "var(--warning)", padding: "12px", borderRadius: "10px" }}>
                            <BookOpen size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* POPULAR EVENTS & ATTENDEE TRACKER */}
            <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Users size={20} color="var(--primary)" /> Event Turnout & Attendee Management
                    </h2>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Click "View Attendees" to see enrolled student list & export CSV
                    </span>
                </div>

                <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Event Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Capacity</th>
                                    <th>Registered</th>
                                    <th>Fill Rate</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popularEvents.map((ev) => {
                                    const percent = Math.min(100, Math.round((ev.registeredCount / ev.totalSeats) * 100));
                                    return (
                                        <tr key={ev.id}>
                                            <td style={{ fontWeight: "700" }}>{ev.title}</td>
                                            <td><span className="badge badge-purple">{ev.category}</span></td>
                                            <td>{new Date(ev.date).toLocaleDateString()}</td>
                                            <td>{ev.totalSeats} seats</td>
                                            <td style={{ fontWeight: "600" }}>{ev.registeredCount}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <div style={{
                                                        width: "100px",
                                                        height: "8px",
                                                        background: "#e2e8f0",
                                                        borderRadius: "4px",
                                                        overflow: "hidden"
                                                    }}>
                                                        <div style={{
                                                            width: `${percent}%`,
                                                            height: "100%",
                                                            background: percent >= 90 ? "var(--danger)" : "var(--primary)",
                                                            borderRadius: "4px"
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{percent}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setSelectedEventForAttendees({ id: ev.id, title: ev.title })}
                                                >
                                                    <Users size={14} /> View Attendees
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* BONUS CHALLENGE: Slow Query Index Optimization Benchmark */}
            <div className="card" style={{
                marginBottom: "36px",
                background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                border: "1px solid #cbd5e1"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Zap size={22} color="#eab308" />
                            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                                Database Query Index Optimization Benchmark (Bonus Feature)
                            </h3>
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Demonstrating compound index <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>&#123; category: 1, date: 1 &#125;</code> on MongoDB Event collection.
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={runBenchmark}
                        disabled={benchmarkLoading}
                    >
                        {benchmarkLoading ? "Running explain()..." : "Test Query Performance"}
                    </button>
                </div>

                {benchmarkData ? (
                    <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Execution Stage</div>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--success)" }}>IXSCAN (Indexed)</div>
                            </div>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Index Utilized</div>
                                <div style={{ fontSize: "14px", fontWeight: "600" }}>{benchmarkData.indexUsed}</div>
                            </div>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Execution Time</div>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>{benchmarkData.executionTimeMillis} ms</div>
                            </div>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Docs Examined</div>
                                <div style={{ fontSize: "15px", fontWeight: "700" }}>{benchmarkData.totalDocsExamined} docs</div>
                            </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: "1.5" }}>
                            <strong>Analysis:</strong> {benchmarkData.explanation}
                        </p>
                    </div>
                ) : (
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Click "Test Query Performance" above to execute MongoDB's <code>explain("executionStats")</code> and visualize the index scan efficiency in real time.
                    </div>
                )}
            </div>

            {/* Attendee Modal */}
            {selectedEventForAttendees && (
                <AttendeeModal
                    eventId={selectedEventForAttendees.id}
                    eventTitle={selectedEventForAttendees.title}
                    onClose={() => setSelectedEventForAttendees(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
