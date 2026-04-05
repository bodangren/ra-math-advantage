import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('LandingPage', () => {
  it('renders hero section with course title', async () => {
    const { default: LandingPage } = await import('@/app/page');
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/integrated math 3/i);
  });

  it('renders curriculum stats', async () => {
    const { default: LandingPage } = await import('@/app/page');
    render(<LandingPage />);
    expect(screen.getByText(/9 modules/i)).toBeInTheDocument();
    expect(screen.getByText(/52 lessons/i)).toBeInTheDocument();
  });
});
