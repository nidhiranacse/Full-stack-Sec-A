import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAccessToken } from '../api';

const errMsg = (e) => e.response?.data?.errors?.map((x) => x.message).join(', ') || e.response?.data?.message || e.message;

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try { const { data } = await api.post('/auth/login', creds); setAccessToken(data.accessToken); return data; }
  catch (e) { return rejectWithValue(errMsg(e)); }
});
export const register = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/auth/register', body); return data; }
  catch (e) { return rejectWithValue(errMsg(e)); }
});
// silent refresh using the httpOnly cookie - restores the session after a page reload
export const refresh = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try { const { data } = await api.post('/auth/refresh'); setAccessToken(data.accessToken); return data; }
  catch (e) { return rejectWithValue(errMsg(e)); }
});
export const logout = createAsyncThunk('auth/logout', async () => { await api.post('/auth/logout').catch(() => {}); setAccessToken(null); });

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, status: 'idle', error: null, checked: false },
  reducers: { clearError: (s) => { s.error = null; }, resetStatus: (s) => { s.status = 'idle'; } },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
     .addCase(login.fulfilled, (s, a) => { s.status = 'idle'; s.user = a.payload.user; s.token = a.payload.accessToken; })
     .addCase(login.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload; })
     .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
     .addCase(register.fulfilled, (s) => { s.status = 'registered'; })
     .addCase(register.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload; })
     .addCase(refresh.fulfilled, (s, a) => { s.user = a.payload.user; s.token = a.payload.accessToken; s.checked = true; })
     .addCase(refresh.rejected, (s) => { s.checked = true; })
     .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; });
  },
});
export const { clearError, resetStatus } = slice.actions;
export default slice.reducer;
