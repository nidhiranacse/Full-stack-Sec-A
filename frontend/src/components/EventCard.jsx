import {
    CalendarDays,
    MapPin,
    Users,
    ArrowUpRight
} from "lucide-react";

function EventCard({ event, onRegister, registering }) {
    const registeredCount =
        event.registeredStudents?.length || 0;

    const availableSeats =
        Math.max(
            (event.totalSeats || 0) - registeredCount,
            0
        );

    const eventDate = new Date(event.date);

    return (
        <div className="event-card">
            <div className="event-card-top">
                <span className="event-category">
                    {event.category}
                </span>

                <span
                    className={
                        availableSeats > 0
                            ? "seat-status available"
                            : "seat-status full"
                    }
                >
                    {availableSeats > 0
                        ? `${availableSeats} seats left`
                        : "Fully booked"}
                </span>
            </div>

            <h3>{event.title}</h3>

            <p className="event-description">
                {event.description}
            </p>

            <div className="event-details">
                <div>
                    <CalendarDays size={16} />
                    <span>
                        {eventDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        })}
                    </span>
                </div>

                <div>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                </div>

                <div>
                    <Users size={16} />
                    <span>
                        {registeredCount}/{event.totalSeats} registered
                    </span>
                </div>
            </div>

            <button
                className="event-register-btn"
                disabled={availableSeats === 0 || registering}
                onClick={() => onRegister(event._id)}
            >
                {registering
                    ? "Registering..."
                    : availableSeats === 0
                    ? "Event Full"
                    : "Register Now"}

                {availableSeats > 0 && !registering && (
                    <ArrowUpRight size={17} />
                )}
            </button>
        </div>
    );
}

export default EventCard;