import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivitySkeleton } from '@/components/lesson/ActivitySkeleton';

describe('ActivitySkeleton', () => {
  it('renders skeleton container', () => {
    render(<ActivitySkeleton />);
    expect(screen.getByTestId('activity-skeleton')).toBeInTheDocument();
  });

  it('renders activity content placeholder', () => {
    render(<ActivitySkeleton />);
    expect(screen.getByTestId('skeleton-activity-content')).toBeInTheDocument();
  });
});
