import axios from "axios";

// Lab Sheet 9 — Saiyed Shizain: token held in module memory (never localStorage).
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
