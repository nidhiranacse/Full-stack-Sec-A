import axios from "axios";

const API = axios.create({
    baseURL: "/api"
});

// Request interceptor to inject JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("campusconnect_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthenticated 401s
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If token is invalid or expired, clear and let user re-login
            if (localStorage.getItem("campusconnect_token")) {
                localStorage.removeItem("campusconnect_token");
                localStorage.removeItem("campusconnect_user");
            }
        }
        return Promise.reject(error);
    }
);

export default API;
