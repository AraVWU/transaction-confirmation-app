/**
 * Frontend Component Tests - Login Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock the api module
jest.mock('../api', () => ({
  apiFetch: jest.fn(),
}));

const { apiFetch } = require('../api');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
  });

  it('should update email field on input', async () => {
    renderLogin();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@vapewholesaleusa.com');

    expect(emailInput).toHaveValue('test@vapewholesaleusa.com');
  });

  it('should update password field on input', async () => {
    renderLogin();
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'mypassword');

    expect(passwordInput).toHaveValue('mypassword');
  });

  it('should call login API on form submit', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@vapewholesaleusa.com', role: 'admin' }),
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@vapewholesaleusa.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login|sign in/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@vapewholesaleusa.com',
          password: 'password123',
        }),
      });
    });
  });

  it('should display error message on login failure', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'wrong@vapewholesaleusa.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login|sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid|error/i)).toBeInTheDocument();
    });
  });

  it('should have link to registration page', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /register|sign up/i })).toBeInTheDocument();
  });

  it('should have link to forgot password page', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /forgot|reset/i })).toBeInTheDocument();
  });
});
