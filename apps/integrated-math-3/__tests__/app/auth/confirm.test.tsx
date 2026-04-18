import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}));

describe('ConfirmPage', () => {
  it('renders confirmation message', async () => {
    const { default: ConfirmPage } = await import('@/app/auth/confirm/page');
    render(React.createElement(ConfirmPage));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome/i);
  });
});
