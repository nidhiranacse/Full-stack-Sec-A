import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchEvents = createAsyncThunk('events/fetch', async ({ page = 1, search = '' }) => {
  const res = await api.get('/events', { params: { page, limit: 4, search } });
  return { ...res.data, cache: res.headers['x-cache'] };
});
export const createEvent = createAsyncThunk('events/create', async (body) => (await api.post('/events', body)).data);
export const deleteEvent = createAsyncThunk('events/delete', async (id) => { await api.delete(`/events/${id}`); return id; });
export const toggleRsvp = createAsyncThunk('events/rsvp', async (id) => (await api.post(`/events/${id}/rsvp`)).data);
export const postAnnouncement = createAsyncThunk('events/announce', async (body) => (await api.post('/announcements', body)).data);

const slice = createSlice({
  name: 'events',
  initialState: { items: [], total: 0, page: 1, pages: 1, search: '', cache: null, loading: false, unread: 0, notifications: [] },
  reducers: {
    setSearch: (s, a) => { s.search = a.payload; s.page = 1; },
    setPage: (s, a) => { s.page = a.payload; },
    announcementReceived: (s, a) => { s.notifications.unshift(a.payload); s.unread += 1; },
    clearUnread: (s) => { s.unread = 0; },
    dismissNotification: (s, a) => { s.notifications = s.notifications.filter((n) => n._id !== a.payload); },
  },
  extraReducers: (b) => {
    b.addCase(fetchEvents.pending, (s) => { s.loading = true; })
     .addCase(fetchEvents.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.items; s.total = a.payload.total; s.pages = a.payload.pages; s.page = a.payload.page; s.cache = a.payload.cache; })
     .addCase(fetchEvents.rejected, (s) => { s.loading = false; });
  },
});
export const { setSearch, setPage, announcementReceived, clearUnread, dismissNotification } = slice.actions;
export default slice.reducer;
