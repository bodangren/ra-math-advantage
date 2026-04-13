import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FillInTheBlank } from '@/components/activities/blanks/FillInTheBlank';

interface Blank {
  id: string;
  correctAnswer: string;
  isMath?: boolean;
}

interface FillInTheBlankProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  template: string;
  blanks: Blank[];
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

describe('FillInTheBlank', () => {
  const createProps = (
    template: string,
    blanks: Blank[],
    mode: FillInTheBlankProps['mode'] = 'teaching'
  ): FillInTheBlankProps => ({
    activityId: 'fitb-1',
    mode,
    template,
    blanks,
    onSubmit: vi.fn(),
    onComplete: vi.fn(),
  });

  describe('template parsing', () => {
    it('parses template with single blank marker', () => {
      const props = createProps(
        'The solution to {{blank:1}} is x = 5.',
        [{ id: '1', correctAnswer: 'x = 5' }]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/The solution to/)).toBeInTheDocument();
      expect(screen.getByText(/is x = 5/)).toBeInTheDocument();
    });

    it('parses template with multiple blank markers', () => {
      const props = createProps(
        'The vertex of y = {{blank:1}} is at ({{blank:2}}, {{blank:3}}).',
        [
          { id: '1', correctAnswer: 'x^2' },
          { id: '2', correctAnswer: '0' },
          { id: '3', correctAnswer: '0' },
        ]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/The vertex of y =/)).toBeInTheDocument();
      expect(screen.getByText(/is at/)).toBeInTheDocument();
    });

    it('renders math expressions correctly with KaTeX', () => {
      const props = createProps(
        'Solve: x = {{blank:1}}',
        [{ id: '1', correctAnswer: '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', isMath: true }]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/Solve: x =/)).toBeInTheDocument();
    });
  });

  describe('teaching mode', () => {
    it('shows blanks pre-filled as highlighted labels', () => {
      const props = createProps(
        'The discriminant is {{blank:1}}.',
        [{ id: '1', correctAnswer: 'b^2 - 4ac' }]
      );
      render(<FillInTheBlank {...props} />);
      const blankElement = screen.getByText('b^2 - 4ac').closest('span');
      expect(blankElement).toHaveClass('bg-green-100');
    });

    it('renders all blanks in teaching mode', () => {
      const props = createProps(
        '{{blank:1}} is the first blank. {{blank:2}} is the second.',
        [
          { id: '1', correctAnswer: 'This' },
          { id: '2', correctAnswer: 'That' },
        ]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText('This')).toBeInTheDocument();
      expect(screen.getByText('That')).toBeInTheDocument();
    });

    it('is read-only in teaching mode', () => {
      const props = createProps(
        'Fill in: {{blank:1}}',
        [{ id: '1', correctAnswer: 'answer' }]
      );
      render(<FillInTheBlank {...props} />);
      const inputs = screen.queryByRole('textbox');
      expect(inputs).not.toBeInTheDocument();
    });

    it('displays the original template text around blanks', () => {
      const props = createProps(
        'A quadratic function has the form f(x) = {{blank:1}}.',
        [{ id: '1', correctAnswer: 'ax^2 + bx + c' }]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/A quadratic function has the form/)).toBeInTheDocument();
      expect(screen.getByText(/f\(x\) =/)).toBeInTheDocument();
    });
  });

  describe('blank identification', () => {
    it('handles word blanks (non-math)', () => {
      const props = createProps(
        'The point where the line crosses the y-axis is called the {{blank:1}}.',
        [{ id: '1', correctAnswer: 'y-intercept', isMath: false }]
      );
      render(<FillInTheBlank {...props} />);
      const blankElement = screen.getByText('y-intercept').closest('span');
      expect(blankElement).toBeInTheDocument();
    });

    it('handles expression blanks (math)', () => {
      const props = createProps(
        'The axis of symmetry is x = {{blank:1}}.',
        [{ id: '1', correctAnswer: '-b/(2a)', isMath: true }]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/x =/)).toBeInTheDocument();
    });
  });
});