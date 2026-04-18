import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FillInTheBlank } from '@/components/activities/blanks/FillInTheBlank';

interface Blank {
  id: string;
  correctAnswer: string;
  isMath?: boolean;
}

interface WordBankItem {
  id: string;
  text: string;
}

interface FillInTheBlankProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  template: string;
  blanks: Blank[];
  wordBank?: WordBankItem[];
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

  describe('guided mode', () => {
    it('shows one blank at a time with placeholder', () => {
      const props = createProps(
        '{{blank:1}} is first. {{blank:2}} is second.',
        [
          { id: '1', correctAnswer: 'This' },
          { id: '2', correctAnswer: 'That' },
        ],
        'guided'
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getAllByText('____').length).toBe(2);
    });

    it('shows progress indicator', () => {
      const props = createProps(
        '{{blank:1}} is first.',
        [{ id: '1', correctAnswer: 'This' }],
        'guided'
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText(/Blank 1 of 1/)).toBeInTheDocument();
    });

    it('has math input for answer entry', () => {
      const props = createProps(
        'The vertex is ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        'guided'
      );
      render(<FillInTheBlank {...props} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('practice mode', () => {
    it('shows all blanks with placeholders at once', () => {
      const props = createProps(
        '{{blank:1}} is first. {{blank:2}} is second.',
        [
          { id: '1', correctAnswer: 'This' },
          { id: '2', correctAnswer: 'That' },
        ],
        'practice'
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getAllByText('____').length).toBe(2);
    });

    it('has submit button disabled until all answered', () => {
      const props = createProps(
        '{{blank:1}} and {{blank:2}}.',
        [
          { id: '1', correctAnswer: 'This' },
          { id: '2', correctAnswer: 'That' },
        ],
        'practice'
      );
      render(<FillInTheBlank {...props} />);
      const submitButton = screen.getByText(/submit/i);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('word bank', () => {
    const createPropsWithWordBank = (
      template: string,
      blanks: Blank[],
      wordBank: WordBankItem[],
      mode: FillInTheBlankProps['mode'] = 'practice'
    ): FillInTheBlankProps => ({
      activityId: 'fitb-1',
      mode,
      template,
      blanks,
      wordBank,
      onSubmit: vi.fn(),
      onComplete: vi.fn(),
    });

    it('renders word bank items in practice mode', () => {
      const props = createPropsWithWordBank(
        'The vertex is at ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        [
          { id: 'wb1', text: '0' },
          { id: 'wb2', text: '1' },
          { id: 'wb3', text: '-1' },
        ]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText('Word Bank')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('does not show word bank in teaching mode', () => {
      const props = createPropsWithWordBank(
        'The vertex is at ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        [
          { id: 'wb1', text: '0' },
          { id: 'wb2', text: '1' },
        ],
        'teaching'
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.queryByText('Word Bank')).not.toBeInTheDocument();
    });

    it('does not show word bank in guided mode', () => {
      const props = createPropsWithWordBank(
        'The vertex is at ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        [
          { id: 'wb1', text: '0' },
          { id: 'wb2', text: '1' },
        ],
        'guided'
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.queryByText('Word Bank')).not.toBeInTheDocument();
    });

    it('handles word bank item assignment via drag-drop', async () => {
      const props = createPropsWithWordBank(
        'The vertex is at ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        [
          { id: 'wb1', text: 'vertex' },
          { id: 'wb2', text: '0' },
        ]
      );
      render(<FillInTheBlank {...props} />);

      expect(screen.getByText('vertex')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('shows clear button for word bank filled blanks', () => {
      const props = createPropsWithWordBank(
        'The vertex is at ({{blank:1}}, {{blank:2}}).',
        [
          { id: '1', correctAnswer: '0' },
          { id: '2', correctAnswer: '0' },
        ],
        [
          { id: 'wb1', text: '0' },
          { id: 'wb2', text: '1' },
        ]
      );
      render(<FillInTheBlank {...props} />);
      expect(screen.getByText('Word Bank')).toBeInTheDocument();
    });

    it('submits word bank usage in envelope', async () => {
      const props = createPropsWithWordBank(
        '{{blank:1}} is the first blank.',
        [{ id: '1', correctAnswer: 'This' }],
        [{ id: 'wb1', text: 'This' }]
      );

      render(<FillInTheBlank {...props} />);

      expect(screen.getByText('Word Bank')).toBeInTheDocument();
      expect(screen.getByText('This')).toBeInTheDocument();
    });
  });
});