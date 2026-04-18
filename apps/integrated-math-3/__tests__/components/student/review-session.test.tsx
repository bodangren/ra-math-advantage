import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewSession } from '@/components/student/ReviewSession';
import type { GlossaryTerm } from '@/lib/study/types';

const mockTerms: GlossaryTerm[] = [
  {
    slug: 'quadratic-function',
    term: 'Quadratic Function',
    definition: 'A function of the form f(x) = ax² + bx + c where a ≠ 0.',
    modules: [1],
    topics: ['quadratic-functions'],
    synonyms: ['second-degree polynomial'],
    related: ['parabola'],
  },
];

describe('ReviewSession', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with srs_review activityType', () => {
    render(<ReviewSession terms={mockTerms} onComplete={mockOnComplete} />);
    expect(screen.getByText(/SRS Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Review terms due today/i)).toBeInTheDocument();
  });

  it('passes srs_review activityType to BaseReviewSession', () => {
    render(<ReviewSession terms={mockTerms} onComplete={mockOnComplete} />);
    expect(screen.getByTestId('review-header')).toBeInTheDocument();
  });
});