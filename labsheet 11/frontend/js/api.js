// ============================================
// API Helper - Handles all API calls
// ============================================
const API_BASE = (window.location.protocol.startsWith('http') && window.location.port === '5000')
    ? `${window.location.origin}/api`
    : (window.location.protocol.startsWith('http') && !window.location.port) 
        ? `${window.location.origin}/api`
        : 'http://localhost:5000/api';

// Generic fetch wrapper with auth header
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('cc_token');
    
    const defaultHeaders = {};
    
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        }
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Please make sure the backend is running.');
        }
        throw error;
    }
}

// ---- Auth API ----
const AuthAPI = {
    register: (name, email, password) => 
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        }),
    
    login: (email, password) => 
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
    
    getProfile: () => 
        apiRequest('/auth/me')
};

// ---- Events API ----
const EventsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/events?${query}`);
    },
    
    getById: (id) => 
        apiRequest(`/events/${id}`),
    
    create: (eventData) => 
        apiRequest('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        }),
    
    update: (id, eventData) => 
        apiRequest(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        }),
    
    delete: (id) => 
        apiRequest(`/events/${id}`, { method: 'DELETE' }),
    
    getRegistrations: (id) => 
        apiRequest(`/events/${id}/registrations`)
};

// ---- Registrations API ----
const RegistrationsAPI = {
    register: (eventId) => 
        apiRequest(`/registrations/${eventId}`, { method: 'POST' }),
    
    unregister: (eventId) => 
        apiRequest(`/registrations/${eventId}`, { method: 'DELETE' }),
    
    myEvents: () => 
        apiRequest('/registrations/my-events'),
    
    check: (eventId) => 
        apiRequest(`/registrations/check/${eventId}`)
};

// ---- Resources API ----
const ResourcesAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/resources?${query}`);
    },
    
    upload: (formData) => 
        apiRequest('/resources', {
            method: 'POST',
            body: formData
        }),
    
    delete: (id) => 
        apiRequest(`/resources/${id}`, { method: 'DELETE' }),
    
    getDownloadUrl: (id) => 
        `${API_BASE}/resources/download/${id}`
};

// ---- Admin API ----
const AdminAPI = {
    getStats: () => 
        apiRequest('/admin/stats'),
    
    getUsers: () => 
        apiRequest('/admin/users')
};
