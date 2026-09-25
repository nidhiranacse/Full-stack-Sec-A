import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';

import api
    from '../../api/axios';


export const login =
    createAsyncThunk(
        'auth/login',

        async (
            {
                email,
                password
            },
            {
                rejectWithValue
            }
        ) => {

            try {

                const {
                    data
                } =
                    await api.post(
                        '/auth/login',
                        {
                            email,
                            password
                        }
                    );


                return data;

            } catch (error) {

                return rejectWithValue(
                    error.response?.data?.error ||
                    'Login failed'
                );
            }
        }
    );


export const register =
    createAsyncThunk(
        'auth/register',

        async (
            payload,
            {
                rejectWithValue
            }
        ) => {

            try {

                const {
                    data
                } =
                    await api.post(
                        '/auth/register',
                        payload
                    );


                return data;

            } catch (error) {

                return rejectWithValue(
                    error.response?.data?.error ||
                    'Registration failed'
                );
            }
        }
    );


const authSlice =
    createSlice({

        name: 'auth',

        initialState: {
            user: null,
            accessToken: null,
            status: 'idle',
            error: null
        },


        reducers: {

            setAccessToken(
                state,
                action
            ) {

                state.accessToken =
                    action.payload;
            },


            clearAuth(state) {

                state.user = null;

                state.accessToken =
                    null;

                state.status =
                    'idle';

                state.error =
                    null;
            }
        },


        extraReducers:
            (builder) => {

                builder

                    .addCase(
                        login.pending,
                        (state) => {

                            state.status =
                                'loading';

                            state.error =
                                null;
                        }
                    )

                    .addCase(
                        login.fulfilled,
                        (
                            state,
                            action
                        ) => {

                            state.status =
                                'succeeded';

                            state.user =
                                action.payload.user;

                            state.accessToken =
                                action.payload.accessToken;
                        }
                    )

                    .addCase(
                        login.rejected,
                        (
                            state,
                            action
                        ) => {

                            state.status =
                                'failed';

                            state.error =
                                action.payload;
                        }
                    )

                    .addCase(
                        register.fulfilled,
                        (
                            state,
                            action
                        ) => {

                            state.user =
                                action.payload.user;

                            state.accessToken =
                                action.payload.accessToken;

                            state.status =
                                'succeeded';
                        }
                    )

                    .addCase(
                        register.rejected,
                        (
                            state,
                            action
                        ) => {

                            state.status =
                                'failed';

                            state.error =
                                action.payload;
                        }
                    );
            }
    });


export const {
    setAccessToken,
    clearAuth
} =
    authSlice.actions;


export default
    authSlice.reducer;