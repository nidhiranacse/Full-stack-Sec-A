import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAnnouncements', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/announcements');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load announcements');
  }
});

export const publishAnnouncement = createAsyncThunk('announcements/publish', async (announcementData, { rejectWithValue }) => {
  try {
    const res = await api.post('/announcements', announcementData);
    return res.data.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to publish';
    return rejectWithValue(message);
  }
});

const announcementSlice = createSlice({
  name: 'announcements',
  initialState: {
    items: [],
    unreadCount: 0,
    toasts: [],
    loading: false,
    error: null
  },
  reducers: {
    // Real-time notification received via Socket.io
    addAnnouncementRealtime: (state, action) => {
      const newAnnouncement = action.payload;
      // Prepend to list if not duplicate
      if (!state.items.some((item) => item._id === newAnnouncement._id)) {
        state.items.unshift(newAnnouncement);
      }
      state.unreadCount += 1;
      // Add toast notification
      state.toasts.push({
        id: `toast-${Date.now()}-${Math.random()}`,
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        priority: newAnnouncement.priority,
        timestamp: new Date().toLocaleTimeString()
      });
    },
    markAllRead: (state) => {
      state.unreadCount = 0;
    },
    dismissToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(publishAnnouncement.fulfilled, (state, action) => {
        if (!state.items.some((item) => item._id === action.payload._id)) {
          state.items.unshift(action.payload);
        }
      });
  }
});

export const { addAnnouncementRealtime, markAllRead, dismissToast } = announcementSlice.actions;
export default announcementSlice.reducer;
