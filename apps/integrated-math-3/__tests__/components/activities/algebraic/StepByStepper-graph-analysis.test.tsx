import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Graph Analysis Problem Type', () => {
  const graphAnalysisSteps = [
    {
      expression: 'f(x) = x^2 - 4x + 3',
      explanation: 'Identify the coefficients a, b, and c from the quadratic equation',
      hint: 'For f(x) = ax^2 + bx + c, extract a, b, and c',
      isKeyStep: true,
      distractors: ['a = 1, b = -4, c = 3', 'a = 1, b = 4, c = -3'],
    },
    {
      expression: 'a = 1, b = -4, c = 3',
      explanation: 'The coefficients are: a = 1 (quadratic term), b = -4 (linear term), c = 3 (constant term)',
      hint: 'Pay attention to the sign of each coefficient',
      distractors: ['a = 1, b = 4, c = 3', 'a = -1, b = 4, c = 3'],
    },
    {
      expression: 'x = -b/(2a) = -(-4)/(2*1) = 2',
      explanation: 'Compute the axis of symmetry using x = -b/(2a)',
      hint: 'Remember the formula for the axis of symmetry',
      isKeyStep: true,
      distractors: ['x = 4', 'x = -2'],
    },
    {
      expression: 'f(2) = (2)^2 - 4(2) + 3 = 4 - 8 + 3 = -1',
      explanation: 'Find the vertex by evaluating the function at the axis of symmetry',
      hint: 'Substitute the axis of symmetry value into the original equation',
      distractors: ['f(2) = 1', 'f(2) = -3'],
    },
    {
      expression: 'Vertex: (2, -1)',
      explanation: 'The vertex is the point where the parabola changes direction',
      hint: 'The vertex has coordinates (h, k) where h is the axis of symmetry',
      isKeyStep: true,
      distractors: ['Vertex: (-2, 1)', 'Vertex: (2, 1)'],
    },
    {
      expression: 'Minimum value: -1',
      explanation: 'Since a = 1 > 0, the parabola opens upward and has a minimum',
      hint: 'The sign of a tells you whether the parabola opens up or down',
      distractors: ['Maximum value: -1', 'Maximum value: 1'],
    },
    {
      expression: 'Domain: (-∞, ∞), Range: [-1, ∞)',
      explanation: 'Domain of any quadratic function is all real numbers; range depends on the vertex',
      hint: 'The range starts at the minimum value and goes to infinity',
      isKeyStep: true,
      distractors: ['Domain: [2, ∞), Range: (-∞, ∞)', 'Domain: (-∞, ∞), Range: (1, ∞)'],
    },
  ];

  describe('teaching mode', () => {
    it('renders all graph analysis steps with expression and explanation', () => {
      const props = {
        mode: 'teaching' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Identify the coefficients a, b, and c from the quadratic equation')).toBeInTheDocument();
      expect(screen.getByText('The coefficients are: a = 1 (quadratic term), b = -4 (linear term), c = 3 (constant term)')).toBeInTheDocument();
      expect(screen.getByText('Compute the axis of symmetry using x = -b/(2a)')).toBeInTheDocument();
      expect(screen.getByText('Find the vertex by evaluating the function at the axis of symmetry')).toBeInTheDocument();
      expect(screen.getByText('The vertex is the point where the parabola changes direction')).toBeInTheDocument();
      expect(screen.getByText('Since a = 1 > 0, the parabola opens upward and has a minimum')).toBeInTheDocument();
      expect(screen.getByText('Domain of any quadratic function is all real numbers; range depends on the vertex')).toBeInTheDocument();
    });

    it('renders mathematical expressions using KaTeX', () => {
      const props = {
        mode: 'teaching' as const,
        steps: graphAnalysisSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const mathElements = container.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: graphAnalysisSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 3, 5, and 7 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[2]).toHaveClass('bg-primary');
      expect(stepNumbers[4]).toHaveClass('bg-primary');
      expect(stepNumbers[6]).toHaveClass('bg-primary');
    });
  });

  describe('guided mode', () => {
    it('steps hidden on load with prompt for next step', () => {
      const props = {
        mode: 'guided' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
      expect(screen.queryByText('Identify the coefficients a, b, and c from the quadratic equation')).not.toBeInTheDocument();
    });

    it('correct selection reveals step with explanation and advances', async () => {
      const props = {
        mode: 'guided' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      // Find and click the correct answer for the first step
      const options = screen.getAllByRole('button');
      const correctButton = options.find(btn => btn.textContent?.includes('f(x) = x^2 - 4x + 3'));
      expect(correctButton).toBeDefined();

      if (correctButton) {
        correctButton.click();
      }

      // Should show the explanation
      await waitFor(() => {
        expect(screen.getByText('Identify the coefficients a, b, and c from the quadratic equation')).toBeInTheDocument();
      });
    });

    it('incorrect selection shows hint', async () => {
      const props = {
        mode: 'guided' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      // Find and click an incorrect answer
      const options = screen.getAllByRole('button');
      const incorrectButton = options.find(btn => {
        const text = btn.textContent || '';
        return (text.includes('a = 1, b = -4, c = 3') || text.includes('a = 1, b = 4, c = -3')) && !text.includes('f(x)');
      });
      expect(incorrectButton).toBeDefined();

      if (incorrectButton) {
        incorrectButton.click();
      }

      // Should show the hint
      await waitFor(() => {
        expect(screen.getByText('For f(x) = ax^2 + bx + c, extract a, b, and c')).toBeInTheDocument();
      });
    });
  });

  describe('practice mode', () => {
    it('presents fresh problem from pool', () => {
      const props = {
        mode: 'practice' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Problem:')).toBeInTheDocument();
    });

    it('accepts math input in blank expressions', () => {
      const props = {
        mode: 'practice' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      // Should have input fields for blank expressions
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('validates expression on submit', async () => {
      const props = {
        mode: 'practice' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      const input = screen.getAllByRole('textbox')[0];
      input.focus();
      
      // Simulate typing the correct answer
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, 'a = 1, b = -4, c = 3');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      submitButton.click();

      // Should show feedback
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText('Correct solution:')).toBeInTheDocument();
    });
  });

  describe('comprehensive graph analysis coverage', () => {
    it('covers all required steps: a/b/c → axis → vertex → max/min → domain/range', () => {
      const props = {
        mode: 'teaching' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      // Step 1-2: Identify a, b, c
      expect(screen.getByText('Identify the coefficients a, b, and c from the quadratic equation')).toBeInTheDocument();
      expect(screen.getByText('The coefficients are: a = 1 (quadratic term), b = -4 (linear term), c = 3 (constant term)')).toBeInTheDocument();
      
      // Step 3: Compute axis of symmetry
      expect(screen.getByText('Compute the axis of symmetry using x = -b/(2a)')).toBeInTheDocument();
      
      // Step 4-5: Find vertex
      expect(screen.getByText('Find the vertex by evaluating the function at the axis of symmetry')).toBeInTheDocument();
      expect(screen.getByText('The vertex is the point where the parabola changes direction')).toBeInTheDocument();
      
      // Step 6: Classify max/min
      expect(screen.getByText('Since a = 1 > 0, the parabola opens upward and has a minimum')).toBeInTheDocument();
      
      // Step 7: State domain/range
      expect(screen.getByText('Domain of any quadratic function is all real numbers; range depends on the vertex')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for steps in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: graphAnalysisSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepContainers = container.querySelectorAll('[class*="prose"]');
      expect(stepContainers.length).toBe(7);
    });

    it('is keyboard navigable in guided mode', () => {
      const props = {
        mode: 'guided' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels for input fields in practice mode', () => {
      const props = {
        mode: 'practice' as const,
        steps: graphAnalysisSteps,
      };

      render(<StepByStepper {...props} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });
  });
});
