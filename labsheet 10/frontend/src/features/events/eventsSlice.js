import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';

import api
    from '../../api/axios';


export const fetchEvents =
    createAsyncThunk(
        'events/fetch',

        async ({
            page = 1,
            search = ''
        } = {}) => {

            const {
                data
            } =
                await api.get(
                    '/events',
                    {
                        params: {
                            page,
                            limit: 10,
                            search
                        }
                    }
                );

            return data;
        }
    );


export const rsvpToEvent =
    createAsyncThunk(
        'events/rsvp',

        async (eventId) => {

            const {
                data
            } =
                await api.post(
                    `/events/${eventId}/rsvp`
                );

            return data;
        }
    );


const eventsSlice =
    createSlice({

        name: 'events',

        initialState: {

            items: [],

            page: 1,

            totalPages: 1,

            search: '',

            status: 'idle',

            unreadAnnouncements: 0
        },


        reducers: {

            setSearch(
                state,
                action
            ) {

                state.search =
                    action.payload;
            },


            announcementReceived(
                state
            ) {

                state.unreadAnnouncements++;
            },


            clearAnnouncementBadge(
                state
            ) {

                state.unreadAnnouncements =
                    0;
            }
        },


        extraReducers:
            (builder) => {

                builder

                    .addCase(
                        fetchEvents.pending,
                        (state) => {

                            state.status =
                                'loading';
                        }
                    )

                    .addCase(
                        fetchEvents.fulfilled,
                        (
                            state,
                            action
                        ) => {

                            state.status =
                                'succeeded';

                            state.items =
                                action.payload.items;

                            state.page =
                                action.payload.page;

                            state.totalPages =
                                action.payload.totalPages;
                        }
                    )

                    .addCase(
                        fetchEvents.rejected,
                        (state) => {

                            state.status =
                                'failed';
                        }
                    )

                    .addCase(
                        rsvpToEvent.fulfilled,
                        (
                            state,
                            action
                        ) => {

                            const index =
                                state.items.findIndex(
                                    (event) =>
                                        event._id ===
                                        action.payload._id
                                );


                            if (index !== -1) {

                                state.items[index] =
                                    action.payload;
                            }
                        }
                    );
            }
    });


export const {
    setSearch,
    announcementReceived,
    clearAnnouncementBadge
} =
    eventsSlice.actions;


export default
    eventsSlice.reducer;