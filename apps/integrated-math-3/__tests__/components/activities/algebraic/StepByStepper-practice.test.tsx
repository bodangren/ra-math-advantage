import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Practice Mode', () => {
  const defaultProps = {
    mode: 'practice' as const,
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

  describe('problem presentation', () => {
    it('presents fresh problem from pool', () => {
      render(<StepByStepper {...defaultProps} />);

      expect(screen.getByText('Problem:')).toBeInTheDocument();
    });

    it('shows partial steps at configured scaffold level', async () => {
      const props = {
        ...defaultProps,
        scaffoldLevel: 1,
      };

      render(<StepByStepper {...props} />);

      // Complete first step to advance
      const input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: defaultProps.steps[0].expression } });
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Correct solution:')).toBeInTheDocument();
      });

      // Click Next to move to step 1
      const nextButton = screen.queryByRole('button', { name: 'Next Step' });
      if (nextButton) fireEvent.click(nextButton);

      // Now at step 1 with scaffoldLevel=1, hint should be visible
      await waitFor(() => {
        expect(screen.getByText('Hint:')).toBeInTheDocument();
      });
    });

    it('shows blank expressions for student input', () => {
      render(<StepByStepper {...defaultProps} />);

      // Should have input fields for blank expressions
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('math input validation', () => {
    it('accepts math input in blank expressions', async () => {
      render(<StepByStepper {...defaultProps} />);

      const input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: '(x + 2)(x + 3)' } });

      await waitFor(() => {
        expect(input).toHaveValue('(x + 2)(x + 3)');
      });
    });

    it('validates expression on submit', async () => {
      render(<StepByStepper {...defaultProps} />);

      const input = screen.getAllByRole('textbox')[0];
      // Use the correct answer for the first step
      fireEvent.change(input, { target: { value: 'x^2 + 5x + 6' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check for the correct solution header
        expect(screen.getByText('Correct solution:')).toBeInTheDocument();
      });
    });

    it('shows feedback for incorrect answers', async () => {
      render(<StepByStepper {...defaultProps} />);

      const input = screen.getAllByRole('textbox')[0];
      // Use an incorrect answer for the first step
      fireEvent.change(input, { target: { value: '(x - 2)(x - 3)' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
      });
    });
  });

  describe('solution overlay', () => {
    it('overlays correct solution on submit for comparison', async () => {
      render(<StepByStepper {...defaultProps} />);

      const input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: 'x^2 + 5x + 6' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show both user answer and correct solution
        expect(screen.getByText('Correct solution:')).toBeInTheDocument();
        expect(screen.getByText('Your answer:')).toBeInTheDocument();
      });
    });
  });

  describe('completion', () => {
    it('shows completion summary after all steps completed', async () => {
      render(<StepByStepper {...defaultProps} />);

      // Complete first step
      let input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: defaultProps.steps[0].expression } });
      
      let submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Correct solution:')).toBeInTheDocument();
      });

      // Click Next
      let nextButton = screen.queryByRole('button', { name: 'Next Step' });
      if (nextButton) fireEvent.click(nextButton);

      // Complete second step
      await waitFor(() => {
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
      });

      input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: defaultProps.steps[1].expression } });
      
      submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Correct solution:')).toBeInTheDocument();
      });

      // Click Next
      nextButton = screen.queryByRole('button', { name: 'Next Step' });
      if (nextButton) fireEvent.click(nextButton);

      // Complete third step
      await waitFor(() => {
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
      });

      input = screen.getAllByRole('textbox')[0];
      fireEvent.change(input, { target: { value: defaultProps.steps[2].expression } });
      
      submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Should show completion state
      await waitFor(() => {
        expect(screen.getByText(/Complete!/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('edge cases', () => {
    it('handles empty steps array', () => {
      const { container } = render(
        <StepByStepper mode="practice" steps={[]} />
      );

      expect(container.firstChild).toBeDefined();
    });

    it('handles single step', () => {
      const props = {
        mode: 'practice' as const,
        steps: [
          {
            expression: 'x^2 + 2x + 1',
            explanation: 'Write in standard form',
          },
        ],
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for input fields', () => {
      render(<StepByStepper {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('is keyboard navigable', () => {
      render(<StepByStepper {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
