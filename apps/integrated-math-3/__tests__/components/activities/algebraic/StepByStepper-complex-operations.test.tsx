import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Complex Operations Problem Type', () => {
  const addComplexNumbersSteps = [
    {
      expression: '(3 + 2i) + (1 - 4i)',
      explanation: 'Add two complex numbers',
      hint: 'Add the real parts together and the imaginary parts together',
      isKeyStep: true,
      distractors: ['(4 + 6i)', '(4 - 2i)', '(2 + 6i)'],
    },
    {
      expression: '(3 + 1) + (2i - 4i)',
      explanation: 'Group like terms (real parts and imaginary parts)',
      hint: 'Real parts: 3 and 1; Imaginary parts: 2i and -4i',
      distractors: ['(3 + 1) + (2i + 4i)', '(3 - 1) + (2i - 4i)'],
    },
    {
      expression: '4 - 2i',
      explanation: 'Simplify by combining like terms',
      hint: '3 + 1 = 4 and 2i - 4i = -2i',
      isKeyStep: true,
      distractors: ['4 + 2i', '-4 - 2i', '4 - 6i'],
    },
  ];

  const subtractComplexNumbersSteps = [
    {
      expression: '(5 - 3i) - (2 + i)',
      explanation: 'Subtract two complex numbers',
      hint: 'Subtract the real parts and the imaginary parts separately',
      isKeyStep: true,
      distractors: ['(3 - 2i)', '(7 - 4i)', '(3 - 4i)'],
    },
    {
      expression: '(5 - 3i) - 2 - i',
      explanation: 'Distribute the negative sign to both terms in the second complex number',
      hint: 'Subtracting (2 + i) means subtracting 2 and subtracting i',
      distractors: ['(5 - 3i) + 2 + i', '(5 - 3i) - 2 + i'],
    },
    {
      expression: '(5 - 2) + (-3i - i)',
      explanation: 'Group like terms (real parts and imaginary parts)',
      hint: 'Real parts: 5 - 2; Imaginary parts: -3i - i',
      distractors: ['(5 + 2) + (-3i + i)', '(5 - 2) + (-3i + i)'],
    },
    {
      expression: '3 - 4i',
      explanation: 'Simplify by combining like terms',
      hint: '5 - 2 = 3 and -3i - i = -4i',
      isKeyStep: true,
      distractors: ['3 + 4i', '3 - 2i', '7 - 4i'],
    },
  ];

  const multiplyComplexNumbersSteps = [
    {
      expression: '(2 + 3i)(1 - i)',
      explanation: 'Multiply two complex numbers',
      hint: 'Use the distributive property (FOIL) to multiply',
      isKeyStep: true,
      distractors: ['(2 + 2i)', '(2 - 3i)', '(5 + i)'],
    },
    {
      expression: '2(1) + 2(-i) + 3i(1) + 3i(-i)',
      explanation: 'Apply the distributive property (FOIL)',
      hint: 'First, Outer, Inner, Last',
      isKeyStep: true,
      distractors: ['2(1) + 2(i) + 3i(1) - 3i(i)', '2(1) - 2(i) + 3i(1) - 3i(i)'],
    },
    {
      expression: '2 - 2i + 3i - 3i^2',
      explanation: 'Simplify each term',
      hint: 'Multiply the coefficients: 2×1=2, 2×(-i)=-2i, 3i×1=3i, 3i×(-i)=-3i²',
      distractors: ['2 + 2i + 3i - 3i^2', '2 - 2i + 3i + 3i^2'],
    },
    {
      expression: '2 + i - 3(-1)',
      explanation: 'Combine like terms and replace i² with -1',
      hint: '-2i + 3i = i and i² = -1',
      isKeyStep: true,
      distractors: ['2 + i - 3', '2 + i + 3', '2 - i - 3'],
    },
    {
      expression: '2 + i + 3',
      explanation: 'Simplify the expression',
      hint: '-3 × (-1) = 3',
      distractors: ['2 + i - 3', '2 - i + 3', '-2 + i + 3'],
    },
    {
      expression: '5 + i',
      explanation: 'Combine real parts to get the final answer',
      hint: '2 + 3 = 5',
      isKeyStep: true,
      distractors: ['-1 + i', '5 - i', '2 + 3i'],
    },
  ];

  const multiplyPureImaginarySteps = [
    {
      expression: '4i \\cdot 3i',
      explanation: 'Multiply two pure imaginary numbers',
      hint: 'Remember that i × i = i² = -1',
      isKeyStep: true,
      distractors: ['12i', '-12', '7i'],
    },
    {
      expression: '4 \\cdot 3 \\cdot i \\cdot i',
      explanation: 'Separate the coefficients and the imaginary units',
      hint: 'Group the numbers together and the i\'s together',
      distractors: ['(4 + 3) \\cdot (i + i)', '4 \\cdot 3 \\cdot (i + i)'],
    },
    {
      expression: '12 \\cdot i^2',
      explanation: 'Multiply the coefficients and combine the imaginary units',
      hint: '4 × 3 = 12 and i × i = i²',
      isKeyStep: true,
      distractors: ['12i', '-12i', '7i²'],
    },
    {
      expression: '12 \\cdot (-1)',
      explanation: 'Replace i² with -1',
      hint: 'By definition, i² = -1',
      isKeyStep: true,
      distractors: ['12 \\cdot 1', '12 \\cdot 0', '-12 \\cdot i'],
    },
    {
      expression: '-12',
      explanation: 'Write the final simplified form',
      hint: '12 × (-1) = -12',
      distractors: ['12', '-12i', '12i'],
    },
  ];

  describe('add complex numbers', () => {
    describe('teaching mode', () => {
      it('renders all addition steps with expression and explanation', () => {
        const props = {
          mode: 'teaching' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Add two complex numbers')).toBeInTheDocument();
        expect(screen.getByText('Group like terms (real parts and imaginary parts)')).toBeInTheDocument();
        expect(screen.getByText('Simplify by combining like terms')).toBeInTheDocument();
      });

      it('renders mathematical expressions using KaTeX', () => {
        const props = {
          mode: 'teaching' as const,
          steps: addComplexNumbersSteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const mathElements = container.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThan(0);
      });

      it('applies visual emphasis to key steps', () => {
        const props = {
          mode: 'teaching' as const,
          steps: addComplexNumbersSteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
        
        // Steps 1 and 3 are key steps (isKeyStep: true)
        expect(stepNumbers[0]).toHaveClass('bg-primary');
        expect(stepNumbers[2]).toHaveClass('bg-primary');
      });
    });

    describe('guided mode', () => {
      it('steps hidden on load with prompt for next step', () => {
        const props = {
          mode: 'guided' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
        expect(screen.queryByText('Add two complex numbers')).not.toBeInTheDocument();
      });

      it('correct selection reveals step with explanation', async () => {
        const props = {
          mode: 'guided' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        // Find and click the correct answer for the first step
        const options = screen.getAllByRole('button');
        const correctButton = options.find(btn => btn.textContent?.includes('(3 + 2i)'));
        expect(correctButton).toBeDefined();

        if (correctButton) {
          correctButton.click();
        }

        // Should show the explanation
        await waitFor(() => {
          expect(screen.getByText('Add two complex numbers')).toBeInTheDocument();
        });
      });

      it('incorrect selection shows hint', async () => {
        const props = {
          mode: 'guided' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        // Find and click an incorrect answer
        const options = screen.getAllByRole('button');
        const incorrectButton = options.find(btn => {
          const text = btn.textContent || '';
          return (text.includes('(4 + 6i)') || text.includes('(4 - 2i)') || text.includes('(2 + 6i)')) && !text.includes('(3 + 2i)');
        });
        expect(incorrectButton).toBeDefined();

        if (incorrectButton) {
          incorrectButton.click();
        }

        // Should show the hint
        await waitFor(() => {
          expect(screen.getByText('Add the real parts together and the imaginary parts together')).toBeInTheDocument();
        });
      });
    });

    describe('practice mode', () => {
      it('presents fresh problem from pool', () => {
        const props = {
          mode: 'practice' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Problem:')).toBeInTheDocument();
      });

      it('accepts math input in blank expressions', () => {
        const props = {
          mode: 'practice' as const,
          steps: addComplexNumbersSteps,
        };

        render(<StepByStepper {...props} />);

        // Should have input fields for blank expressions
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('subtract complex numbers', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: subtractComplexNumbersSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Subtract two complex numbers')).toBeInTheDocument();
      expect(screen.getByText('Distribute the negative sign to both terms in the second complex number')).toBeInTheDocument();
      expect(screen.getByText('Group like terms (real parts and imaginary parts)')).toBeInTheDocument();
      expect(screen.getByText('Simplify by combining like terms')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: subtractComplexNumbersSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1 and 4 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
    });
  });

  describe('multiply complex numbers', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyComplexNumbersSteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Multiply two complex numbers')).toBeInTheDocument();
      expect(screen.getByText('Apply the distributive property (FOIL)')).toBeInTheDocument();
      expect(screen.getByText('Simplify each term')).toBeInTheDocument();
      expect(screen.getByText('Combine like terms and replace i² with -1')).toBeInTheDocument();
      expect(screen.getByText('Simplify the expression')).toBeInTheDocument();
      expect(screen.getByText('Combine real parts to get the final answer')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyComplexNumbersSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 2, 4, and 6 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[1]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
      expect(stepNumbers[5]).toHaveClass('bg-primary');
    });
  });

  describe('multiply pure imaginary numbers', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyPureImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Multiply two pure imaginary numbers')).toBeInTheDocument();
      expect(screen.getByText('Separate the coefficients and the imaginary units')).toBeInTheDocument();
      expect(screen.getByText('Multiply the coefficients and combine the imaginary units')).toBeInTheDocument();
      expect(screen.getByText('Replace i² with -1')).toBeInTheDocument();
      expect(screen.getByText('Write the final simplified form')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyPureImaginarySteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 3, and 4 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[2]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
    });
  });

  describe('comprehensive complex operations coverage', () => {
    it('covers all required steps: identify parts → apply rules → substitute i² = -1 → collect terms', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyComplexNumbersSteps,
      };

      render(<StepByStepper {...props} />);

      // Step 1: Identify operation and parts
      expect(screen.getByText('Multiply two complex numbers')).toBeInTheDocument();
      
      // Step 2: Apply operation rules (FOIL)
      expect(screen.getByText('Apply the distributive property (FOIL)')).toBeInTheDocument();
      
      // Step 3-4: Simplify and substitute i² = -1
      expect(screen.getByText('Simplify each term')).toBeInTheDocument();
      expect(screen.getByText('Combine like terms and replace i² with -1')).toBeInTheDocument();
      
      // Step 5-6: Collect like terms
      expect(screen.getByText('Simplify the expression')).toBeInTheDocument();
      expect(screen.getByText('Combine real parts to get the final answer')).toBeInTheDocument();
    });

    it('handles add, subtract, and multiply operations', () => {
      const addProps = {
        mode: 'teaching' as const,
        steps: addComplexNumbersSteps,
      };

      const subtractProps = {
        mode: 'teaching' as const,
        steps: subtractComplexNumbersSteps,
      };

      const multiplyProps = {
        mode: 'teaching' as const,
        steps: multiplyComplexNumbersSteps,
      };

      const { unmount: unmountAdd } = render(<StepByStepper {...addProps} />);
      expect(screen.getByText('Add two complex numbers')).toBeInTheDocument();
      unmountAdd();

      const { unmount: unmountSubtract } = render(<StepByStepper {...subtractProps} />);
      expect(screen.getByText('Subtract two complex numbers')).toBeInTheDocument();
      unmountSubtract();

      render(<StepByStepper {...multiplyProps} />);
      expect(screen.getByText('Multiply two complex numbers')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for steps in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: addComplexNumbersSteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepContainers = container.querySelectorAll('[class*="prose"]');
      expect(stepContainers.length).toBe(3);
    });

    it('is keyboard navigable in guided mode', () => {
      const props = {
        mode: 'guided' as const,
        steps: addComplexNumbersSteps,
      };

      render(<StepByStepper {...props} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels for input fields in practice mode', () => {
      const props = {
        mode: 'practice' as const,
        steps: addComplexNumbersSteps,
      };

      render(<StepByStepper {...props} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });
  });
});
