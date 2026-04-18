import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => key === 'error' ? 'test-error' : null }),
}));

describe('AuthErrorPage', () => {
  it('renders error message from search params', async () => {
    const { default: AuthErrorPage } = await import('@/app/auth/error/page');
    render(React.createElement(AuthErrorPage));
    expect(screen.getByText(/test-error/i)).toBeInTheDocument();
  });

  it('renders link back to login', async () => {
    const { default: AuthErrorPage } = await import('@/app/auth/error/page');
    render(React.createElement(AuthErrorPage));
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument();
  });
});
