import { useEffect, useState } from "react";
import api from "../api";

function StudentDashboard() {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [resources, setResources] = useState([]);
    const [message, setMessage] = useState("");

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
            setMessage(
                error.response?.data?.message ||
                "Unable to load events"
            );
        }
    };

    const loadRegistrations = async () => {
        try {
            const response = await api.get(
                "/registrations/my",
                authConfig
            );

            setRegistrations(response.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to load registrations"
            );
        }
    };

    const loadResources = async () => {
        try {
            const response = await api.get("/resources");
            setResources(response.data);
        } catch (error) {
            setMessage("Unable to load resources");
        }
    };

    useEffect(() => {
        loadEvents();
        loadRegistrations();
        loadResources();
    }, []);

    const isRegistered = (eventId) => {
        return registrations.some(
            (registration) =>
                registration.event?._id === eventId
        );
    };

    const registerForEvent = async (eventId) => {
        try {
            await api.post(
                `/registrations/${eventId}`,
                {},
                authConfig
            );

            setMessage("✨ Successfully registered!");

            await loadEvents();
            await loadRegistrations();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    const unregisterFromEvent = async (eventId) => {
        try {
            await api.delete(
                `/registrations/${eventId}`,
                authConfig
            );

            setMessage(
                "Registration cancelled successfully."
            );

            await loadEvents();
            await loadRegistrations();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to unregister"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    return (
        <div className="student-page">

            {/* NAVBAR */}

            <nav className="student-navbar">

                <div className="nav-brand">
                    <span className="nav-logo">✦</span>

                    <span className="gradient-text">
                        CampusConnect
                    </span>
                </div>

                <div className="nav-user">

                    <div className="user-info">
                        <span className="user-name">
                            {user?.name || "Student"}
                        </span>

                        <span className="user-role">
                            STUDENT
                        </span>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            <main className="student-content">

                {/* HERO */}

                <section className="student-hero">

                    <div>

                        <span className="hero-badge">
                            ✨ STUDENT PORTAL
                        </span>

                        <h1>
                            Welcome back,
                            <br />
                            <span className="gradient-text">
                                {user?.name || "Student"}.
                            </span>
                        </h1>

                        <p>
                            Discover events, connect with your
                            campus community and access your
                            learning resources.
                        </p>

                    </div>

                    <div className="hero-orbit">
                        <div className="orbit-ring"></div>
                        <div className="orbit-core">✦</div>
                    </div>

                </section>

                {/* MESSAGE */}

                {message && (
                    <div className="dashboard-message">
                        {message}
                    </div>
                )}

                {/* STATS */}

                <section className="student-stats">

                    <div className="stat-card glass-card">
                        <span className="stat-icon">◈</span>
                        <span className="stat-number">
                            {events.length}
                        </span>
                        <span className="stat-label">
                            Available Events
                        </span>
                    </div>

                    <div className="stat-card glass-card">
                        <span className="stat-icon">✓</span>
                        <span className="stat-number">
                            {registrations.length}
                        </span>
                        <span className="stat-label">
                            My Registrations
                        </span>
                    </div>

                    <div className="stat-card glass-card">
                        <span className="stat-icon">◇</span>
                        <span className="stat-number">
                            {resources.length}
                        </span>
                        <span className="stat-label">
                            Study Resources
                        </span>
                    </div>

                </section>

                {/* EVENTS */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <span className="section-kicker">
                                DISCOVER
                            </span>

                            <h2>
                                Upcoming Events
                            </h2>
                        </div>

                        <span className="section-count">
                            {events.length} events
                        </span>

                    </div>

                    {events.length === 0 ? (
                        <div className="empty-card glass-card">
                            <span>◌</span>
                            <p>No events available right now.</p>
                        </div>
                    ) : (
                        <div className="event-grid">

                            {events.map((event, index) => (

                                <div
                                    className="event-card glass-card"
                                    key={event._id}
                                    style={{
                                        animationDelay:
                                            `${index * 0.08}s`
                                    }}
                                >

                                    <div className="event-top">

                                        <span className="event-badge">
                                            EVENT
                                        </span>

                                        <span className="event-seats">
                                            {event.availableSeats} seats
                                        </span>

                                    </div>

                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p className="event-description">
                                        {event.description}
                                    </p>

                                    <div className="event-details">

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

                                    <div className="seat-bar">

                                        <div
                                            className="seat-progress"
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

                                    <div className="event-footer">

                                        <span>
                                            {event.availableSeats}
                                            {" / "}
                                            {event.maxSeats}
                                            {" seats available"}
                                        </span>

                                        {isRegistered(event._id) ? (

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    unregisterFromEvent(
                                                        event._id
                                                    )
                                                }
                                            >
                                                Unregister
                                            </button>

                                        ) : (

                                            <button
                                                onClick={() =>
                                                    registerForEvent(
                                                        event._id
                                                    )
                                                }
                                                disabled={
                                                    event.availableSeats <= 0
                                                }
                                            >
                                                {event.availableSeats <= 0
                                                    ? "Full"
                                                    : "Register →"}
                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                </section>

                {/* MY REGISTRATIONS */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <span className="section-kicker">
                                YOUR ACTIVITY
                            </span>

                            <h2>
                                My Registrations
                            </h2>
                        </div>

                    </div>

                    {registrations.length === 0 ? (

                        <div className="empty-card glass-card">
                            <span>◇</span>
                            <p>
                                You haven't registered for
                                any events yet.
                            </p>
                        </div>

                    ) : (

                        <div className="registration-list">

                            {registrations.map(
                                (registration) => (

                                    <div
                                        className="registration-card glass-card"
                                        key={
                                            registration._id
                                        }
                                    >

                                        <div className="registration-icon">
                                            ✓
                                        </div>

                                        <div>
                                            <h3>
                                                {
                                                    registration
                                                        .event
                                                        ?.title
                                                }
                                            </h3>

                                            <p>
                                                {registration.event?.venue}
                                            </p>
                                        </div>

                                        <span className="registered-label">
                                            REGISTERED
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

                {/* RESOURCES */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <span className="section-kicker">
                                LEARNING HUB
                            </span>

                            <h2>
                                Study Resources
                            </h2>
                        </div>

                    </div>

                    {resources.length === 0 ? (

                        <div className="empty-card glass-card">
                            <span>◇</span>
                            <p>
                                No resources available yet.
                            </p>
                        </div>

                    ) : (

                        <div className="resource-grid">

                            {resources.map((resource) => (

                                <div
                                    className="resource-card glass-card"
                                    key={resource._id}
                                >

                                    <div className="resource-icon">
                                        PDF
                                    </div>

                                    <div className="resource-content">

                                        <h3>
                                            {resource.title}
                                        </h3>

                                        <p>
                                            {resource.description ||
                                                "Study material uploaded by CampusConnect."}
                                        </p>

                                    </div>

                                    <a
                                        className="resource-button"
                                        href={
                                            `http://localhost:5000${resource.fileUrl}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open ↗
                                    </a>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                <footer className="student-footer">
                    <span>✦ CampusConnect</span>
                    <span>
                        Built for smarter campus experiences
                    </span>
                </footer>

            </main>

        </div>
    );
}

export default StudentDashboard;