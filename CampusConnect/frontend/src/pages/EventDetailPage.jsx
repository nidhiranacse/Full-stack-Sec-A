import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import AttendeeModal from "../components/AttendeeModal";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    ArrowLeft,
    CheckCircle2,
    Shield,
    Trash2
} from "lucide-react";

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, isStudent } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [showAttendees, setShowAttendees] = useState(false);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/events/${id}`);
            if (res.data.success) {
                setEvent(res.data.event);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load event.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const res = await API.post(`/events/${id}/register`);
            if (res.data.success) {
                setMsg({ type: "success", text: res.data.message });
                fetchEvent();
            }
        } catch (err) {
            setMsg({ type: "danger", text: err.response?.data?.message || "Registration failed." });
        }
    };

    const handleUnregister = async () => {
        try {
            const res = await API.post(`/events/${id}/unregister`);
            if (res.data.success) {
                setMsg({ type: "info", text: res.data.message });
                fetchEvent();
            }
        } catch (err) {
            setMsg({ type: "danger", text: err.response?.data?.message || "Unregistration failed." });
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                Loading event details...
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="card" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
                <h2 style={{ fontSize: "20px", marginBottom: "12px", color: "var(--danger)" }}>Event Not Found</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{error || "The requested event does not exist."}</p>
                <Link to="/events" className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Events
                </Link>
            </div>
        );
    }

    const registeredCount = event.registeredStudents ? event.registeredStudents.length : 0;
    const availableSeats = Math.max(0, event.totalSeats - registeredCount);
    const isSoldOut = availableSeats <= 0;
    const isUserRegistered = user && event.registeredStudents?.some(
        (s) => (s._id || s).toString() === user._id || (s._id || s).toString() === user.id
    );

    return (
        <div style={{ maxWidth: "840px", margin: "0 auto" }}>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: "20px" }}>
                <ArrowLeft size={16} /> Back to All Events
            </Link>

            {msg.text && (
                <div className={`alert alert-${msg.type}`} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{msg.text}</span>
                    <button onClick={() => setMsg({ type: "", text: "" })}>×</button>
                </div>
            )}

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                    <span className="badge badge-purple" style={{ fontSize: "14px", padding: "6px 14px" }}>
                        {event.category}
                    </span>
                    <span className={`badge ${isSoldOut ? "badge-red" : availableSeats < 10 ? "badge-yellow" : "badge-green"}`} style={{ fontSize: "13px", padding: "6px 12px" }}>
                        {isSoldOut ? "Sold Out" : `${availableSeats} of ${event.totalSeats} seats remaining`}
                    </span>
                </div>

                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>
                    {event.title}
                </h1>

                {/* Event Schedule Info Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    background: "var(--bg-main)",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    border: "1px solid var(--border)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#dbeafe", padding: "10px", borderRadius: "10px", color: "var(--primary)" }}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Date</div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>
                                {new Date(event.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#dcfce7", padding: "10px", borderRadius: "10px", color: "var(--success)" }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Time</div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{event.time}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#fef3c7", padding: "10px", borderRadius: "10px", color: "var(--warning)" }}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Venue</div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{event.venue}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#f3e8ff", padding: "10px", borderRadius: "10px", color: "#7e22ce" }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Registrations</div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{registeredCount} / {event.totalSeats} students</div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "32px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>About This Event</h3>
                    <p style={{ color: "#334155", lineHeight: "1.7", fontSize: "15px", whiteSpace: "pre-line" }}>
                        {event.description}
                    </p>
                </div>

                {/* Organizer Info */}
                {event.createdBy && (
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>
                        Organized by Faculty: <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{event.createdBy.name}</span> ({event.createdBy.email})
                    </div>
                )}

                {/* Interactive Action Bar */}
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "20px"
                }}>
                    <div>
                        {isUserRegistered ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span className="badge badge-green" style={{ fontSize: "14px", padding: "8px 16px" }}>
                                    <CheckCircle2 size={16} /> You are registered for this event
                                </span>
                                <button className="btn btn-danger btn-sm" onClick={handleUnregister}>
                                    Cancel Registration
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                style={{ padding: "12px 28px", fontSize: "15px" }}
                                disabled={isSoldOut}
                                onClick={handleRegister}
                            >
                                {isSoldOut ? "Event Fully Booked" : "Confirm Registration"}
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowAttendees(true)}
                            >
                                <Users size={16} /> View Attendees ({registeredCount})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Attendee Modal */}
            {showAttendees && (
                <AttendeeModal
                    eventId={event._id}
                    eventTitle={event.title}
                    onClose={() => setShowAttendees(false)}
                />
            )}
        </div>
    );
};

export default EventDetailPage;
