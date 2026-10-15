import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Events() {

    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEvents = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                "/events",
                {
                    params: {
                        search,
                        category
                    }
                }
            );

            setEvents(response.data.events);

        } catch (error) {

            setError(
                "Unable to load events"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [search, category]);

    return (
        <div className="page-container">

            <h1>Upcoming Events</h1>

            <div className="filters">

                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >

                    <option value="">
                        All Categories
                    </option>

                    <option value="Workshop">
                        Workshop
                    </option>

                    <option value="Hackathon">
                        Hackathon
                    </option>

                    <option value="Placement Drive">
                        Placement Drive
                    </option>

                    <option value="Seminar">
                        Seminar
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>

            </div>

            {loading && (
                <p>Loading events...</p>
            )}

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <div className="card-grid">

                {events.map((event) => (

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
                            {event.description}
                        </p>

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
                            💺 Available Seats:
                            {" "}
                            {event.availableSeats}
                        </p>

                        <Link
                            to={`/events/${event._id}`}
                            className="primary-btn"
                        >
                            View Details
                        </Link>

                    </div>

                ))}

            </div>

            {!loading && events.length === 0 && (
                <p>
                    No events found.
                </p>
            )}

        </div>
    );
}

export default Events;