import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleReviewHarness } from '@/components/dev/review-harness/ExampleReviewHarness';
import type { AlgebraicStep } from '@/components/activities/algebraic/StepByStepper';

vi.mock('@/components/textbook/StepRevealContainer', () => ({
  StepRevealContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="step-reveal">{children}</div>
  ),
  StepMode: ['teaching', 'guided', 'practice'],
}));

describe('ExampleReviewHarness', () => {
  const defaultSteps: AlgebraicStep[] = [
    {
      expression: 'x^2 + 5x + 6 = 0',
      explanation: 'Start with the quadratic equation in standard form.',
    },
    {
      expression: '(x + 2)(x + 3) = 0',
      explanation: 'Factor the trinomial into two binomials.',
    },
    {
      expression: 'x = -2 or x = -3',
      explanation: 'Apply the Zero Product Property.',
    },
  ];

  const defaultProps = {
    componentKey: 'factor-trinomial',
    steps: defaultSteps,
  };

  describe('mode selection', () => {
    it('renders with teaching mode active by default', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const teachingButton = screen.getByRole('button', { name: /teaching/i });
      expect(teachingButton).toHaveClass('bg-primary');
    });

    it('switches to guided mode when clicked', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      expect(guidedButton).toHaveClass('bg-primary');
    });

    it('switches to practice mode when clicked', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      expect(practiceButton).toHaveClass('bg-primary');
    });
  });

  describe('review tracking', () => {
    it('marks teaching mode as reviewed when switched away', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      const teachingButton = screen.getByRole('button', { name: /teaching/i });
      expect(teachingButton).toHaveClass('bg-green-100');
    });

    it('calls onModeReviewed callback when mode is switched', () => {
      const onModeReviewed = vi.fn();
      render(<ExampleReviewHarness {...defaultProps} onModeReviewed={onModeReviewed} />);

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      expect(onModeReviewed).toHaveBeenCalledWith('guided');
    });
  });

  describe('approval gating', () => {
    it('shows message that all modes must be reviewed before approving when no modes reviewed', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      expect(screen.getByText(/All modes must be reviewed before approving/i)).toBeInTheDocument();
    });

    it('does not show approval message when all modes are reviewed and verification checkboxes are checked', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      const algorithmicCheckbox = screen.getByLabelText(/algorithmic practice behavior verified/i) as HTMLInputElement;
      fireEvent.click(algorithmicCheckbox);

      const coherentFeedbackCheckbox = screen.getByLabelText(/coherent feedback\/solution behavior verified/i) as HTMLInputElement;
      fireEvent.click(coherentFeedbackCheckbox);

      expect(screen.queryByText(/All modes must be reviewed before approving/i)).not.toBeInTheDocument();
    });
  });

  describe('practice variant generation', () => {
    it('generates a new variant when button is clicked', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/1 generated/i)).toBeInTheDocument();
    });

    it('calls onVariantGenerated callback when variant is generated', () => {
      const onVariantGenerated = vi.fn();
      render(<ExampleReviewHarness {...defaultProps} onVariantGenerated={onVariantGenerated} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);

      expect(onVariantGenerated).toHaveBeenCalled();
    });

    it('shows algorithmic variation message after 2 variants', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      expect(screen.getByText(/algorithmic variation/i)).toBeInTheDocument();
    });
  });

  describe('checkbox verification', () => {
    it('algorithmic checkbox is disabled until 2 variants generated', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const algorithmicCheckbox = screen.getByLabelText(/algorithmic practice behavior/i) as HTMLInputElement;
      expect(algorithmicCheckbox).toBeDisabled();
    });

    it('algorithmic checkbox is enabled after 2 variants', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      const algorithmicCheckbox = screen.getByLabelText(/algorithmic practice behavior/i) as HTMLInputElement;
      expect(algorithmicCheckbox).not.toBeDisabled();
    });
  });

  describe('component key display', () => {
    it('displays the component key', () => {
      render(<ExampleReviewHarness {...defaultProps} />);

      expect(screen.getByText('factor-trinomial')).toBeInTheDocument();
    });
  });

  describe('onCanApproveChange callback', () => {
    it('calls onCanApproveChange with false initially', () => {
      const onCanApproveChange = vi.fn();
      render(<ExampleReviewHarness {...defaultProps} onCanApproveChange={onCanApproveChange} />);

      expect(onCanApproveChange).toHaveBeenCalledWith(false);
    });

    it('calls onCanApproveChange with true when all modes reviewed and verification checkboxes are checked', () => {
      const onCanApproveChange = vi.fn();
      render(<ExampleReviewHarness {...defaultProps} onCanApproveChange={onCanApproveChange} />);
      onCanApproveChange.mockClear();

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      const generateButton = screen.getByRole('button', { name: /generate variant/i });
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      const algorithmicCheckbox = screen.getByLabelText(/algorithmic practice behavior verified/i) as HTMLInputElement;
      fireEvent.click(algorithmicCheckbox);

      const coherentFeedbackCheckbox = screen.getByLabelText(/coherent feedback\/solution behavior verified/i) as HTMLInputElement;
      fireEvent.click(coherentFeedbackCheckbox);

      expect(onCanApproveChange).toHaveBeenCalledWith(true);
    });
  });
});
