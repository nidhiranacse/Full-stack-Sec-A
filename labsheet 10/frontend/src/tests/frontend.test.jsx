import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

import authReducer from '../store/authSlice';
import eventReducer from '../store/eventSlice';
import announcementReducer from '../store/announcementSlice';
import api from '../api/axios';

import Login from '../pages/Login';
import Events from '../pages/Events';

// Mock the axios client api
vi.mock('../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    },
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(),
    registerAuthCallbacks: vi.fn()
  };
});

// Helper to render with fresh Redux store and router
const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        events: eventReducer,
        announcements: announcementReducer
      },
      preloadedState
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

describe('CampusConnect Frontend Component Tests (Lab Sheet 10 - Task 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Login Form rendering and toggling to Register
  it('1. Renders Login form with email/password and allows toggling to Register form', () => {
    renderWithProviders(<Login />);

    // Verify Login elements are rendered
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/College Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    // Toggle to Register
    const toggleButton = screen.getByRole('button', { name: /Create one/i });
    fireEvent.click(toggleButton);

    // Verify Register-specific fields appear
    expect(screen.getByRole('heading', { name: /Join CampusConnect/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Account/i })).toBeInTheDocument();
  });

  // Test 2: Event List renders with search input and category filter chips
  it('2. Renders Event List with search input and category filter chips', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [],
        pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
        cache: 'HIT'
      }
    });

    const preloadedState = {
      auth: {
        user: { id: 'user-1', name: 'Sam Student', role: 'STUDENT' },
        isAuthenticated: true
      },
      events: {
        items: [],
        pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
        cacheStatus: 'HIT',
        loading: false,
        searchQuery: '',
        selectedCategory: 'ALL'
      },
      announcements: { items: [], unreadCount: 0, toasts: [] }
    };

    renderWithProviders(<Events />, { preloadedState });

    // Verify main page elements
    expect(screen.getByRole('heading', { name: /Campus Events/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search events by title/i)).toBeInTheDocument();

    // Verify Category filter chips are present
    expect(screen.getByRole('button', { name: 'ACADEMIC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'WORKSHOP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SPORTS' })).toBeInTheDocument();

    // Verify Redis cache indicator is displayed
    expect(screen.getByText(/Redis HIT/i)).toBeInTheDocument();
  });

  // Test 3: Event cards rendering with RSVP button and details
  it('3. Renders event cards with title, venue, and interactive RSVP button', async () => {
    const mockEvents = [
      {
        _id: 'event-101',
        title: 'Full Stack Web Dev Workshop',
        description: 'Hands-on React, Node.js, and Redis caching lab.',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Lab Room 302',
        category: 'WORKSHOP',
        capacity: 40,
        rsvpUsers: ['user-99'],
        createdBy: { name: 'Admin Dean' }
      }
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: mockEvents,
        pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
        cache: 'HIT'
      }
    });

    const preloadedState = {
      auth: {
        user: { id: 'user-1', name: 'Sam Student', role: 'STUDENT' },
        isAuthenticated: true
      },
      events: {
        items: mockEvents,
        pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
        cacheStatus: 'HIT',
        loading: false,
        searchQuery: '',
        selectedCategory: 'ALL'
      },
      announcements: { items: [], unreadCount: 0, toasts: [] }
    };

    renderWithProviders(<Events />, { preloadedState });

    // Wait for the mocked API response to resolve and render
    await waitFor(() => {
      expect(screen.getByText('Full Stack Web Dev Workshop')).toBeInTheDocument();
    });

    expect(screen.getByText('Lab Room 302')).toBeInTheDocument();
    expect(screen.getByText(/Capacity: 1 \/ 40 attendees/i)).toBeInTheDocument();

    // Verify RSVP button
    const rsvpButton = screen.getByRole('button', { name: /RSVP for Full Stack Web Dev Workshop/i });
    expect(rsvpButton).toBeInTheDocument();
    expect(rsvpButton).toHaveTextContent(/RSVP Now/i);
  });
});
