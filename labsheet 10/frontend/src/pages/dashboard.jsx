import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    clearAuth
} from '../features/auth/authSlice';

import {
    clearAnnouncementBadge
} from '../features/events/eventsSlice';

import api from '../api/axios';

import EventList
    from './EventList';


export default function Dashboard() {

    const dispatch =
        useDispatch();


    const user =
        useSelector(
            (state) =>
                state.auth.user
        );


    const unread =
        useSelector(
            (state) =>
                state.events
                    .unreadAnnouncements
        );


    async function logout() {

        try {
            await api.post(
                '/auth/logout'
            );
        } catch (error) {
            console.log(error);
        }


        dispatch(
            clearAuth()
        );
    }


    async function createAnnouncement() {

        const title =
            prompt(
                'Announcement title:'
            );


        const body =
            prompt(
                'Announcement message:'
            );


        if (!title || !body) {
            return;
        }


        try {

            await api.post(
                '/announcements',
                {
                    title,
                    body
                }
            );


            alert(
                'Announcement created successfully.'
            );

        } catch (error) {

            alert(
                error.response?.data?.error ||
                'Unable to create announcement'
            );
        }
    }


    return (
        <div className="dashboard">

            <header>

                <div>

                    <h1>
                        CampusConnect
                    </h1>

                    <p>
                        Welcome, {
                            user?.name
                        }
                    </p>

                </div>


                <div>

                    <span>
                        Role: {
                            user?.role
                        }
                    </span>


                    {unread > 0 && (
                        <button
                            onClick={() =>
                                dispatch(
                                    clearAnnouncementBadge()
                                )
                            }
                        >
                            🔔 {unread}
                        </button>
                    )}


                    <button
                        onClick={
                            logout
                        }
                    >
                        Logout
                    </button>

                </div>

            </header>


            {user?.role ===
                'ADMIN' && (

                <section className="admin-panel">

                    <h2>
                        Admin Panel
                    </h2>

                    <p>
                        Create announcements for students.
                    </p>

                    <button
                        onClick={
                            createAnnouncement
                        }
                    >
                        Create Announcement
                    </button>

                </section>
            )}


            <main>

                <EventList />

            </main>

        </div>
    );
}