import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import events from './eventSlice';
export const makeStore = (preloaded) => configureStore({ reducer: { auth, events }, preloadedState: preloaded });
export const store = makeStore();
