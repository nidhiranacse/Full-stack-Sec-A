import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-memory token store (Task 4: in-memory store preferred over localStorage for security)
let inMemoryAccessToken = null;

export const setAuthToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAuthToken = () => inMemoryAccessToken;

// Global callback reference to update Redux store on automatic silent token refresh
let onTokenRefreshed = null;
let onLogoutRequired = null;

export const registerAuthCallbacks = ({ onRefresh, onLogout }) => {
  onTokenRefreshed = onRefresh;
  onLogoutRequired = onLogout;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly refreshToken cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Auto-attach Bearer token from in-memory store
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & transparently refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop on refresh endpoint or if request already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh using httpOnly cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = refreshResponse.data;
        setAuthToken(accessToken);

        if (onTokenRefreshed) {
          onTokenRefreshed({ accessToken, user });
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAuthToken(null);
        if (onLogoutRequired) {
          onLogoutRequired();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
