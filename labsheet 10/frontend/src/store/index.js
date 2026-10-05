import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, logoutUser } from './authSlice';
import eventReducer from './eventSlice';
import announcementReducer from './announcementSlice';
import { registerAuthCallbacks } from '../api/axios';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    announcements: announcementReducer
  }
});

// Register Axios callbacks to keep Redux in sync when token is refreshed silently
registerAuthCallbacks({
  onRefresh: ({ accessToken, user }) => {
    store.dispatch(setCredentials({ accessToken, user }));
  },
  onLogout: () => {
    store.dispatch(logoutUser());
  }
});

export default store;
