import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "../services/axios";

import {
  setEvents,
  setLoading,
  setError,
} from "../redux/eventSlice";

function Events() {
  const dispatch = useDispatch();

  const {
    events,
    loading,
    error,
    page,
    totalPages,
  } = useSelector((state) => state.events);

  const user = useSelector((state) => state.auth.user);

  const [search, setSearch] = useState("");

  const fetchEvents = async (currentPage = 1) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await api.get(
        `/events?page=${currentPage}&search=${search}`
      );

      dispatch(
        setEvents({
          events: response.data.events,
          page: response.data.page,
          totalPages: response.data.totalPages,
        })
      );

    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
          "Unable to load events"
        )
      );

    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(1);
  };

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`);

      alert("RSVP successful!");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "RSVP failed"
      );
    }
  };

  return (
    <div>
      <h1>CampusConnect Events</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search event by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      <br />

      {loading && <p>Loading events...</p>}

      {error && <p>{error}</p>}

      {!loading && events.length === 0 && (
        <p>No events found.</p>
      )}

      {events.map((event) => (
        <div key={event._id}>
          <h2>{event.title}</h2>

          <p>{event.description}</p>

          <p>
            Date: {event.date}
          </p>

          {user?.role === "STUDENT" && (
            <button
              onClick={() => handleRSVP(event._id)}
            >
              RSVP
            </button>
          )}

          <hr />
        </div>
      ))}

      <button
        disabled={page <= 1}
        onClick={() => fetchEvents(page - 1)}
      >
        Previous
      </button>

      <span>
        {" "} Page {page} of {totalPages} {" "}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => fetchEvents(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Events;