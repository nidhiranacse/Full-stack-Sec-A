import { useEffect, useState } from "react";
import {
    CalendarDays,
    BookmarkCheck,
    FileText,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

import StudentSidebar from "../components/StudentSidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import EventCard from "../components/EventCard";
import api from "../api/axios";

function StudentDashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/events");

            setEvents(response.data.events || []);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);

            await fetchEvents();

            alert("Successfully registered for the event!");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Registration failed."
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <StudentSidebar />

            <main className="dashboard-main">
                <DashboardNavbar />

                <div className="dashboard-content">
                    <section className="welcome-section">
                        <div>
                            <div className="welcome-badge">
                                <Sparkles size={14} />
                                Student Portal
                            </div>

                            <h1>
                                Good morning,{" "}
                                <span>
                                    {user.name?.split(" ")[0] ||
                                        "Student"}
                                </span>
                                👋
                            </h1>

                            <p>
                                Discover what's happening around
                                your campus today.
                            </p>
                        </div>
                    </section>

                    <section className="stats-grid">
                        <div className="dashboard-stat">
                            <div className="stat-icon blue">
                                <CalendarDays size={21} />
                            </div>

                            <div>
                                <span>Upcoming Events</span>
                                <strong>{events.length}</strong>
                            </div>
                        </div>

                        <div className="dashboard-stat">
                            <div className="stat-icon green">
                                <BookmarkCheck size={21} />
                            </div>

                            <div>
                                <span>My Registrations</span>
                                <strong>1</strong>
                            </div>
                        </div>

                        <div className="dashboard-stat">
                            <div className="stat-icon purple">
                                <FileText size={21} />
                            </div>

                            <div>
                                <span>Resources</span>
                                <strong>0</strong>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading">
                            <div>
                                <h2>Upcoming events</h2>
                                <p>
                                    Explore events and register for
                                    the ones you like.
                                </p>
                            </div>

                            <Link
                                to="/student/events"
                                className="view-all"
                            >
                                View all
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="dashboard-loading">
                                Loading events...
                            </div>
                        ) : events.length === 0 ? (
                            <div className="empty-state">
                                <CalendarDays size={30} />
                                <h3>No upcoming events</h3>
                                <p>
                                    New campus events will appear
                                    here.
                                </p>
                            </div>
                        ) : (
                            <div className="events-grid">
                                {events
                                    .slice(0, 3)
                                    .map((event) => (
                                        <EventCard
                                            key={event._id}
                                            event={event}
                                            onRegister={
                                                handleRegister
                                            }
                                        />
                                    ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default StudentDashboard;