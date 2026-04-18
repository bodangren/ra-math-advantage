import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mockSignIn = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      user: null,
      profile: null,
    });
  });

  it('renders username and password fields', async () => {
    const { default: LoginPage } = await import('@/app/auth/login/page');
    render(React.createElement(LoginPage));
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    const { default: LoginPage } = await import('@/app/auth/login/page');
    render(React.createElement(LoginPage));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls signIn on form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    const { default: LoginPage } = await import('@/app/auth/login/page');
    render(React.createElement(LoginPage));

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('alice', 'password123');
    });
  });

  it('shows error on failed sign in', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
    const { default: LoginPage } = await import('@/app/auth/login/page');
    render(React.createElement(LoginPage));

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
