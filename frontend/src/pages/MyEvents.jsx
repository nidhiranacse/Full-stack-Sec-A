import { useEffect, useState } from "react";
import {
    CalendarDays,
    MapPin,
    Users,
    BookmarkCheck,
    LoaderCircle
} from "lucide-react";

import StudentSidebar from "../components/StudentSidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import api from "../api/axios";

function MyEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const response = await api.get("/events/my-events");
            setEvents(response.data.events || []);
        } catch (error) {
            console.error("Failed to load my events:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <StudentSidebar />

            <main className="dashboard-main">
                <DashboardNavbar />

                <div className="dashboard-content">

                    <section className="events-hero">
                        <div>
                            <div className="welcome-badge">
                                <BookmarkCheck size={14} />
                                MY ACTIVITIES
                            </div>

                            <h1>My Events</h1>

                            <p>
                                Keep track of the campus events you
                                have registered for.
                            </p>
                        </div>
                    </section>

                    {loading ? (
                        <div className="dashboard-loading">
                            <LoaderCircle
                                size={22}
                                className="loading-spin"
                            />
                            Loading your events...
                        </div>
                    ) : events.length === 0 ? (
                        <div className="empty-state">
                            <BookmarkCheck size={38} />

                            <h3>No registered events yet</h3>

                            <p>
                                Explore campus events and register for
                                something interesting.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="events-result-count">
                                {events.length}{" "}
                                {events.length === 1
                                    ? "Event"
                                    : "Events"}{" "}
                                registered
                            </div>

                            <div className="events-grid">
                                {events.map((event) => (
                                    <div
                                        className="event-card"
                                        key={event._id}
                                    >
                                        <div className="event-card-top">
                                            <span className="event-category">
                                                {event.category}
                                            </span>

                                            <span className="registered-badge">
                                                <BookmarkCheck size={14} />
                                                Registered
                                            </span>
                                        </div>

                                        <h3>{event.title}</h3>

                                        <p className="event-description">
                                            {event.description}
                                        </p>

                                        <div className="event-info">
                                            <span>
                                                <CalendarDays size={16} />
                                                {new Date(
                                                    event.date
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </span>

                                            <span>
                                                <MapPin size={16} />
                                                {event.location}
                                            </span>

                                            <span>
                                                <Users size={16} />
                                                {event.registeredStudents
                                                    ?.length || 0}
                                                /
                                                {event.totalSeats}{" "}
                                                registered
                                            </span>
                                        </div>

                                        <div className="registered-message">
                                            <BookmarkCheck size={17} />

                                            You're registered for this
                                            event.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

export default MyEvents;