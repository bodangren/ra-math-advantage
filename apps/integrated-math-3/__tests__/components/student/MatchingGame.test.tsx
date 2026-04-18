import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MatchingGame } from '@/components/student/MatchingGame';
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
  {
    slug: 'parabola',
    term: 'Parabola',
    definition: 'The U-shaped graph of a quadratic function.',
    modules: [1],
    topics: ['quadratic-functions'],
    synonyms: [],
    related: ['quadratic-function'],
  },
  {
    slug: 'vertex',
    term: 'Vertex',
    definition: 'The highest or lowest point of a parabola.',
    modules: [1],
    topics: ['quadratic-functions'],
    synonyms: [],
    related: ['parabola'],
  },
  {
    slug: 'axis-of-symmetry',
    term: 'Axis of Symmetry',
    definition: 'The vertical line that divides a parabola into two mirror images.',
    modules: [1],
    topics: ['quadratic-functions'],
    synonyms: [],
    related: ['parabola'],
  },
  {
    slug: 'discriminant',
    term: 'Discriminant',
    definition: 'The value b² - 4ac in the quadratic formula.',
    modules: [1],
    topics: ['quadratic-equations'],
    synonyms: [],
    related: ['quadratic-formula'],
  },
  {
    slug: 'complex-number',
    term: 'Complex Number',
    definition: 'A number of the form a + bi where i² = -1.',
    modules: [1],
    topics: ['complex-numbers'],
    synonyms: [],
    related: ['imaginary-unit'],
  },
];

describe('MatchingGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a 3x4 grid of 12 cards from 6 terms', () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(12);
  });

  it('displays term and definition cards', () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    expect(screen.getByText('Quadratic Function')).toBeInTheDocument();
    expect(
      screen.getByText('A function of the form f(x) = ax² + bx + c where a ≠ 0.')
    ).toBeInTheDocument();
  });

  it('selects a card on click', () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    const cards = screen.getAllByRole('button');
    fireEvent.click(cards[0]);
    expect(cards[0]).toHaveAttribute('data-state', 'selected');
  });

  it('marks a matching pair as matched', async () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    const termCard = screen.getByText('Quadratic Function').closest('button');
    const defCard = screen
      .getByText('A function of the form f(x) = ax² + bx + c where a ≠ 0.')
      .closest('button');
    expect(termCard).toBeTruthy();
    expect(defCard).toBeTruthy();

    fireEvent.click(termCard!);
    fireEvent.click(defCard!);

    await waitFor(() => {
      expect(termCard).toHaveAttribute('data-state', 'matched');
      expect(defCard).toHaveAttribute('data-state', 'matched');
    });
  });

  it('shows wrong flash for non-matching pair then resets', async () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    const termCard = screen.getByText('Quadratic Function').closest('button');
    const wrongDef = screen.getByText('The U-shaped graph of a quadratic function.').closest('button');
    expect(termCard).toBeTruthy();
    expect(wrongDef).toBeTruthy();

    fireEvent.click(termCard!);
    fireEvent.click(wrongDef!);

    await waitFor(() => {
      expect(termCard).toHaveAttribute('data-state', 'wrong');
      expect(wrongDef).toHaveAttribute('data-state', 'wrong');
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(termCard).toHaveAttribute('data-state', 'idle');
      expect(wrongDef).toHaveAttribute('data-state', 'idle');
    });
  });

  it('shows completion screen and calls onComplete after all pairs matched', async () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);

    const pairs = [
      {
        term: 'Quadratic Function',
        def: 'A function of the form f(x) = ax² + bx + c where a ≠ 0.',
      },
      {
        term: 'Parabola',
        def: 'The U-shaped graph of a quadratic function.',
      },
      {
        term: 'Vertex',
        def: 'The highest or lowest point of a parabola.',
      },
      {
        term: 'Axis of Symmetry',
        def: 'The vertical line that divides a parabola into two mirror images.',
      },
      {
        term: 'Discriminant',
        def: 'The value b² - 4ac in the quadratic formula.',
      },
      {
        term: 'Complex Number',
        def: 'A number of the form a + bi where i² = -1.',
      },
    ];

    for (const pair of pairs) {
      const termCard = screen.getByText(pair.term).closest('button');
      const defCard = screen.getByText(pair.def).closest('button');
      fireEvent.click(termCard!);
      fireEvent.click(defCard!);
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/completion/i)).toBeInTheDocument();
    });

    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        itemsSeen: 6,
        itemsCorrect: 6,
        itemsIncorrect: 0,
        durationSeconds: expect.any(Number),
      })
    );
  });

  it('disables interaction with matched cards', async () => {
    render(<MatchingGame terms={mockTerms} onComplete={mockOnComplete} />);
    const termCard = screen.getByText('Quadratic Function').closest('button');
    const defCard = screen
      .getByText('A function of the form f(x) = ax² + bx + c where a ≠ 0.')
      .closest('button');

    fireEvent.click(termCard!);
    fireEvent.click(defCard!);

    await waitFor(() => {
      expect(termCard).toHaveAttribute('data-state', 'matched');
    });

    fireEvent.click(termCard!);
    expect(termCard).toHaveAttribute('data-state', 'matched');
  });
});
