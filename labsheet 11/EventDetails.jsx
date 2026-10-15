import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function EventDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const fetchEvent = async () => {

        try {

            const response = await API.get(
                `/events/${id}`
            );

            setEvent(response.data.event);

        } catch (error) {

            setError(
                "Unable to load event"
            );
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const register = async () => {

        try {

            const response = await API.post(
                `/events/${id}/register`
            );

            setMessage(response.data.message);

            fetchEvent();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    const unregister = async () => {

        try {

            const response = await API.delete(
                `/events/${id}/register`
            );

            setMessage(response.data.message);

            fetchEvent();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unregistration failed"
            );
        }
    };

    if (!event) {
        return (
            <div className="page-container">
                <p>Loading...</p>
            </div>
        );
    }

    const isRegistered =
        user &&
        event.registeredStudents?.some(
            (student) =>
                student._id === user.id
        );

    return (
        <div className="details-container">

            <h1>{event.title}</h1>

            <span className="category">
                {event.category}
            </span>

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
                💺 Total Seats:
                {" "}
                {event.totalSeats}
            </p>

            <p>
                🪑 Available Seats:
                {" "}
                {event.availableSeats}
            </p>

            {message && (
                <p className="success">
                    {message}
                </p>
            )}

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            {!user ? (

                <button
                    onClick={() => navigate("/login")}
                >
                    Login to Register
                </button>

            ) : user.role === "student" ? (

                isRegistered ? (

                    <button
                        className="danger-btn"
                        onClick={unregister}
                    >
                        Unregister
                    </button>

                ) : (

                    <button
                        onClick={register}
                        disabled={
                            event.availableSeats === 0
                        }
                    >
                        {event.availableSeats === 0
                            ? "Seats Full"
                            : "Register for Event"}
                    </button>

                )

            ) : null}

        </div>
    );
}

export default EventDetails;