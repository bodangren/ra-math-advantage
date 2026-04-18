import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('LandingPage', () => {
  it('renders hero section with course title', async () => {
    const { default: LandingPage } = await import('@/app/page');
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('IM3');
    expect(screen.getByText(/Integrated Mathematics 3/i)).toBeInTheDocument();
  });

  it('renders curriculum stats', async () => {
    const { default: LandingPage } = await import('@/app/page');
    render(<LandingPage />);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
  });
});
