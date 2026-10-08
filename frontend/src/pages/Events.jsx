import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Search,
    MapPin,
    Users,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal
} from "lucide-react";

import StudentSidebar from "../components/StudentSidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import api from "../api/axios";

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [date, setDate] = useState("");

    const [page, setPage] = useState(1);
    const eventsPerPage = 6;

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await api.get("/events");
            setEvents(response.data.events || []);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const unique = [
            ...new Set(events.map((event) => event.category))
        ];

        return ["All", ...unique];
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch =
                event.title
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                event.description
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                event.category === category;

            const matchesDate =
                !date ||
                new Date(event.date)
                    .toISOString()
                    .split("T")[0] === date;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesDate
            );
        });
    }, [events, search, category, date]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredEvents.length / eventsPerPage)
    );

    const currentEvents = filteredEvents.slice(
        (page - 1) * eventsPerPage,
        page * eventsPerPage
    );

    const changeCategory = (value) => {
        setCategory(value);
        setPage(1);
    };

    const changeSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const changeDate = (value) => {
        setDate(value);
        setPage(1);
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
                                <CalendarDays size={14} />
                                CAMPUS EVENTS
                            </div>

                            <h1>Explore Events</h1>

                            <p>
                                Discover workshops, hackathons,
                                placement drives and more happening
                                around campus.
                            </p>
                        </div>
                    </section>

                    <section className="events-toolbar">

                        <div className="events-search">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) =>
                                    changeSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="event-filter">
                            <SlidersHorizontal size={17} />

                            <select
                                value={category}
                                onChange={(e) =>
                                    changeCategory(e.target.value)
                                }
                            >
                                {categories.map((item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="event-filter">
                            <CalendarDays size={17} />

                            <input
                                type="date"
                                value={date}
                                onChange={(e) =>
                                    changeDate(e.target.value)
                                }
                            />
                        </div>

                    </section>

                    <div className="events-result-count">
                        {filteredEvents.length}{" "}
                        {filteredEvents.length === 1
                            ? "Event"
                            : "Events"}{" "}
                        found
                    </div>

                    {loading ? (
                        <div className="dashboard-loading">
                            Loading events...
                        </div>
                    ) : currentEvents.length === 0 ? (
                        <div className="empty-state">
                            <CalendarDays size={34} />

                            <h3>No events found</h3>

                            <p>
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="events-grid">

                            {currentEvents.map((event) => (
                                <div
                                    className="event-card"
                                    key={event._id}
                                >
                                    <div className="event-card-top">

                                        <span className="event-category">
                                            {event.category}
                                        </span>

                                        <span className="event-seats">
                                            {event.totalSeats -
                                                (event.registeredStudents
                                                    ?.length || 0)}{" "}
                                            seats left
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

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            alert(
                                                "Registration can be completed from the event registration button."
                                            )
                                        }
                                    >
                                        Register for Event
                                    </button>
                                </div>
                            ))}

                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">

                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>

                            <span>
                                Page <strong>{page}</strong> of{" "}
                                <strong>{totalPages}</strong>
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() =>
                                    setPage((p) => p + 1)
                                }
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>

                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default Events;