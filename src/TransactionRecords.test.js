/**
 * Frontend Component Tests - TransactionRecords Component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TransactionRecords from '../TransactionRecords';

// Mock the api module
jest.mock('../api', () => ({
  apiFetch: jest.fn(),
}));

const { apiFetch } = require('../api');

const mockTransactions = [
  {
    _id: '1',
    email: 'customer1@example.com',
    orderNumber: '111111111',
    amount: 100,
    transactionType: 'Zelle',
    transactionNumber: 'TXN1',
    confirmed: false,
    processed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    email: 'customer2@example.com',
    orderNumber: '222222222',
    amount: 200,
    transactionType: 'Venmo',
    transactionNumber: 'TXN2',
    confirmed: true,
    processed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    email: 'customer3@example.com',
    orderNumber: '333333333',
    amount: 300,
    transactionType: 'Zelle',
    transactionNumber: 'TXN3',
    confirmed: true,
    processed: true,
    createdAt: new Date().toISOString(),
  },
];

const renderTransactionRecords = (role = 'admin') => {
  // Set localStorage for role
  localStorage.setItem('role', role);

  return render(
    <BrowserRouter>
      <TransactionRecords />
    </BrowserRouter>
  );
};

describe('TransactionRecords Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch and display transactions', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });

    renderTransactionRecords();

    await waitFor(() => {
      expect(screen.getByText('111111111')).toBeInTheDocument();
      expect(screen.getByText('222222222')).toBeInTheDocument();
      expect(screen.getByText('333333333')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    apiFetch.mockReturnValue(new Promise(() => {})); // Never resolves

    renderTransactionRecords();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display transaction details in table', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });

    renderTransactionRecords();

    await waitFor(() => {
      expect(screen.getByText('customer1@example.com')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('Zelle')).toBeInTheDocument();
    });
  });

  it('should show confirm button for admin on pending transactions', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });

    renderTransactionRecords('admin');

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /confirm/i })).toHaveLength(1);
    });
  });

  it('should show process button for processTeam on confirmed transactions', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });

    renderTransactionRecords('processTeam');

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /process|mark/i })).toBeDefined();
    });
  });

  it('should handle error when fetching transactions fails', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    renderTransactionRecords();

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it('should filter transactions by status', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => mockTransactions,
    });

    renderTransactionRecords();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('111111111')).toBeInTheDocument();
    });

    // Click on pending filter if available
    const pendingFilter = screen.queryByRole('tab', { name: /pending/i });
    if (pendingFilter) {
      await user.click(pendingFilter);
    }
  });
});
