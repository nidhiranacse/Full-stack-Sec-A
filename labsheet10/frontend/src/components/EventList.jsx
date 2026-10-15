import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/events",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setEvents(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (token) loadEvents();
  }, [token]);

  return (
    <div>
      <h2>Campus Events</h2>

      {events.map((event) => (
        <div key={event._id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>{event.location}</p>
        </div>
      ))}
    </div>
  );
}