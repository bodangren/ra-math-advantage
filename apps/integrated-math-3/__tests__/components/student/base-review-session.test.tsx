import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseReviewSession } from '@/components/student/BaseReviewSession';
import type { GlossaryTerm } from '@/lib/study/types';

const TEST_TERM: GlossaryTerm = {
  slug: 'quadratic-function',
  term: 'Quadratic Function',
  definition: 'A function of the form f(x) = ax² + bx + c where a ≠ 0.',
  modules: [1],
  topics: ['quadratic-functions'],
  synonyms: ['second-degree polynomial'],
  related: ['parabola'],
};

const mockTerms: GlossaryTerm[] = [
  TEST_TERM,
  {
    slug: 'parabola',
    term: 'Parabola',
    definition: 'The U-shaped graph of a quadratic function.',
    modules: [1],
    topics: ['quadratic-functions'],
    synonyms: [],
    related: ['quadratic-function'],
  },
];

describe('BaseReviewSession', () => {
  const mockOnComplete = vi.fn();
  const mockRenderHeader = vi.fn(() => <div>Test Header</div>);
  const defaultProps = {
    activityType: 'flashcards' as const,
    terms: mockTerms,
    renderHeader: mockRenderHeader,
    noTermsTitle: 'No Terms',
    noTermsMessage: 'There are no terms to review.',
    onComplete: mockOnComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when terms array is empty', () => {
    render(<BaseReviewSession {...defaultProps} terms={[]} />);
    expect(screen.getByText('No Terms')).toBeInTheDocument();
    expect(screen.getByText('There are no terms to review.')).toBeInTheDocument();
  });

  it('renders prompt state with first term', () => {
    render(<BaseReviewSession {...defaultProps} />);
    expect(screen.getByText('quadratic-function')).toBeInTheDocument();
    expect(screen.queryByText('A function of the form')).not.toBeInTheDocument();
  });

  it('flips card to reveal definition on click', () => {
    render(<BaseReviewSession {...defaultProps} />);
    const termLabel = screen.getByText('quadratic-function');
    fireEvent.click(termLabel);
    expect(screen.getByText('A function of the form f(x) = ax² + bx + c where a ≠ 0.')).toBeInTheDocument();
  });

  it('shows rating buttons after flip', () => {
    render(<BaseReviewSession {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Again/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('quadratic-function'));
    expect(screen.getByRole('button', { name: /Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Easy/i })).toBeInTheDocument();
  });

  it('advances to next card after rating', () => {
    render(<BaseReviewSession {...defaultProps} />);
    fireEvent.click(screen.getByText('quadratic-function'));
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(screen.getByText('parabola')).toBeInTheDocument();
  });

  it('shows completion screen when all terms reviewed', () => {
    render(<BaseReviewSession {...defaultProps} />);
    fireEvent.click(screen.getByText('quadratic-function'));
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    fireEvent.click(screen.getByText('parabola'));
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(screen.getByText('Review Complete')).toBeInTheDocument();
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        itemsSeen: 2,
        itemsCorrect: expect.any(Number),
        itemsIncorrect: expect.any(Number),
      })
    );
  });

  it('calls renderHeader with current index and total', () => {
    render(<BaseReviewSession {...defaultProps} />);
    expect(mockRenderHeader).toHaveBeenCalledWith(1, 2);
    fireEvent.click(screen.getByText('quadratic-function'));
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(mockRenderHeader).toHaveBeenCalledWith(2, 2);
  });

  it('tracks correct/incorrect counts based on rating', () => {
    render(<BaseReviewSession {...defaultProps} />);
    fireEvent.click(screen.getByText('quadratic-function'));
    fireEvent.click(screen.getByRole('button', { name: /Again/i }));
    fireEvent.click(screen.getByText('parabola'));
    fireEvent.click(screen.getByRole('button', { name: /Easy/i }));
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        itemsSeen: 2,
        itemsCorrect: 1,
        itemsIncorrect: 1,
      })
    );
  });
});