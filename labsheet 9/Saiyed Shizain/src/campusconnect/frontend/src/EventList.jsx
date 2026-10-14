import { useEffect, useState } from "react";
import api from "./api.js";

// Event list with search + pagination + RSVP against the Lab 9 API.
export default function EventList({ token }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  async function load(p = page, s = search) {
    const { data } = await api.get("/events", { params: { page: p, limit: 10, search: s } });
    setItems(data.items);
    setPage(data.page);
    setTotalPages(data.totalPages);
  }

  useEffect(() => {
    load(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, token]);

  async function rsvp(id) {
    await api.post(`/events/${id}/rsvp`);
    load();
  }

  return (
    <div>
      <h2>Campus Events</h2>
      <input
        aria-label="search-events"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul data-testid="event-list">
        {items.map((event) => (
          <li key={event._id}>
            <strong>{event.title}</strong> — {new Date(event.date).toLocaleDateString()}
            <button onClick={() => rsvp(event._id)}>RSVP</button>
          </li>
        ))}
      </ul>
      <div>
        <button disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</button>
      </div>
    </div>
  );
}
