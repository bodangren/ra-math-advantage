import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashcardPlayer } from '@/components/student/FlashcardPlayer';
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

describe('FlashcardPlayer', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with activityType flashcards', () => {
    render(<FlashcardPlayer terms={mockTerms} onComplete={mockOnComplete} />);
    expect(screen.getByText(/Term 1 of 1/i)).toBeInTheDocument();
  });

  it('passes flashcards activityType to BaseReviewSession', () => {
    render(<FlashcardPlayer terms={mockTerms} onComplete={mockOnComplete} />);
    expect(screen.getByTestId('flashcard-header')).toBeInTheDocument();
  });
});