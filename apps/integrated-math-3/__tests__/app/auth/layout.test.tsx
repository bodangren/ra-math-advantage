import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'auth-provider' }, children),
}));

describe('AuthLayout', () => {
  it('renders children centered', async () => {
    const { default: AuthLayout } = await import('@/app/auth/layout');
    render(
      React.createElement(AuthLayout, null, React.createElement('div', { 'data-testid': 'child' }, 'Login form')),
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
