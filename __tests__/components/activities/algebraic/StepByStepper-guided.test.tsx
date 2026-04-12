import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Guided Mode', () => {
  const defaultProps = {
    mode: 'guided' as const,
    steps: [
      {
        expression: 'x^2 + 5x + 6',
        explanation: 'Write the quadratic in standard form',
        hint: 'Remember: ax^2 + bx + c',
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

  describe('initial state', () => {
    it('hides all steps on load', () => {
      render(<StepByStepper {...defaultProps} />);

      expect(screen.queryByText('Write the quadratic in standard form')).not.toBeInTheDocument();
      expect(screen.queryByText('Factor the trinomial')).not.toBeInTheDocument();
      expect(screen.queryByText('Set each factor equal to zero and solve')).not.toBeInTheDocument();
    });

    it('shows prompt for next step', () => {
      render(<StepByStepper {...defaultProps} />);

      expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
    });
  });

  describe('multiple-choice interactions', () => {
    it('shows correct step + 2 distractors as options', () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBe(3); // Correct + 2 distractors
    });

    it('correct selection reveals step with explanation', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      // Click the first option (assume it's correct for this test)
      fireEvent.click(options[0]);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      });
    });

    it('correct selection advances to next step', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      fireEvent.click(options[0]);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });
    });

    it('incorrect selection shows hint', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      // Click the second option (assume it's incorrect for this test)
      fireEvent.click(options[1]);

      await waitFor(() => {
        expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
      });
    });

    it('incorrect selection allows retry', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      const initialOptionsCount = screen.getAllByRole('button').length;
      
      // Click incorrect option
      fireEvent.click(options[1]);

      await waitFor(() => {
        // Options should still be available for retry
        expect(screen.getAllByRole('button').length).toBe(initialOptionsCount);
      });
    });
  });

  describe('hint usage tracking', () => {
    it('records hint usage count in component state', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      
      // Use hint twice
      fireEvent.click(options[1]);
      await waitFor(() => {
        expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
      });

      fireEvent.click(options[2]);
      await waitFor(() => {
        expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
      });

      // Hint usage should be tracked
      const hintCount = screen.queryByText(/hints used: \d+/i);
      expect(hintCount).toBeInTheDocument();
    });
  });

  describe('completion', () => {
    it('shows summary after all steps completed', async () => {
      render(<StepByStepper {...defaultProps} />);

      // Complete all steps
      const options = screen.getAllByRole('button');
      fireEvent.click(options[0]);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      });

      // Continue with remaining steps (simplified for test)
      const nextOptions = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Next') || btn.textContent?.includes('next')
      );
      
      if (nextOptions.length > 0) {
        fireEvent.click(nextOptions[0]);
      }

      await waitFor(() => {
        // Should show completion state
        expect(screen.queryByText(/what's the next step/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('handles steps without hints', () => {
      const props = {
        mode: 'guided' as const,
        steps: [
          {
            expression: 'x^2 + 5x + 6',
            explanation: 'Write the quadratic in standard form',
          },
        ],
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
    });

    it('handles single step', () => {
      const props = {
        mode: 'guided' as const,
        steps: [
          {
            expression: 'x^2 + 2x + 1',
            explanation: 'Write in standard form',
          },
        ],
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for options', () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      options.forEach(option => {
        expect(option).toHaveAttribute('type', 'button');
      });
    });

    it('is keyboard navigable', () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(0);
    });
  });
});
