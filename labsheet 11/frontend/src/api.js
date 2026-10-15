// Author: Radha Pandey, CSE - CampusConnect
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token on a protected call -> log out
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function errMsg(err) {
  const d = err.response?.data;
  if (d?.details?.length) return d.details.join(', ');
  return d?.error || err.message || 'Something went wrong';
}

// Authenticated file download (needs the Bearer token, so no plain <a href>)
export async function downloadResource(r) {
  const res = await api.get(`/resources/${r.id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = r.originalName;
  a.click();
  URL.revokeObjectURL(url);
}

export default api;
