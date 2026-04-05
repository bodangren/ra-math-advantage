import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mockUseAuth = vi.fn();

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      profile: { role: 'student' },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
  });

  it('renders new password and confirm fields', async () => {
    const { default: UpdatePasswordPage } = await import('@/app/auth/update-password/page');
    render(React.createElement(UpdatePasswordPage));
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    const { default: UpdatePasswordPage } = await import('@/app/auth/update-password/page');
    render(React.createElement(UpdatePasswordPage));

    await user.type(screen.getByLabelText(/^new password/i), 'pass1');
    await user.type(screen.getByLabelText(/confirm/i), 'pass2');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });
  });
});
