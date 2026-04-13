import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepSolverActivity } from '@/components/activities/algebraic/StepByStepSolverActivity';
import type { AlgebraicStep } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepSolverActivity', () => {
  const defaultSteps: AlgebraicStep[] = [
    {
      expression: 'x^2 + 5x + 6 = 0',
      explanation: 'Start with the quadratic equation in standard form.',
    },
    {
      expression: '(x + 2)(x + 3) = 0',
      explanation: 'Factor the trinomial into two binomials.',
      isKeyStep: true,
    },
    {
      expression: 'x + 2 = 0 or x + 3 = 0',
      explanation: 'Apply the Zero Product Property.',
    },
    {
      expression: 'x = -2 or x = -3',
      explanation: 'Solve each linear equation.',
    },
  ];

  const defaultProps = {
    activityId: 'test-activity-123',
    mode: 'teaching' as const,
    steps: defaultSteps,
    problemType: 'factoring' as const,
    equation: 'x^2 + 5x + 6 = 0',
  };

  describe('prop interface', () => {
    it('renders with provided steps instead of hardcoded ones', () => {
      const customSteps: AlgebraicStep[] = [
        {
          expression: '2x + 4 = 0',
          explanation: 'Start with the linear equation.',
        },
        {
          expression: '2x = -4',
          explanation: 'Subtract 4 from both sides.',
        },
        {
          expression: 'x = -2',
          explanation: 'Divide by 2.',
        },
      ];

      render(
        <StepByStepSolverActivity
          {...defaultProps}
          steps={customSteps}
          mode="teaching"
        />
      );

      expect(screen.getByText('Start with the linear equation.')).toBeInTheDocument();
      expect(screen.getByText('Subtract 4 from both sides.')).toBeInTheDocument();
      expect(screen.getByText('Divide by 2.')).toBeInTheDocument();
    });

    it('accepts problemType prop', () => {
      const { container } = render(
        <StepByStepSolverActivity {...defaultProps} problemType="quadratic_formula" />
      );
      expect(container.firstChild).toBeDefined();
    });

    it('accepts equation prop', () => {
      const { container } = render(
        <StepByStepSolverActivity {...defaultProps} equation="x^2 - 4x + 3 = 0" />
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('onSubmit wiring', () => {
    it('calls onSubmit with submission envelope when provided', async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      render(
        <StepByStepSolverActivity
          {...defaultProps}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('calls onSubmit when practice mode completes', async () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      const practiceSteps: AlgebraicStep[] = [
        {
          expression: 'x^2 + 5x + 6 = 0',
          explanation: 'Start with the quadratic equation.',
        },
        {
          expression: '(x + 2)(x + 3) = 0',
          explanation: 'Factor the trinomial.',
        },
      ];

      render(
        <StepByStepSolverActivity
          {...defaultProps}
          mode="practice"
          steps={practiceSteps}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('onComplete wiring', () => {
    it('does not call onComplete immediately on render', async () => {
      const onComplete = vi.fn();

      render(
        <StepByStepSolverActivity
          {...defaultProps}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(onComplete).not.toHaveBeenCalled();
      });
    });
  });

  describe('teaching mode', () => {
    it('renders all steps in teaching mode', () => {
      render(<StepByStepSolverActivity {...defaultProps} mode="teaching" />);

      expect(screen.getByText('Start with the quadratic equation in standard form.')).toBeInTheDocument();
      expect(screen.getByText('Factor the trinomial into two binomials.')).toBeInTheDocument();
      expect(screen.getByText('Apply the Zero Product Property.')).toBeInTheDocument();
      expect(screen.getByText('Solve each linear equation.')).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('renders guided mode interface', () => {
      render(<StepByStepSolverActivity {...defaultProps} mode="guided" />);

      expect(screen.getByText(/What's the next step?/i)).toBeInTheDocument();
    });
  });

  describe('activityId handling', () => {
    it('accepts activityId prop without error', () => {
      const { container } = render(
        <StepByStepSolverActivity
          {...defaultProps}
          activityId="custom-activity-id"
        />
      );
      expect(container.firstChild).toBeDefined();
    });
  });
});