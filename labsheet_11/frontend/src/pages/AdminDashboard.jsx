import { useEffect, useState } from "react";
import api from "../api";

function AdminDashboard() {
    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState("");

    // Event states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [venue, setVenue] = useState("");
    const [maxSeats, setMaxSeats] = useState("");

    const [editingId, setEditingId] = useState(null);

    // Registered students
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registeredStudents, setRegisteredStudents] = useState([]);

    // Resources
    const [resourceTitle, setResourceTitle] = useState("");
    const [resourceDescription, setResourceDescription] = useState("");
    const [resourceFile, setResourceFile] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const loadEvents = async () => {
        try {
            const response = await api.get("/events");
            setEvents(response.data);
        } catch (error) {
            setMessage("Unable to load events");
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventData = {
                title,
                description,
                date,
                venue,
                maxSeats: Number(maxSeats)
            };

            if (editingId) {
                await api.put(
                    `/events/${editingId}`,
                    eventData,
                    authConfig
                );

                setMessage("✨ Event updated successfully!");
            } else {
                await api.post(
                    "/events",
                    eventData,
                    authConfig
                );

                setMessage("✨ Event created successfully!");
            }

            clearForm();
            await loadEvents();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const editEvent = (event) => {
        setEditingId(event._id);
        setTitle(event.title);
        setDescription(event.description);
        setDate(event.date.slice(0, 16));
        setVenue(event.venue);
        setMaxSeats(event.maxSeats);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const clearForm = () => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setDate("");
        setVenue("");
        setMaxSeats("");
    };

    const deleteEvent = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/events/${id}`,
                authConfig
            );

            setMessage("Event deleted successfully!");

            if (selectedEvent?._id === id) {
                setSelectedEvent(null);
                setRegisteredStudents([]);
            }

            await loadEvents();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to delete event"
            );
        }
    };

    const viewRegisteredStudents = async (event) => {
        try {
            const response = await api.get(
                `/registrations/event/${event._id}`,
                authConfig
            );

            setSelectedEvent(event);
            setRegisteredStudents(response.data);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to load registered students"
            );
        }
    };

    const uploadResource = async (e) => {
        e.preventDefault();

        if (!resourceFile) {
            setMessage(
                "Please select a PDF or DOCX file"
            );
            return;
        }

        try {
            const formData = new FormData();

            formData.append(
                "title",
                resourceTitle
            );

            formData.append(
                "description",
                resourceDescription
            );

            formData.append(
                "file",
                resourceFile
            );

            await api.post(
                "/resources",
                formData,
                authConfig
            );

            setMessage(
                "✨ Resource uploaded successfully!"
            );

            setResourceTitle("");
            setResourceDescription("");
            setResourceFile(null);

            const fileInput =
                document.getElementById("admin-resource-file");

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Resource upload failed"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const totalSeats = events.reduce(
        (sum, event) =>
            sum + Number(event.maxSeats || 0),
        0
    );

    const availableSeats = events.reduce(
        (sum, event) =>
            sum + Number(event.availableSeats || 0),
        0
    );

    const registeredCount =
        totalSeats - availableSeats;

    return (
        <div className="admin-page">

            {/* NAVBAR */}

            <nav className="admin-navbar">

                <div className="admin-brand">

                    <span className="admin-logo">
                        ✦
                    </span>

                    <div>
                        <div className="gradient-text admin-brand-name">
                            CampusConnect
                        </div>

                        <span className="admin-brand-subtitle">
                            ADMIN CONTROL CENTER
                        </span>
                    </div>

                </div>

                <div className="admin-user">

                    <div className="admin-user-info">
                        <strong>
                            {user?.name || "Administrator"}
                        </strong>

                        <span>
                            SYSTEM ADMIN
                        </span>
                    </div>

                    <button
                        className="admin-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            <main className="admin-content">

                {/* HERO */}

                <section className="admin-hero">

                    <div>

                        <span className="admin-badge">
                            ⚡ ADMINISTRATION
                        </span>

                        <h1>
                            Control your
                            <br />
                            <span className="gradient-text">
                                Campus Experience.
                            </span>
                        </h1>

                        <p>
                            Manage events, monitor registrations
                            and publish learning resources from
                            one central workspace.
                        </p>

                    </div>

                    <div className="admin-hero-orb">
                        <div className="admin-orb-ring"></div>
                        <div className="admin-orb-core">
                            ⚡
                        </div>
                    </div>

                </section>

                {/* MESSAGE */}

                {message && (
                    <div className="admin-message">
                        <span>✦</span>
                        {message}
                    </div>
                )}

                {/* STAT CARDS */}

                <section className="admin-stats">

                    <div className="admin-stat glass-card">

                        <span className="admin-stat-icon">
                            ◈
                        </span>

                        <span className="admin-stat-number">
                            {events.length}
                        </span>

                        <span className="admin-stat-label">
                            Total Events
                        </span>

                    </div>

                    <div className="admin-stat glass-card">

                        <span className="admin-stat-icon">
                            ◎
                        </span>

                        <span className="admin-stat-number">
                            {registeredCount}
                        </span>

                        <span className="admin-stat-label">
                            Registrations
                        </span>

                    </div>

                    <div className="admin-stat glass-card">

                        <span className="admin-stat-icon">
                            ◇
                        </span>

                        <span className="admin-stat-number">
                            {availableSeats}
                        </span>

                        <span className="admin-stat-label">
                            Seats Available
                        </span>

                    </div>

                </section>

                {/* CREATE / EDIT */}

                <section className="admin-section">

                    <div className="admin-section-title">

                        <div>
                            <span className="section-kicker">
                                MANAGEMENT
                            </span>

                            <h2>
                                {editingId
                                    ? "Edit Event"
                                    : "Create Event"}
                            </h2>
                        </div>

                        {editingId && (
                            <button
                                className="secondary-btn"
                                onClick={clearForm}
                            >
                                Cancel Edit
                            </button>
                        )}

                    </div>

                    <div className="admin-form-card glass-card">

                        <form
                            className="admin-event-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-field">

                                <label>
                                    EVENT TITLE
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. AI & Machine Learning Workshop"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    VENUE
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Seminar Hall"
                                    value={venue}
                                    onChange={(e) =>
                                        setVenue(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    DATE & TIME
                                </label>

                                <input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    MAXIMUM SEATS
                                </label>

                                <input
                                    type="number"
                                    placeholder="50"
                                    min="1"
                                    value={maxSeats}
                                    onChange={(e) =>
                                        setMaxSeats(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="form-field full-field">

                                <label>
                                    DESCRIPTION
                                </label>

                                <textarea
                                    placeholder="Describe the event..."
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="form-submit">

                                <button type="submit">
                                    {editingId
                                        ? "Update Event  →"
                                        : "Create Event  →"}
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

                {/* EVENTS */}

                <section className="admin-section">

                    <div className="admin-section-title">

                        <div>
                            <span className="section-kicker">
                                EVENTS
                            </span>

                            <h2>
                                Event Management
                            </h2>
                        </div>

                        <span className="admin-count">
                            {events.length} total
                        </span>

                    </div>

                    {events.length === 0 ? (

                        <div className="admin-empty glass-card">
                            <span>◌</span>
                            <h3>No events yet</h3>
                            <p>
                                Create your first campus event
                                using the form above.
                            </p>
                        </div>

                    ) : (

                        <div className="admin-event-grid">

                            {events.map((event, index) => (

                                <div
                                    className="admin-event-card"
                                    key={event._id}
                                    style={{
                                        animationDelay:
                                            `${index * 0.08}s`
                                    }}
                                >

                                    <div className="admin-event-top">

                                        <span className="admin-event-tag">
                                            EVENT {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <span className="admin-event-seat">
                                            {event.availableSeats} available
                                        </span>

                                    </div>

                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p className="admin-event-description">
                                        {event.description}
                                    </p>

                                    <div className="admin-event-info">

                                        <div>
                                            <span>◷</span>
                                            {new Date(
                                                event.date
                                            ).toLocaleString()}
                                        </div>

                                        <div>
                                            <span>⌖</span>
                                            {event.venue}
                                        </div>

                                    </div>

                                    <div className="admin-seat-line">

                                        <div
                                            style={{
                                                width:
                                                    `${Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            (event.availableSeats /
                                                                event.maxSeats) *
                                                                100
                                                        )
                                                    )}%`
                                            }}
                                        ></div>

                                    </div>

                                    <div className="admin-event-actions">

                                        <button
                                            onClick={() =>
                                                editEvent(event)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                viewRegisteredStudents(
                                                    event
                                                )
                                            }
                                        >
                                            Students
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteEvent(
                                                    event._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* REGISTERED STUDENTS */}

                <section className="admin-section">

                    <div className="admin-section-title">

                        <div>
                            <span className="section-kicker">
                                ATTENDANCE
                            </span>

                            <h2>
                                Registered Students
                            </h2>
                        </div>

                    </div>

                    {!selectedEvent ? (

                        <div className="admin-empty glass-card">
                            <span>◎</span>
                            <h3>
                                Select an event
                            </h3>
                            <p>
                                Click "Students" on an event
                                to view registrations.
                            </p>
                        </div>

                    ) : (

                        <div className="students-panel">

                            <div className="students-panel-header">

                                <div>
                                    <span>
                                        CURRENT EVENT
                                    </span>

                                    <h3>
                                        {selectedEvent.title}
                                    </h3>
                                </div>

                                <div className="student-total">
                                    {registeredStudents.length}
                                    <small>
                                        students
                                    </small>
                                </div>

                            </div>

                            {registeredStudents.length === 0 ? (

                                <div className="no-students">
                                    No students registered
                                    for this event yet.
                                </div>

                            ) : (

                                <div className="students-list">

                                    {registeredStudents.map(
                                        (registration, index) => (

                                            <div
                                                className="student-row"
                                                key={
                                                    registration._id
                                                }
                                            >

                                                <div className="student-avatar">
                                                    {String(
                                                        registration
                                                            .student
                                                            ?.name ||
                                                        "S"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="student-details">

                                                    <strong>
                                                        {
                                                            registration
                                                                .student
                                                                ?.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            registration
                                                                .student
                                                                ?.email
                                                        }
                                                    </span>

                                                </div>

                                                <span className="student-index">
                                                    #{String(
                                                        index + 1
                                                    ).padStart(2, "0")}
                                                </span>

                                                <span className="registered-time">
                                                    {new Date(
                                                        registration.createdAt
                                                    ).toLocaleDateString()}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    )}

                </section>

                {/* RESOURCE UPLOAD */}

                <section className="admin-section">

                    <div className="admin-section-title">

                        <div>
                            <span className="section-kicker">
                                LEARNING HUB
                            </span>

                            <h2>
                                Publish Resource
                            </h2>
                        </div>

                    </div>

                    <div className="resource-upload-card glass-card">

                        <div className="upload-visual">
                            <div className="upload-icon">
                                ↑
                            </div>

                            <span>
                                PDF / DOCX
                            </span>

                            <small>
                                Maximum file size: 10 MB
                            </small>
                        </div>

                        <form
                            className="resource-form"
                            onSubmit={uploadResource}
                        >

                            <div className="form-field">

                                <label>
                                    RESOURCE TITLE
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Machine Learning Notes"
                                    value={resourceTitle}
                                    onChange={(e) =>
                                        setResourceTitle(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    DESCRIPTION
                                </label>

                                <textarea
                                    placeholder="Short description..."
                                    value={resourceDescription}
                                    onChange={(e) =>
                                        setResourceDescription(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    FILE
                                </label>

                                <input
                                    id="admin-resource-file"
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={(e) =>
                                        setResourceFile(
                                            e.target.files[0]
                                        )
                                    }
                                    required
                                />

                            </div>

                            <button type="submit">
                                Upload Resource  ↑
                            </button>

                        </form>

                    </div>

                </section>

                <footer className="admin-footer">
                    <span>
                        ✦ CampusConnect Admin
                    </span>

                    <span>
                        Secure • Organized • Connected
                    </span>
                </footer>

            </main>

        </div>
    );
}

export default AdminDashboard;