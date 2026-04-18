import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MisconceptionPanel, type MisconceptionView } from '@/components/teacher/srs/MisconceptionPanel';

const defaultMisconceptions: MisconceptionView[] = [
  {
    tag: 'negative-exponent-rule',
    count: 25,
    affectedObjectives: ['F.IF.1', 'F.IF.2'],
  },
  {
    tag: 'function-composition',
    count: 18,
    affectedObjectives: ['F.IF.3'],
  },
  {
    tag: 'domain-range-confusion',
    count: 12,
    affectedObjectives: ['F.IF.1', 'F.IF.4'],
  },
];

describe('MisconceptionPanel', () => {
  describe('layout', () => {
    it('renders section title', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      expect(screen.getByText('Misconception Diagnostics')).toBeInTheDocument();
    });

    it('renders with recharts responsive container', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      const container = document.querySelector('.recharts-responsive-container');
      expect(container).toBeInTheDocument();
    });

    it('does not render time window selector when onTimeWindowChange not provided', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      const timeSelector = document.querySelector('.bg-muted.rounded-md');
      expect(timeSelector).not.toBeInTheDocument();
    });

    it('renders time window selector when onTimeWindowChange is provided', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} onTimeWindowChange={vi.fn()} />);

      const timeSelector = document.querySelector('.bg-muted.rounded-md');
      expect(timeSelector).toBeInTheDocument();
    });
  });

  describe('chart', () => {
    it('renders bar chart component', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      const barChart = document.querySelector('.recharts-bar');
      expect(barChart).toBeInTheDocument();
    });

    it('displays total occurrence count', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      const total = 25 + 18 + 12;
      expect(screen.getByText(`${total} total occurrences`)).toBeInTheDocument();
    });

    it('shows top misconception count in footer', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      expect(screen.getByText(/Top 3 misconceptions/)).toBeInTheDocument();
    });
  });

  describe('time window change', () => {
    it('calls onTimeWindowChange with correct value when button is clicked', () => {
      const handleChange = vi.fn();
      render(
        <MisconceptionPanel misconceptions={defaultMisconceptions} onTimeWindowChange={handleChange} />
      );

      const buttons = document.querySelectorAll('.bg-muted.rounded-md button');
      fireEvent.click(buttons[1]);
      expect(handleChange).toHaveBeenCalledWith(14);
    });

    it('has three time window buttons', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} onTimeWindowChange={vi.fn()} />);

      const buttons = document.querySelectorAll('.bg-muted.rounded-md button');
      expect(buttons).toHaveLength(3);
    });

    it('first button has selected styling (bg-background)', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} onTimeWindowChange={vi.fn()} />);

      const buttons = document.querySelectorAll('.bg-muted.rounded-md button');
      expect(buttons[0]).toHaveClass('bg-background');
    });
  });

  describe('empty state', () => {
    it('shows success message when no misconceptions', () => {
      render(<MisconceptionPanel misconceptions={[]} />);

      expect(screen.getByText('No misconceptions detected')).toBeInTheDocument();
      expect(screen.getByText('Students are showing strong understanding')).toBeInTheDocument();
    });

    it('hides chart when no misconceptions', () => {
      render(<MisconceptionPanel misconceptions={[]} />);

      const container = document.querySelector('.recharts-responsive-container');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('hides chart when loading', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} isLoading={true} />);

      const container = document.querySelector('.recharts-responsive-container');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single misconception', () => {
      const single: MisconceptionView[] = [
        {
          tag: 'only-one',
          count: 5,
          affectedObjectives: ['F.IF.1'],
        },
      ];

      render(<MisconceptionPanel misconceptions={single} />);

      expect(screen.getByText('5 total occurrences')).toBeInTheDocument();
      const footerText = document.body.textContent;
      expect(footerText).toContain('Top 1 misconception');
    });

    it('handles zero count misconception', () => {
      const zeroCount: MisconceptionView[] = [
        {
          tag: 'zero-count',
          count: 0,
          affectedObjectives: ['F.IF.1'],
        },
      ];

      render(<MisconceptionPanel misconceptions={zeroCount} />);

      expect(screen.getByText('0 total occurrences')).toBeInTheDocument();
    });

    it('renders correct number of bars', () => {
      render(<MisconceptionPanel misconceptions={defaultMisconceptions} />);

      const bars = document.querySelectorAll('.recharts-bar-rectangle');
      expect(bars.length).toBe(3);
    });
  });
});