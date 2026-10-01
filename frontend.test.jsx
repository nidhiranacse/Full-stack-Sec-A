import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import api from '../api';
import Login from '../pages/Login';
import EventList from '../pages/EventList';
import PrivateRoute from '../components/PrivateRoute';
import { renderWithProviders } from './helpers';

const student = { id: 'u1', name: 'Stu', email: 's@x.com', role: 'STUDENT' };
const authed = { auth: { user: student, token: 't', status: 'idle', error: null, checked: true } };

afterEach(() => vi.restoreAllMocks());

test('1. Login form renders email, password fields and a Login button', () => {
  renderWithProviders(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('2. Login form shows the server error message on failed login', async () => {
  vi.spyOn(api, 'post').mockRejectedValue({ response: { data: { message: 'Invalid email or password' } } });
  renderWithProviders(<Login />);
  await userEvent.type(screen.getByLabelText(/email/i), 'bad@x.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
});

test('3. Event list renders events fetched from the API with RSVP buttons for students', async () => {
  vi.spyOn(api, 'get').mockResolvedValue({
    headers: { 'x-cache': 'MISS' },
    data: { items: [
      { _id: 'e1', title: 'Tech Fest', location: 'Auditorium', date: '2026-11-15', rsvps: [] },
      { _id: 'e2', title: 'Coding Contest', location: 'Lab 3', date: '2026-12-05', rsvps: ['u1'] },
    ], total: 2, page: 1, pages: 1 },
  });
  renderWithProviders(<EventList />, { preloadedState: authed });
  expect(await screen.findByText('Tech Fest')).toBeInTheDocument();
  expect(screen.getByText('Coding Contest')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'RSVP' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /going/i })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/Redis cache: MISS/)).toBeInTheDocument());
});

test('4. PrivateRoute redirects unauthenticated users to /login', () => {
  renderWithProviders(
    <Routes><Route path="/login" element={<h1>LOGIN PAGE</h1>} /><Route element={<PrivateRoute />}><Route path="/" element={<h1>SECRET</h1>} /></Route></Routes>,
    { preloadedState: { auth: { user: null, token: null, status: 'idle', error: null, checked: true } } });
  expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
});
