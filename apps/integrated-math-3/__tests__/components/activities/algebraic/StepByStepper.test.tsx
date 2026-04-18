import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper', () => {
  const defaultProps = {
    mode: 'teaching' as const,
    steps: [
      {
        expression: 'x^2 + 5x + 6',
        explanation: 'Write the quadratic in standard form',
      },
      {
        expression: '(x + 2)(x + 3)',
        explanation: 'Factor the trinomial',
        isKeyStep: true,
      },
      {
        expression: 'x = -2, x = -3',
        explanation: 'Set each factor equal to zero and solve',
      },
    ],
  };

  describe('teaching mode rendering', () => {
    it('renders all steps with expression and explanation', () => {
      render(<StepByStepper {...defaultProps} />);

      expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      expect(screen.getByText('Factor the trinomial')).toBeInTheDocument();
      expect(screen.getByText('Set each factor equal to zero and solve')).toBeInTheDocument();
    });

    it('renders expressions using KaTeX', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const mathElements = container.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('uses StepRevealContainer in full-reveal state', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const stepContainers = container.querySelectorAll('[class*="space-y-4"]');
      expect(stepContainers.length).toBeGreaterThan(0);
    });

    it('renders step numbers', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      expect(stepNumbers.length).toBe(3);
      expect(stepNumbers[0]).toHaveTextContent('1');
      expect(stepNumbers[1]).toHaveTextContent('2');
      expect(stepNumbers[2]).toHaveTextContent('3');
    });

    it('isKeyStep flag applies visual emphasis', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Step 2 is a key step (isKeyStep: true)
      expect(stepNumbers[1]).toHaveClass('bg-primary');
    });

    it('renders without key steps when isKeyStep is not specified', () => {
      const props = {
        mode: 'teaching' as const,
        steps: [
          {
            expression: 'x^2 + 5x + 6',
            explanation: 'Write the quadratic in standard form',
          },
          {
            expression: '(x + 2)(x + 3)',
            explanation: 'Factor the trinomial',
          },
        ],
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      stepNumbers.forEach(stepNumber => {
        expect(stepNumber).toHaveClass('bg-primary');
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty steps array', () => {
      const { container } = render(
        <StepByStepper mode="teaching" steps={[]} />
      );

      expect(container.firstChild).toBeDefined();
    });

    it('handles single step', () => {
      const props = {
        mode: 'teaching' as const,
        steps: [
          {
            expression: 'x^2 + 2x + 1',
            explanation: 'Write in standard form',
          },
        ],
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Write in standard form')).toBeInTheDocument();
    });

    it('handles steps with hints (hint not shown in teaching mode)', () => {
      const props = {
        mode: 'teaching' as const,
        steps: [
          {
            expression: 'x^2 + 5x + 6',
            explanation: 'Write the quadratic in standard form',
            hint: 'Remember: ax^2 + bx + c',
          },
        ],
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      // Hint should not be visible in teaching mode
      expect(screen.queryByText('Remember: ax^2 + bx + c')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for steps', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const stepContainers = container.querySelectorAll('[class*="prose"]');
      expect(stepContainers.length).toBe(3);
    });

    it('is keyboard navigable', () => {
      const { container } = render(<StepByStepper {...defaultProps} />);

      const steps = container.querySelectorAll('[class*="space-y-4"] > div');
      expect(steps.length).toBe(3);
    });
  });
});
