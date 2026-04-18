import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonSkeleton } from '@/components/lesson/LessonSkeleton';

describe('LessonSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<LessonSkeleton />);
    expect(screen.getByTestId('lesson-skeleton')).toBeInTheDocument();
  });

  it('renders phase stepper skeleton', () => {
    render(<LessonSkeleton />);
    const stepperSkeletons = screen.getAllByTestId('skeleton-stepper-dot');
    expect(stepperSkeletons.length).toBeGreaterThan(0);
  });

  it('renders content area skeleton', () => {
    render(<LessonSkeleton />);
    expect(screen.getByTestId('skeleton-content')).toBeInTheDocument();
  });

  it('renders phase complete button skeleton', () => {
    render(<LessonSkeleton />);
    expect(screen.getByTestId('skeleton-complete-btn')).toBeInTheDocument();
  });

  it('has correct number of phase dots based on prop', () => {
    render(<LessonSkeleton phaseCount={5} />);
    const stepperSkeletons = screen.getAllByTestId('skeleton-stepper-dot');
    expect(stepperSkeletons).toHaveLength(5);
  });
});
