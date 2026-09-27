import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
    Calendar,
    BookOpen,
    Users,
    Sparkles,
    ArrowRight,
    MapPin,
    Clock,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";

const HomePage = () => {
    const { user, isStudent, isAdmin } = useAuth();
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await API.get("/events?limit=3&filter=upcoming");
                if (res.data.success) {
                    setUpcomingEvents(res.data.events);
                }
            } catch (err) {
                console.error("Error fetching preview events:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    return (
        <div>
            {/* HERO SECTION */}
            <section style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
                borderRadius: "16px",
                color: "#ffffff",
                padding: "60px 32px",
                textAlign: "center",
                marginBottom: "40px",
                boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(255, 255, 255, 0.15)",
                        padding: "6px 16px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "20px",
                        backdropFilter: "blur(6px)"
                    }}>
                        <Sparkles size={16} /> Campus Event & Academic Hub • 2026
                    </div>

                    <h1 style={{ fontSize: "38px", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px" }}>
                        Empowering College Students & Faculty to Connect, Learn, and Lead
                    </h1>

                    <p style={{ fontSize: "16px", opacity: 0.9, lineHeight: "1.6", marginBottom: "32px" }}>
                        Browse workshops, hackathons, and placement drives. Register with real-time seat tracking, and access shared semester notes and previous year exam papers all in one unified portal.
                    </p>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/events" className="btn" style={{
                            background: "#ffffff",
                            color: "var(--primary)",
                            padding: "12px 24px",
                            fontSize: "15px"
                        }}>
                            <Calendar size={18} /> Browse Events
                        </Link>
                        <Link to="/resources" className="btn" style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "#ffffff",
                            padding: "12px 24px",
                            fontSize: "15px",
                            border: "1px solid rgba(255, 255, 255, 0.3)"
                        }}>
                            <BookOpen size={18} /> Study Resources
                        </Link>

                        {user ? (
                            <Link
                                to={isAdmin ? "/admin/dashboard" : "/student/dashboard"}
                                className="btn"
                                style={{
                                    background: "#10b981",
                                    color: "#ffffff",
                                    padding: "12px 24px",
                                    fontSize: "15px"
                                }}
                            >
                                Open My Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <Link to="/register" className="btn" style={{
                                background: "#0f172a",
                                color: "#ffffff",
                                padding: "12px 24px",
                                fontSize: "15px"
                            }}>
                                Join as Student <ArrowRight size={18} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* KEY FEATURES SECTION */}
            <section style={{ marginBottom: "48px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Core Platform Features</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        Designed to streamline campus activities and academic sharing
                    </p>
                </div>

                <div className="grid-cols-3">
                    <div className="card card-hover">
                        <div style={{
                            background: "#dbeafe",
                            color: "var(--primary)",
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <Calendar size={24} />
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                            Event Management & Registration
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                            Discover workshops, hackathons, and placement drives. View real-time seat availability and book your spot instantly.
                        </p>
                    </div>

                    <div className="card card-hover">
                        <div style={{
                            background: "#dcfce7",
                            color: "var(--success)",
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <BookOpen size={24} />
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                            Academic Resource Repository
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                            Access verified lecture notes, previous year question papers (PYQs), and laboratory manuals categorized by semester and subject.
                        </p>
                    </div>

                    <div className="card card-hover">
                        <div style={{
                            background: "#f3e8ff",
                            color: "#7e22ce",
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                            Role-Based Portals & Analytics
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                            Dedicated dashboards for students to track registrations and for faculty/admins to manage registrations, view attendees, and analyze turnout.
                        </p>
                    </div>
                </div>
            </section>

            {/* UPCOMING EVENTS PREVIEW */}
            <section style={{ marginBottom: "48px" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px"
                }}>
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Upcoming Highlights</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                            Don't miss out on these popular upcoming activities
                        </p>
                    </div>
                    <Link to="/events" className="btn btn-secondary btn-sm">
                        View All Events <ArrowRight size={15} />
                    </Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                        Loading events...
                    </div>
                ) : upcomingEvents.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                        <Calendar size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px auto" }} />
                        <p style={{ color: "var(--text-muted)" }}>No upcoming events scheduled at the moment.</p>
                    </div>
                ) : (
                    <div className="grid-cols-3">
                        {upcomingEvents.map((ev) => {
                            const available = ev.totalSeats - (ev.registeredStudents?.length || 0);
                            const isSoldOut = available <= 0;

                            return (
                                <div key={ev._id} className="card card-hover" style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <span className="badge badge-purple">{ev.category}</span>
                                        <span className={`badge ${isSoldOut ? "badge-red" : available < 10 ? "badge-yellow" : "badge-green"}`}>
                                            {isSoldOut ? "Sold Out" : `${available} seats left`}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
                                        {ev.title}
                                    </h3>

                                    <p style={{
                                        color: "var(--text-muted)",
                                        fontSize: "13px",
                                        lineHeight: "1.5",
                                        marginBottom: "16px",
                                        flex: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {ev.description}
                                    </p>

                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                        fontSize: "13px",
                                        color: "var(--secondary)",
                                        marginBottom: "16px",
                                        borderTop: "1px solid var(--border)",
                                        paddingTop: "12px"
                                    }}>
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
                                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.venue}</span>
                                        </div>
                                    </div>

                                    <Link to={`/events/${ev._id}`} className="btn btn-primary" style={{ width: "100%" }}>
                                        View Details & Register
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
