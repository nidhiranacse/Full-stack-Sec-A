import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 9, search = '', category = 'ALL' } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category !== 'ALL' && { category })
    });

    const res = await api.get(`/events?${queryParams.toString()}`);
    return {
      data: res.data.data,
      pagination: res.data.pagination,
      cache: res.data.cache
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
  }
});

export const createNewEvent = createAsyncThunk('events/createNewEvent', async (eventData, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post('/events', eventData);
    dispatch(fetchEvents());
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create event';
    return rejectWithValue(message);
  }
});

export const updateExistingEvent = createAsyncThunk('events/updateEvent', async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.put(`/events/${id}`, data);
    dispatch(fetchEvents());
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update event';
    return rejectWithValue(message);
  }
});

export const removeEvent = createAsyncThunk('events/removeEvent', async (id, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.delete(`/events/${id}`);
    dispatch(fetchEvents());
    return { id, message: res.data.message };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete event');
  }
});

export const rsvpToEvent = createAsyncThunk('events/rsvpToEvent', async (id, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post(`/events/${id}/rsvp`);
    dispatch(fetchEvents());
    return { id, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to RSVP');
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 9,
      total: 0,
      totalPages: 1
    },
    cacheStatus: null,
    loading: false,
    actionLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: 'ALL'
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearEventError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
        state.cacheStatus = action.payload.cache;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Actions
      .addCase(createNewEvent.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createNewEvent.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createNewEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(rsvpToEvent.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rsvpToEvent.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(rsvpToEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchQuery, setSelectedCategory, clearEventError } = eventSlice.actions;
export default eventSlice.reducer;
