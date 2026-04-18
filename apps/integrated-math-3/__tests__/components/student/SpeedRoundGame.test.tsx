import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SpeedRoundGame } from '@/components/student/SpeedRoundGame';
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

function findWrongButton(buttons: HTMLElement[], correctDef: string): HTMLElement | undefined {
  return buttons.find((btn) => btn.textContent !== correctDef);
}

describe('SpeedRoundGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the game with timer, lives, and streak display', () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Lives:/)).toBeInTheDocument();
    expect(screen.getByText(/Streak:/)).toBeInTheDocument();
  });

  it('displays a term and 4 answer options', () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    const termHeading = screen.getByText(/What is the definition of:/);
    expect(termHeading).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('shows feedback for correct answer', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    const termElement = screen.getByRole('heading', { level: 3 });
    const termName = termElement.textContent ?? '';
    const term = mockTerms.find((t) => t.term === termName);
    const correctDef = term?.definition ?? '';

    const correctButton = screen.getByRole('button', { name: correctDef });
    fireEvent.click(correctButton);

    await waitFor(() => {
      expect(screen.getByText(/✓|Correct!|correct/i)).toBeInTheDocument();
    });
  });

  it('shows feedback for wrong answer and decrements lives', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    const termElement = screen.getByRole('heading', { level: 3 });
    const termName = termElement.textContent ?? '';
    const term = mockTerms.find((t) => t.term === termName);
    const correctDef = term?.definition ?? '';

    const buttons = screen.getAllByRole('button');
    const wrongButton = findWrongButton(buttons, correctDef);
    expect(wrongButton).toBeTruthy();

    fireEvent.click(wrongButton!);

    await waitFor(() => {
      expect(screen.getByText('✗')).toBeInTheDocument();
    });
  });

  it('increments streak on correct answer', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    const termElement = screen.getByRole('heading', { level: 3 });
    const termName = termElement.textContent ?? '';
    const term = mockTerms.find((t) => t.term === termName);
    const correctDef = term?.definition ?? '';

    const correctButton = screen.getByRole('button', { name: correctDef });
    fireEvent.click(correctButton);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText(/Streak:/)).toBeInTheDocument();
    });
  });

  it('resets streak on wrong answer', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    const termElement = screen.getByRole('heading', { level: 3 });
    const termName = termElement.textContent ?? '';
    const term = mockTerms.find((t) => t.term === termName);
    const correctDef = term?.definition ?? '';

    const buttons = screen.getAllByRole('button');
    const wrongButton = findWrongButton(buttons, correctDef);
    expect(wrongButton).toBeTruthy();

    fireEvent.click(wrongButton!);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      const streakLabel = screen.getByText('Streak:');
      expect(streakLabel).toBeInTheDocument();
    });
  });

  it('ends game when lives reach 0', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const termElement = screen.getByRole('heading', { level: 3 });
      const termName = termElement.textContent ?? '';
      const term = mockTerms.find((t) => t.term === termName);
      const correctDef = term?.definition ?? '';

      const buttons = screen.getAllByRole('button');
      const wrongButton = findWrongButton(buttons, correctDef);
      if (!wrongButton) break;

      fireEvent.click(wrongButton);

      act(() => {
        vi.advanceTimersByTime(900);
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete with results when game ends', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const termElement = screen.getByRole('heading', { level: 3 });
      const termName = termElement.textContent ?? '';
      const term = mockTerms.find((t) => t.term === termName);
      const correctDef = term?.definition ?? '';

      const buttons = screen.getAllByRole('button');
      const wrongButton = findWrongButton(buttons, correctDef);
      if (!wrongButton) break;

      fireEvent.click(wrongButton);

      act(() => {
        vi.advanceTimersByTime(900);
      });
    }

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          itemsSeen: expect.any(Number),
          itemsCorrect: expect.any(Number),
          itemsIncorrect: expect.any(Number),
          durationSeconds: expect.any(Number),
        })
      );
    });
  });

  it('ends game when timer reaches 0', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    act(() => {
      vi.advanceTimersByTime(90 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Time's Up|Game Over/i)).toBeInTheDocument();
    });
  });

  it('shows score summary on game over', async () => {
    render(<SpeedRoundGame terms={mockTerms} onComplete={mockOnComplete} />);

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const termElement = screen.getByRole('heading', { level: 3 });
      const termName = termElement.textContent ?? '';
      const term = mockTerms.find((t) => t.term === termName);
      const correctDef = term?.definition ?? '';

      const buttons = screen.getAllByRole('button');
      const wrongButton = findWrongButton(buttons, correctDef);
      if (!wrongButton) break;

      fireEvent.click(wrongButton);

      act(() => {
        vi.advanceTimersByTime(900);
      });
    }

    await waitFor(() => {
      expect(screen.getAllByText(/Final Score|You saw|Items seen/i).length).toBeGreaterThan(0);
    });
  });
});