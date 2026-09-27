import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
    Calendar,
    BookOpen,
    CheckCircle2,
    Clock,
    MapPin,
    GraduationCap,
    Download,
    ArrowRight,
    History,
    AlertCircle
} from "lucide-react";

const StudentDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelMsg, setCancelMsg] = useState("");

    const fetchStudentDashboard = async () => {
        try {
            setLoading(true);
            const res = await API.get("/dashboard/student");
            if (res.data.success) {
                setDashboardData(res.data.dashboard);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load student dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDashboard();
    }, []);

    const handleCancelRegistration = async (eventId) => {
        if (!window.confirm("Do you want to cancel your seat registration for this event?")) return;

        try {
            const res = await API.post(`/events/${eventId}/unregister`);
            if (res.data.success) {
                setCancelMsg(res.data.message);
                fetchStudentDashboard();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Cancellation failed.");
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                Loading your student dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" style={{ maxWidth: "600px", margin: "40px auto" }}>
                {error}
            </div>
        );
    }

    const {
        totalRegistrations = 0,
        upcomingCount = 0,
        pastCount = 0,
        upcomingEvents = [],
        registrationHistory = [],
        recommendedResources = []
    } = dashboardData || {};

    return (
        <div>
            {/* Student Profile Overview Card */}
            <div className="card" style={{
                marginBottom: "28px",
                background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                border: "1px solid #bfdbfe"
            }}>
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                            background: "var(--primary)",
                            color: "#ffffff",
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            fontWeight: "700"
                        }}>
                            {user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)" }}>
                                    {user?.name}
                                </h1>
                                <span className="badge badge-blue">Student</span>
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
                                {user?.department} • Semester {user?.semester || 6}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stat counters */}
                    <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{
                            textAlign: "center",
                            padding: "12px 20px",
                            background: "#ffffff",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary)" }}>
                                {upcomingCount}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Upcoming</div>
                        </div>

                        <div style={{
                            textAlign: "center",
                            padding: "12px 20px",
                            background: "#ffffff",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--success)" }}>
                                {totalRegistrations}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Enrolled</div>
                        </div>
                    </div>
                </div>
            </div>

            {cancelMsg && (
                <div className="alert alert-info" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{cancelMsg}</span>
                    <button onClick={() => setCancelMsg("")}>×</button>
                </div>
            )}

            {/* UPCOMING REGISTERED EVENTS */}
            <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={20} color="var(--primary)" /> My Upcoming Events ({upcomingEvents.length})
                    </h2>
                    <Link to="/events" className="btn btn-secondary btn-sm">
                        Explore More Events <ArrowRight size={14} />
                    </Link>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
                        <Calendar size={36} color="var(--text-muted)" style={{ margin: "0 auto 10px auto", opacity: 0.5 }} />
                        <h4 style={{ fontSize: "16px", fontWeight: "600" }}>No upcoming registered events</h4>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>
                            You have not registered for any upcoming workshops or hackathons yet.
                        </p>
                        <Link to="/events" className="btn btn-primary btn-sm">
                            Browse Upcoming Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid-cols-2">
                        {upcomingEvents.map((ev) => (
                            <div key={ev._id} className="card card-hover">
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                    <span className="badge badge-purple">{ev.category}</span>
                                    <span className="badge badge-green">Confirmed Seat</span>
                                </div>

                                <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px" }}>
                                    <Link to={`/events/${ev._id}`} style={{ color: "inherit" }}>
                                        {ev.title}
                                    </Link>
                                </h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--secondary)", marginBottom: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Calendar size={14} color="var(--primary)" />
                                        <span>{new Date(ev.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Clock size={14} color="var(--primary)" />
                                        <span>{ev.time}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <MapPin size={14} color="var(--primary)" />
                                        <span>{ev.venue}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                                    <Link to={`/events/${ev._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                                        View Details
                                    </Link>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleCancelRegistration(ev._id)}
                                    >
                                        Cancel Registration
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* REGISTRATION HISTORY */}
            <div style={{ marginBottom: "36px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                    <History size={20} color="var(--primary)" /> Complete Registration History ({registrationHistory.length})
                </h2>

                {registrationHistory.length === 0 ? (
                    <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                        No event registration records found.
                    </div>
                ) : (
                    <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Event Name</th>
                                        <th>Category</th>
                                        <th>Date & Venue</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrationHistory.map((item, idx) => {
                                        const isPast = new Date(item.date) < new Date();
                                        return (
                                            <tr key={item._id}>
                                                <td>{idx + 1}</td>
                                                <td style={{ fontWeight: "600" }}>{item.title}</td>
                                                <td><span className="badge badge-purple">{item.category}</span></td>
                                                <td>
                                                    <div>{new Date(item.date).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.venue}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${isPast ? "badge-gray" : "badge-green"}`}>
                                                        {isPast ? "Concluded" : "Upcoming"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/events/${item._id}`} className="btn btn-secondary btn-sm">
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* RECOMMENDED SEMESTER RESOURCES */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                            <BookOpen size={20} color="var(--primary)" /> Recommended Study Resources
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            Tailored for your current Semester ({user?.semester || 6})
                        </p>
                    </div>
                    <Link to="/resources" className="btn btn-secondary btn-sm">
                        View All Resources <ArrowRight size={14} />
                    </Link>
                </div>

                {recommendedResources.length === 0 ? (
                    <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                        No specific resources uploaded yet for Semester {user?.semester || 6}.
                    </div>
                ) : (
                    <div className="grid-cols-2">
                        {recommendedResources.map((resItem) => (
                            <div key={resItem._id} className="card card-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                                        <span className="badge badge-blue">{resItem.subject}</span>
                                        <span className="badge badge-gray">{resItem.category}</span>
                                    </div>
                                    <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{resItem.title}</h4>
                                </div>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => window.open(`/api/resources/${resItem._id}/download`, "_blank")}
                                    title="Download"
                                >
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
