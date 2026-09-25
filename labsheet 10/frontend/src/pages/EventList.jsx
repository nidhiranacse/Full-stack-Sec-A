import {
    useEffect
} from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    fetchEvents,
    rsvpToEvent,
    setSearch
} from '../features/events/eventsSlice';


export default function EventList() {

    const dispatch =
        useDispatch();


    const {
        items,
        page,
        totalPages,
        search,
        status
    } =
        useSelector(
            (state) =>
                state.events
        );


    const user =
        useSelector(
            (state) =>
                state.auth.user
        );


    useEffect(
        () => {

            dispatch(
                fetchEvents({
                    page: 1,
                    search
                })
            );

        },
        [search, dispatch]
    );


    return (
        <div>

            <h2>
                Campus Events
            </h2>


            <input
                aria-label="search-events"
                placeholder="Search by title..."
                value={search}
                onChange={
                    (e) =>
                        dispatch(
                            setSearch(
                                e.target.value
                            )
                        )
                }
            />


            {status === 'loading' && (
                <p>
                    Loading events...
                </p>
            )}


            <div className="event-list">

                {items.length === 0 &&
                    status !== 'loading' && (
                        <p>
                            No events found.
                        </p>
                    )}


                {items.map(
                    (event) => (

                        <div
                            className="event-card"
                            key={
                                event._id
                            }
                        >

                            <h3>
                                {
                                    event.title
                                }
                            </h3>

                            <p>
                                {
                                    event.description
                                }
                            </p>

                            <p>
                                📅{' '}
                                {
                                    new Date(
                                        event.date
                                    ).toLocaleDateString()
                                }
                            </p>

                            <p>
                                📍{' '}
                                {
                                    event.venue
                                }
                            </p>


                            {user?.role ===
                                'STUDENT' && (

                                <button
                                    onClick={
                                        () =>
                                            dispatch(
                                                rsvpToEvent(
                                                    event._id
                                                )
                                            )
                                    }
                                >
                                    RSVP
                                </button>
                            )}

                        </div>
                    )
                )}

            </div>


            <div className="pagination">

                <button
                    disabled={
                        page <= 1
                    }
                    onClick={() =>
                        dispatch(
                            fetchEvents({
                                page:
                                    page - 1,
                                search
                            })
                        )
                    }
                >
                    Previous
                </button>


                <span>
                    Page {page} of {totalPages}
                </span>


                <button
                    disabled={
                        page >=
                        totalPages
                    }
                    onClick={() =>
                        dispatch(
                            fetchEvents({
                                page:
                                    page + 1,
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