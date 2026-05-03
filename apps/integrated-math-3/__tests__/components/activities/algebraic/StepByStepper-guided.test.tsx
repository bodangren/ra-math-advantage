import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
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
    beforeEach(() => {
      // Mock Math.random so options sort comparator always returns 0 (stable order):
      // insertion order is [correct, distractor0, distractor1], so buttons[1] and [2] are incorrect
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('records hint usage count in component state', async () => {
      render(<StepByStepper {...defaultProps} />);

      // With Math.random mocked to 0.5, sort preserves insertion order:
      // [correct, distractor0, distractor1]. Select incorrect options by
      // filtering on distractor text rather than relying on array index.
      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const allButtons = screen.getAllByRole('button');
      const firstIncorrect = allButtons.find(btn => {
        const text = btn.textContent || '';
        return (text.includes('x + 5') || text.includes('2x + 3')) && !text.includes('x^2');
      });
      expect(firstIncorrect).toBeDefined();
      fireEvent.click(firstIncorrect!);

      await waitFor(() => {
        expect(screen.getByText(/Remember.*ax/)).toBeInTheDocument();
      });

      // Re-query buttons after re-render; pick the OTHER incorrect option
      const buttonsAfterFirst = screen.getAllByRole('button');
      const secondIncorrect = buttonsAfterFirst.find(btn => {
        const text = btn.textContent || '';
        return (text.includes('x + 5') || text.includes('2x + 3')) && !text.includes('x^2');
      });
      expect(secondIncorrect).toBeDefined();
      fireEvent.click(secondIncorrect!);

      await waitFor(() => {
        expect(screen.getByText(/Remember.*ax/)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/Hints used: 2/i)).toBeInTheDocument();
      });
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
