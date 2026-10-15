import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchEvents,
  rsvpToEvent,
  setSearch
} from '../features/events/eventsSlice';

export default function EventList() {
  const dispatch = useDispatch();

  const {
    items,
    page,
    totalPages,
    search,
    status
  } = useSelector((state) => state.events);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(
      fetchEvents({
        page: 1,
        search
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <h2>Campus Events</h2>

      <input
        aria-label="search-events"
        placeholder="Search by title..."
        value={search}
        onChange={(e) =>
          dispatch(setSearch(e.target.value))
        }
      />

      {status === 'loading' && (
        <p>Loading events...</p>
      )}

      <ul data-testid="event-list">
        {items.map((event) => (
          <li key={event._id}>
            <strong>{event.title}</strong>
            {' — '}
            {new Date(event.date).toLocaleDateString()}

            {user?.role === 'STUDENT' && (
              <button
                onClick={() =>
                  dispatch(rsvpToEvent(event._id))
                }
              >
                RSVP
              </button>
            )}
          </li>
        ))}
      </ul>

      <div>
        <button
          disabled={page <= 1}
          onClick={() =>
            dispatch(
              fetchEvents({
                page: page - 1,
                search
              })
            )
          }
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() =>
            dispatch(
              fetchEvents({
                page: page + 1,
                search
              })
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}