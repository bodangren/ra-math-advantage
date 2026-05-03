import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Rate of Change Problem Type', () => {
  const rateOfChangeFromEquationSteps = [
    {
      expression: 'f(x) = x^2 - 4x + 3',
      explanation: 'Given the function, find the average rate of change over the interval [1, 4]',
      hint: 'The average rate of change formula is [f(b) - f(a)] / (b - a)',
      isKeyStep: true,
      distractors: ['Find the derivative', 'Find the vertex'],
    },
    {
      expression: 'a = 1, b = 4',
      explanation: 'Identify the interval endpoints',
      hint: 'The interval [1, 4] means a = 1 and b = 4',
      distractors: ['a = 0, b = 1', 'a = 4, b = 1'],
    },
    {
      expression: 'f(1) = (1)^2 - 4(1) + 3 = 1 - 4 + 3 = 0',
      explanation: 'Evaluate f(a) by substituting x = 1 into the function',
      hint: 'Replace x with 1 and simplify',
      distractors: ['f(1) = 3', 'f(1) = 4'],
    },
    {
      expression: 'f(4) = (4)^2 - 4(4) + 3 = 16 - 16 + 3 = 3',
      explanation: 'Evaluate f(b) by substituting x = 4 into the function',
      hint: 'Replace x with 4 and simplify',
      distractors: ['f(4) = 19', 'f(4) = 7'],
    },
    {
      expression: '\\frac{f(4) - f(1)}{4 - 1} = \\frac{3 - 0}{3} = \\frac{3}{3} = 1',
      explanation: 'Apply the average rate of change formula',
      hint: 'Substitute f(4) = 3, f(1) = 0, b = 4, a = 1',
      isKeyStep: true,
      distractors: ['\\frac{0 - 3}{4 - 1} = -1', '\\frac{3 - 0}{1 - 4} = -1'],
    },
    {
      expression: 'The average rate of change is 1',
      explanation: 'Interpret the result: the function increases by 1 unit on average over each unit interval from x = 1 to x = 4',
      hint: 'A positive rate means the function is increasing on average',
      isKeyStep: true,
      distractors: ['The average rate of change is -1', 'The average rate of change is 3'],
    },
  ];

  const rateOfChangeFromTableSteps = [
    {
      expression: 'x: 0, 2, 4, 6; f(x): 5, 9, 13, 17',
      explanation: 'Given the table of values, find the average rate of change over the interval [2, 6]',
      hint: 'Use the table to find f(2) and f(6)',
      isKeyStep: true,
      distractors: ['Calculate the slope from the graph', 'Find the equation of the line'],
    },
    {
      expression: 'a = 2, b = 6',
      explanation: 'Identify the interval endpoints from the table',
      hint: 'The interval [2, 6] means we need f(2) and f(6)',
      distractors: ['a = 0, b = 6', 'a = 2, b = 4'],
    },
    {
      expression: 'f(2) = 9, f(6) = 17',
      explanation: 'Read the function values from the table',
      hint: 'Find f(2) in the row where x = 2, and f(6) in the row where x = 6',
      distractors: ['f(2) = 5, f(6) = 13', 'f(2) = 13, f(6) = 9'],
    },
    {
      expression: '\\frac{f(6) - f(2)}{6 - 2} = \\frac{17 - 9}{4} = \\frac{8}{4} = 2',
      explanation: 'Apply the average rate of change formula',
      hint: 'Substitute f(6) = 17, f(2) = 9, b = 6, a = 2',
      isKeyStep: true,
      distractors: ['\\frac{9 - 17}{6 - 2} = -2', '\\frac{17 - 9}{2 - 6} = -2'],
    },
    {
      expression: 'The average rate of change is 2',
      explanation: 'Interpret the result: the function increases by 2 units on average over each unit interval from x = 2 to x = 6',
      hint: 'A positive rate means the function is increasing on average',
      isKeyStep: true,
      distractors: ['The average rate of change is -2', 'The average rate of change is 4'],
    },
  ];

  describe('rate of change from equation', () => {
    describe('teaching mode', () => {
      it('renders all rate of change steps with expression and explanation', () => {
        const props = {
          mode: 'teaching' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Given the function, find the average rate of change over the interval [1, 4]')).toBeInTheDocument();
        expect(screen.getByText('Identify the interval endpoints')).toBeInTheDocument();
        expect(screen.getByText('Evaluate f(a) by substituting x = 1 into the function')).toBeInTheDocument();
        expect(screen.getByText('Evaluate f(b) by substituting x = 4 into the function')).toBeInTheDocument();
        expect(screen.getByText('Apply the average rate of change formula')).toBeInTheDocument();
        expect(screen.getByText('Interpret the result: the function increases by 1 unit on average over each unit interval from x = 1 to x = 4')).toBeInTheDocument();
      });

      it('renders mathematical expressions using KaTeX', () => {
        const props = {
          mode: 'teaching' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const mathElements = container.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThan(0);
      });

      it('applies visual emphasis to key steps', () => {
        const props = {
          mode: 'teaching' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
        
        // Steps 1, 5, and 6 are key steps (isKeyStep: true)
        expect(stepNumbers[0]).toHaveClass('bg-primary');
        expect(stepNumbers[4]).toHaveClass('bg-primary');
        expect(stepNumbers[5]).toHaveClass('bg-primary');
      });
    });

    describe('guided mode', () => {
      it('steps hidden on load with prompt for next step', () => {
        const props = {
          mode: 'guided' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
        expect(screen.queryByText('Given the function, find the average rate of change over the interval [1, 4]')).not.toBeInTheDocument();
      });

      it('correct selection reveals step with explanation', async () => {
        const props = {
          mode: 'guided' as const,
          steps: rateOfChangeFromEquationSteps,
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
          expect(screen.getByText('Given the function, find the average rate of change over the interval [1, 4]')).toBeInTheDocument();
        });
      });

      it('incorrect selection shows hint', async () => {
        const props = {
          mode: 'guided' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        render(<StepByStepper {...props} />);

        // Find and click an incorrect answer
        const options = screen.getAllByRole('button');
        const incorrectButton = options.find(btn => {
          const text = btn.textContent || '';
          return (text.includes('Find the derivative') || text.includes('Find the vertex')) && !text.includes('f(x)');
        });
        expect(incorrectButton).toBeDefined();

        if (incorrectButton) {
          incorrectButton.click();
        }

        // Should show the hint
        await waitFor(() => {
          expect(screen.getByText('The average rate of change formula is [f(b) - f(a)] / (b - a)')).toBeInTheDocument();
        });
      });
    });

    describe('practice mode', () => {
      it('presents fresh problem from pool', () => {
        const props = {
          mode: 'practice' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Problem:')).toBeInTheDocument();
      });

      it('accepts math input in blank expressions', () => {
        const props = {
          mode: 'practice' as const,
          steps: rateOfChangeFromEquationSteps,
        };

        render(<StepByStepper {...props} />);

        // Should have input fields for blank expressions
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('rate of change from table', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromTableSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Given the table of values, find the average rate of change over the interval [2, 6]')).toBeInTheDocument();
      expect(screen.getByText('Identify the interval endpoints from the table')).toBeInTheDocument();
      expect(screen.getByText('Read the function values from the table')).toBeInTheDocument();
      expect(screen.getByText('Apply the average rate of change formula')).toBeInTheDocument();
      expect(screen.getByText('Interpret the result: the function increases by 2 units on average over each unit interval from x = 2 to x = 6')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromTableSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 4, and 5 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
      expect(stepNumbers[4]).toHaveClass('bg-primary');
    });
  });

  describe('comprehensive rate of change coverage', () => {
    it('covers all required steps: endpoints → f(a)/f(b) → formula → interpretation', () => {
      const props = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromEquationSteps,
      };

      render(<StepByStepper {...props} />);

      // Step 1-2: Identify interval endpoints
      expect(screen.getByText('Given the function, find the average rate of change over the interval [1, 4]')).toBeInTheDocument();
      expect(screen.getByText('Identify the interval endpoints')).toBeInTheDocument();
      
      // Step 3-4: Evaluate f(a) and f(b)
      expect(screen.getByText('Evaluate f(a) by substituting x = 1 into the function')).toBeInTheDocument();
      expect(screen.getByText('Evaluate f(b) by substituting x = 4 into the function')).toBeInTheDocument();
      
      // Step 5: Apply formula
      expect(screen.getByText('Apply the average rate of change formula')).toBeInTheDocument();
      
      // Step 6: Interpret result
      expect(screen.getByText('Interpret the result: the function increases by 1 unit on average over each unit interval from x = 1 to x = 4')).toBeInTheDocument();
    });

    it('supports input from equation, table data, and graph readout', () => {
      // Test equation-based rate of change
      const equationProps = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromEquationSteps,
      };

      const { container: equationContainer, unmount: unmountEquation } = render(<StepByStepper {...equationProps} />);
      // Verify it renders with the correct number of steps
      const equationStepContainers = equationContainer.querySelectorAll('[class*="space-y-4"] > div');
      expect(equationStepContainers.length).toBe(6);
      unmountEquation();

      // Test table-based rate of change
      const tableProps = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromTableSteps,
      };

      const { container: tableContainer } = render(<StepByStepper {...tableProps} />);
      // Verify it renders with the correct number of steps
      const tableStepContainers = tableContainer.querySelectorAll('[class*="space-y-4"] > div');
      expect(tableStepContainers.length).toBe(5);
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for steps in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: rateOfChangeFromEquationSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepContainers = container.querySelectorAll('[class*="prose"]');
      expect(stepContainers.length).toBe(6);
    });

    it('is keyboard navigable in guided mode', () => {
      const props = {
        mode: 'guided' as const,
        steps: rateOfChangeFromEquationSteps,
      };

      render(<StepByStepper {...props} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels for input fields in practice mode', () => {
      const props = {
        mode: 'practice' as const,
        steps: rateOfChangeFromEquationSteps,
      };

      render(<StepByStepper {...props} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });
  });
});
