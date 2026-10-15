import axios from 'axios';

import { store } from '../app/store';
import {
  setAccessToken,
  clearAuth
} from '../features/auth/authSlice';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const original = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry
    ) {
      original._retry = true;

      try {
        refreshing =
          refreshing || api.post('/auth/refresh');

        const { data } = await refreshing;

        refreshing = null;

        store.dispatch(
          setAccessToken(data.accessToken)
        );

        original.headers.Authorization =
          `Bearer ${data.accessToken}`;

        return api(original);
      } catch (refreshErr) {
        refreshing = null;
        store.dispatch(clearAuth());
      }
    }

    return Promise.reject(error);
  }
);

export default api;