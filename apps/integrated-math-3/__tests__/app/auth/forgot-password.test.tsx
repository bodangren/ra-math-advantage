import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe('ForgotPasswordPage', () => {
  it('renders informational message about contacting teacher', async () => {
    const { default: ForgotPasswordPage } = await import('@/app/auth/forgot-password/page');
    render(React.createElement(ForgotPasswordPage));
    expect(screen.getByText(/contact your teacher/i)).toBeInTheDocument();
  });

  it('has a link back to login', async () => {
    const { default: ForgotPasswordPage } = await import('@/app/auth/forgot-password/page');
    render(React.createElement(ForgotPasswordPage));
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument();
  });
});
