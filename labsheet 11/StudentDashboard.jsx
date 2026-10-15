import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get(
                    "/dashboard/student"
                );

                setDashboard(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <h2>Loading dashboard...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <p className="error">{error}</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="dashboard-header">
                <div>
                    <h1>
                        Welcome, {user?.name} 👋
                    </h1>

                    <p>
                        Manage your events and study
                        resources from here.
                    </p>
                </div>
            </div>

            {/* Statistics */}

            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">
                        📅
                    </div>

                    <h3>
                        {dashboard.statistics.totalRegistrations}
                    </h3>

                    <p>
                        Event Registrations
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        🚀
                    </div>

                    <h3>
                        {dashboard.statistics.upcomingEvents}
                    </h3>

                    <p>
                        Upcoming Events
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        📚
                    </div>

                    <h3>
                        {dashboard.statistics.totalResources}
                    </h3>

                    <p>
                        Available Resources
                    </p>
                </div>

            </div>

            {/* My Events */}

            <section className="dashboard-section">

                <div className="section-header">
                    <h2>
                        My Registered Events
                    </h2>

                    <Link
                        to="/events"
                        className="primary-btn"
                    >
                        Browse Events
                    </Link>
                </div>

                {dashboard.myEvents.length === 0 ? (

                    <div className="empty-state">
                        <h3>
                            No registered events
                        </h3>

                        <p>
                            You haven't registered for
                            any event yet.
                        </p>

                        <Link
                            to="/events"
                            className="primary-btn"
                        >
                            Explore Events
                        </Link>
                    </div>

                ) : (

                    <div className="card-grid">

                        {dashboard.myEvents.map(
                            (event) => (

                                <div
                                    className="event-card"
                                    key={event._id}
                                >

                                    <span className="category">
                                        {event.category}
                                    </span>

                                    <h2>
                                        {event.title}
                                    </h2>

                                    <p>
                                        📅{" "}
                                        {new Date(
                                            event.date
                                        ).toLocaleString()}
                                    </p>

                                    <p>
                                        📍 {event.venue}
                                    </p>

                                    <p>
                                        💺 Seats available:
                                        {" "}
                                        {event.availableSeats}
                                    </p>

                                    <Link
                                        to={`/events/${event._id}`}
                                        className="primary-btn"
                                    >
                                        View Event
                                    </Link>

                                </div>
                            )
                        )}

                    </div>
                )}

            </section>

            {/* Quick Actions */}

            <section className="quick-actions">

                <h2>
                    Quick Actions
                </h2>

                <div className="action-grid">

                    <Link
                        to="/events"
                        className="action-card"
                    >
                        <span>📅</span>
                        <h3>Browse Events</h3>
                        <p>
                            Find upcoming college events.
                        </p>
                    </Link>

                    <Link
                        to="/resources"
                        className="action-card"
                    >
                        <span>📚</span>
                        <h3>Study Resources</h3>
                        <p>
                            Access notes and previous
                            year papers.
                        </p>
                    </Link>

                </div>

            </section>

        </div>
    );
}

export default StudentDashboard;