import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import AttendeeModal from "../components/AttendeeModal";
import {
    Calendar,
    Search,
    Filter,
    MapPin,
    Clock,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Eye,
    Trash2,
    Edit3
} from "lucide-react";

const CATEGORIES = ["All", "Workshop", "Hackathon", "Placement Drive", "Seminar", "Tech Talk", "Cultural"];

const EventsPage = () => {
    const { user, isStudent, isAdmin } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

    // Filter states
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [timeFilter, setTimeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);

    // Admin attendee modal
    const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);

    // Create / Edit modal state (Admin)
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        category: "Workshop",
        date: "",
        time: "",
        venue: "",
        totalSeats: 50
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: 9
            });

            if (search.trim()) params.append("search", search.trim());
            if (category !== "All") params.append("category", category);
            if (timeFilter !== "all") params.append("filter", timeFilter);

            const res = await API.get(`/events?${params.toString()}`);
            if (res.data.success) {
                setEvents(res.data.events);
                setTotalPages(res.data.totalPages || 1);
                setTotalEvents(res.data.totalEvents || 0);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load events.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page, category, timeFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchEvents();
    };

    // Register student for event
    const handleRegister = async (eventId) => {
        if (!user) {
            setActionMsg({ type: "danger", text: "Please log in as a student to register for events." });
            return;
        }

        try {
            const res = await API.post(`/events/${eventId}/register`);
            if (res.data.success) {
                setActionMsg({ type: "success", text: res.data.message });
                fetchEvents();
            }
        } catch (err) {
            setActionMsg({ type: "danger", text: err.response?.data?.message || "Registration failed." });
        }
    };

    // Unregister student from event
    const handleUnregister = async (eventId) => {
        try {
            const res = await API.post(`/events/${eventId}/unregister`);
            if (res.data.success) {
                setActionMsg({ type: "info", text: res.data.message });
                fetchEvents();
            }
        } catch (err) {
            setActionMsg({ type: "danger", text: err.response?.data?.message || "Unregistration failed." });
        }
    };

    // Admin delete event
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This will remove all student registrations.")) return;

        try {
            const res = await API.delete(`/events/${eventId}`);
            if (res.data.success) {
                setActionMsg({ type: "success", text: "Event deleted successfully." });
                fetchEvents();
            }
        } catch (err) {
            setActionMsg({ type: "danger", text: err.response?.data?.message || "Delete failed." });
        }
    };

    // Open Create Modal
    const openCreateModal = () => {
        setEditingEventId(null);
        setEventForm({
            title: "",
            description: "",
            category: "Workshop",
            date: "",
            time: "10:00 AM - 01:00 PM",
            venue: "Computer Science Lab",
            totalSeats: 50
        });
        setShowEventModal(true);
    };

    // Open Edit Modal
    const openEditModal = (ev) => {
        setEditingEventId(ev._id);
        setEventForm({
            title: ev.title,
            description: ev.description,
            category: ev.category,
            date: ev.date ? new Date(ev.date).toISOString().split("T")[0] : "",
            time: ev.time,
            venue: ev.venue,
            totalSeats: ev.totalSeats
        });
        setShowEventModal(true);
    };

    // Save Event (Create or Edit)
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        try {
            if (editingEventId) {
                const res = await API.put(`/events/${editingEventId}`, eventForm);
                if (res.data.success) {
                    setActionMsg({ type: "success", text: "Event updated successfully!" });
                }
            } else {
                const res = await API.post("/events", eventForm);
                if (res.data.success) {
                    setActionMsg({ type: "success", text: "New event created successfully!" });
                }
            }
            setShowEventModal(false);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving event.");
        }
    };

    return (
        <div>
            {/* Header with Title and Add Button */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px"
            }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
                        Campus Events & Activities
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        Browse {totalEvents} available workshops, hackathons, placement drives, and tech sessions
                    </p>
                </div>

                {isAdmin && (
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} /> Create New Event
                    </button>
                )}
            </div>

            {/* Action Feedback Message */}
            {actionMsg.text && (
                <div className={`alert alert-${actionMsg.type}`} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{actionMsg.text}</span>
                    <button onClick={() => setActionMsg({ type: "", text: "" })}>×</button>
                </div>
            )}

            {/* Search and Filters Bar */}
            <div className="card" style={{ padding: "16px 20px", marginBottom: "28px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} style={{ flex: "1 1 260px", display: "flex", gap: "8px" }}>
                        <div style={{ position: "relative", width: "100%" }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, description, venue..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary">
                            <Search size={16} /> Search
                        </button>
                    </form>

                    {/* Category Filter */}
                    <div style={{ flex: "0 1 180px" }}>
                        <select
                            className="form-control"
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat} (Category)</option>
                            ))}
                        </select>
                    </div>

                    {/* Time Filter (All / Upcoming / Past) */}
                    <div style={{ flex: "0 1 160px" }}>
                        <select
                            className="form-control"
                            value={timeFilter}
                            onChange={(e) => { setTimeFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Dates</option>
                            <option value="upcoming">Upcoming Only</option>
                            <option value="past">Past Events</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    Loading campus events...
                </div>
            ) : events.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <Calendar size={42} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>No events found</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Try adjusting your search keywords or filter options.
                    </p>
                </div>
            ) : (
                <div className="grid-cols-3">
                    {events.map((ev) => {
                        const registeredCount = ev.registeredStudents ? ev.registeredStudents.length : 0;
                        const available = ev.totalSeats - registeredCount;
                        const isSoldOut = available <= 0;
                        const isUserRegistered = user && ev.registeredStudents?.some(
                            (s) => (s._id || s).toString() === user._id || (s._id || s).toString() === user.id
                        );

                        return (
                            <div key={ev._id} className="card card-hover" style={{ display: "flex", flexDirection: "column" }}>
                                {/* Category and Seats Badge */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span className="badge badge-purple">{ev.category}</span>
                                    <span className={`badge ${isSoldOut ? "badge-red" : available < 10 ? "badge-yellow" : "badge-green"}`}>
                                        {isSoldOut ? "Sold Out" : `${available} of ${ev.totalSeats} seats left`}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
                                    {ev.title}
                                </h2>

                                {/* Description */}
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

                                {/* Meta Info (Date, Time, Venue) */}
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
                                        <span>
                                            {new Date(ev.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Clock size={14} color="var(--primary)" />
                                        <span>{ev.time}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <MapPin size={14} color="var(--primary)" />
                                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {ev.venue}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {/* Student Registration Button */}
                                    {isUserRegistered ? (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <span className="btn btn-success btn-sm" style={{ flex: 1, cursor: "default" }}>
                                                <CheckCircle2 size={15} /> Registered
                                            </span>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleUnregister(ev._id)}
                                                title="Cancel registration"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            disabled={isSoldOut}
                                            onClick={() => handleRegister(ev._id)}
                                        >
                                            {isSoldOut ? "Seats Full" : "Register Now"}
                                        </button>
                                    )}

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <div style={{ display: "flex", gap: "6px", borderTop: "1px dashed var(--border)", paddingTop: "8px" }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                style={{ flex: 1 }}
                                                onClick={() => setSelectedEventForAttendees({ id: ev._id, title: ev.title })}
                                                title="View Attendees"
                                            >
                                                <Users size={14} /> Attendees ({registeredCount})
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => openEditModal(ev)}
                                                title="Edit Event"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteEvent(ev._id)}
                                                title="Delete Event"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
            />

            {/* Attendee Modal for Admin */}
            {selectedEventForAttendees && (
                <AttendeeModal
                    eventId={selectedEventForAttendees.id}
                    eventTitle={selectedEventForAttendees.title}
                    onClose={() => setSelectedEventForAttendees(null)}
                />
            )}

            {/* Create / Edit Event Modal */}
            {showEventModal && (
                <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                            {editingEventId ? "Edit Event Details" : "Create New Campus Event"}
                        </h2>

                        <form onSubmit={handleSaveEvent}>
                            <div className="form-group">
                                <label className="form-label">Event Title *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="e.g. AWS Cloud Masterclass"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-control"
                                    value={eventForm.category}
                                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                >
                                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    required
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Detailed overview of syllabus, requirements, speaker info..."
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={eventForm.time}
                                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                        placeholder="e.g. 10:00 AM - 01:00 PM"
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                                <div className="form-group">
                                    <label className="form-label">Venue / Hall *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={eventForm.venue}
                                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                        placeholder="e.g. Auditorium Block B"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Seats *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        required
                                        value={eventForm.totalSeats}
                                        onChange={(e) => setEventForm({ ...eventForm, totalSeats: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingEventId ? "Save Changes" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsPage;
