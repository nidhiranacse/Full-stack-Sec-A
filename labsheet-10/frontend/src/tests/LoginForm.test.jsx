import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

const renderLoginPage = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('LoginPage Component Tests (Lab Sheet 10 - Task 6)', () => {
  it('1. Renders the login form with email, password inputs, and submit button', () => {
    renderLoginPage();

    expect(screen.getByText(/Welcome to CampusConnect/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@campus\.edu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('2. Updates email and password inputs as user types', () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/you@campus\.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'student@campus.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });

    expect(emailInput.value).toBe('student@campus.edu');
    expect(passwordInput.value).toBe('Password123');
  });

  it('3. Populates credentials when Admin Demo fast fill button is clicked', () => {
    renderLoginPage();

    const adminBtn = screen.getByRole('button', { name: /Fill Admin Demo/i });
    fireEvent.click(adminBtn);

    const emailInput = screen.getByPlaceholderText(/you@campus\.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    expect(emailInput.value).toBe('admin@campus.edu');
    expect(passwordInput.value).toBe('AdminPassword123');
  });
});
