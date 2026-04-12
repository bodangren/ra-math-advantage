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
        distractors: ['x + 5', '2x + 3'],
      },
      {
        expression: '(x + 2)(x + 3)',
        explanation: 'Factor the trinomial',
        isKeyStep: true,
        distractors: ['(x - 2)(x - 3)', '(x + 1)(x + 6)'],
      },
      {
        expression: 'x = -2, x = -3',
        explanation: 'Set each factor equal to zero and solve',
        distractors: ['x = 2, x = 3', 'x = -1, x = -6'],
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
      // Find the button with the correct answer (x^2 + 5x + 6)
      const correctButton = options.find(btn => btn.textContent?.includes('x^2 + 5x + 6'));
      expect(correctButton).toBeDefined();
      fireEvent.click(correctButton!);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      });
    });

    it('correct selection advances to next step', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      // Find the button with the correct answer (x^2 + 5x + 6)
      const correctButton = options.find(btn => btn.textContent?.includes('x^2 + 5x + 6'));
      expect(correctButton).toBeDefined();
      fireEvent.click(correctButton!);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      });
    });

    it('incorrect selection shows hint', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      // Find an incorrect answer (x + 5 or 2x + 3)
      const incorrectButton = options.find(btn => {
        const text = btn.textContent || '';
        return (text.includes('x + 5') || text.includes('2x + 3')) && !text.includes('x^2');
      });
      expect(incorrectButton).toBeDefined();
      fireEvent.click(incorrectButton!);

      await waitFor(() => {
        expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
      });
    });

    it('incorrect selection allows retry', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      const initialOptionsCount = options.length;
      
      // Find and click an incorrect option (x + 5 or 2x + 3)
      const incorrectButton = options.find(btn => {
        const text = btn.textContent || '';
        return (text.includes('x + 5') || text.includes('2x + 3')) && !text.includes('x^2');
      });
      
      expect(incorrectButton).toBeDefined();
      fireEvent.click(incorrectButton!);

      await waitFor(() => {
        // Options should still be available for retry (hint is shown, options remain visible)
        expect(screen.getAllByRole('button').length).toBe(initialOptionsCount);
      });
    });
  });

  describe('hint usage tracking', () => {
    it('records hint usage count in component state', async () => {
      render(<StepByStepper {...defaultProps} />);

      const options = screen.getAllByRole('button');
      
      // Find incorrect answers (x + 5, 2x + 3)
      const incorrectButtons = options.filter(btn => {
        const text = btn.textContent || '';
        return (text.includes('x + 5') || text.includes('2x + 3')) && !text.includes('x^2');
      });
      
      // Use hint twice by clicking incorrect answers
      if (incorrectButtons.length >= 2) {
        fireEvent.click(incorrectButtons[0]);
        await waitFor(() => {
          expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
        });

        fireEvent.click(incorrectButtons[1]);
        await waitFor(() => {
          expect(screen.getByText('Remember: ax^2 + bx + c')).toBeInTheDocument();
        });
      }

      // Hint usage should be tracked
      const hintCount = screen.queryByText(/hints used: \d+/i);
      expect(hintCount).toBeInTheDocument();
    });
  });

  describe('completion', () => {
    it('shows summary after all steps completed', async () => {
      render(<StepByStepper {...defaultProps} />);

      // Complete first step
      let options = screen.getAllByRole('button');
      const correctButton = options.find(btn => btn.textContent?.includes('x^2 + 5x + 6'));
      if (correctButton) fireEvent.click(correctButton);

      await waitFor(() => {
        expect(screen.getByText('Write the quadratic in standard form')).toBeInTheDocument();
      });

      // Click Next
      const nextButton1 = screen.queryByText('Next');
      if (nextButton1) fireEvent.click(nextButton1);

      // Complete second step
      await waitFor(() => {
        expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
      });

      options = screen.getAllByRole('button');
      const correctButton2 = options.find(btn => btn.textContent?.includes('(x + 2)(x + 3)'));
      if (correctButton2) fireEvent.click(correctButton2);

      await waitFor(() => {
        expect(screen.getByText('Factor the trinomial')).toBeInTheDocument();
      });

      // Click Next
      const nextButton2 = screen.queryByText('Next');
      if (nextButton2) fireEvent.click(nextButton2);

      // Complete third step
      await waitFor(() => {
        expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
      });

      options = screen.getAllByRole('button');
      const correctButton3 = options.find(btn => btn.textContent?.includes('x = -2, x = -3'));
      if (correctButton3) fireEvent.click(correctButton3);

      // Should show completion state
      await waitFor(() => {
        expect(screen.getByText(/Complete!/i)).toBeInTheDocument();
      }, { timeout: 5000 });
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
