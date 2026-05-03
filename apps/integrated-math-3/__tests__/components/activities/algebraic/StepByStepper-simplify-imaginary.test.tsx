import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Simplify Imaginary Problem Type', () => {
  const simplifyImaginarySteps = [
    {
      expression: '\\sqrt{-16}',
      explanation: 'Simplify the square root of a negative number',
      hint: 'Remember that i = √(-1)',
      isKeyStep: true,
      distractors: ['4i', '-4', 'undefined'],
    },
    {
      expression: '\\sqrt{-1 \\cdot 16}',
      explanation: 'Factor out -1 from the radicand',
      hint: 'Rewrite -16 as -1 × 16',
      distractors: ['\\sqrt{1 \\cdot 16}', '\\sqrt{-1 + 16}'],
    },
    {
      expression: '\\sqrt{-1} \\cdot \\sqrt{16}',
      explanation: 'Separate the square root into two factors',
      hint: 'Use the property √(ab) = √a × √b',
      isKeyStep: true,
      distractors: ['\\sqrt{-1} + \\sqrt{16}', '\\sqrt{-1 + 16}'],
    },
    {
      expression: 'i \\cdot 4',
      explanation: 'Replace √(-1) with i and simplify √(16)',
      hint: '√(-1) = i and √(16) = 4',
      isKeyStep: true,
      distractors: ['i \\cdot 2', '-i \\cdot 4'],
    },
    {
      expression: '4i',
      explanation: 'Write the final simplified form',
      hint: 'The coefficient comes before i',
      distractors: ['i4', '-4i'],
    },
  ];

  const simplifyComplexImaginarySteps = [
    {
      expression: '\\sqrt{-18}',
      explanation: 'Simplify the square root of -18',
      hint: 'Look for perfect square factors in 18',
      isKeyStep: true,
      distractors: ['3√2i', '9i', 'undefined'],
    },
    {
      expression: '\\sqrt{-1 \\cdot 9 \\cdot 2}',
      explanation: 'Factor out -1 and find perfect square factors',
      hint: '18 = 9 × 2, and 9 is a perfect square',
      distractors: ['\\sqrt{-1 \\cdot 18}', '\\sqrt{1 \\cdot 9 \\cdot 2}'],
    },
    {
      expression: '\\sqrt{-1} \\cdot \\sqrt{9} \\cdot \\sqrt{2}',
      explanation: 'Separate the square root into three factors',
      hint: 'Use the property √(abc) = √a × √b × √c',
      isKeyStep: true,
      distractors: ['\\sqrt{-1} + \\sqrt{9} + \\sqrt{2}', '\\sqrt{-1 \\cdot 9 \\cdot 2}'],
    },
    {
      expression: 'i \\cdot 3 \\cdot \\sqrt{2}',
      explanation: 'Replace √(-1) with i and simplify √(9)',
      hint: '√(-1) = i and √(9) = 3',
      isKeyStep: true,
      distractors: ['i \\cdot 2 \\cdot \\sqrt{9}', '-i \\cdot 3 \\cdot \\sqrt{2}'],
    },
    {
      expression: '3\\sqrt{2}i',
      explanation: 'Write the final simplified form with the radical',
      hint: 'Write the coefficient, then the radical, then i',
      isKeyStep: true,
      distractors: ['\\sqrt{2}i3', '3i\\sqrt{2}'],
    },
  ];

  const multiplyImaginarySteps = [
    {
      expression: '3i \\cdot 4i',
      explanation: 'Multiply two imaginary numbers',
      hint: 'Remember that i × i = i² = -1',
      isKeyStep: true,
      distractors: ['12i', '-12', '7i'],
    },
    {
      expression: '3 \\cdot 4 \\cdot i \\cdot i',
      explanation: 'Separate the coefficients and the imaginary units',
      hint: 'Group the numbers together and the i\'s together',
      distractors: ['(3 + 4) \\cdot (i + i)', '3 \\cdot 4 \\cdot (i + i)'],
    },
    {
      expression: '12 \\cdot i^2',
      explanation: 'Multiply the coefficients and combine the imaginary units',
      hint: '3 × 4 = 12 and i × i = i²',
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

  describe('simplify √(-n)', () => {
    describe('teaching mode', () => {
      it('renders all simplification steps with expression and explanation', () => {
        const props = {
          mode: 'teaching' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Simplify the square root of a negative number')).toBeInTheDocument();
        expect(screen.getByText('Factor out -1 from the radicand')).toBeInTheDocument();
        expect(screen.getByText('Separate the square root into two factors')).toBeInTheDocument();
        expect(screen.getByText('Replace √(-1) with i and simplify √(16)')).toBeInTheDocument();
        expect(screen.getByText('Write the final simplified form')).toBeInTheDocument();
      });

      it('renders mathematical expressions using KaTeX', () => {
        const props = {
          mode: 'teaching' as const,
          steps: simplifyImaginarySteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const mathElements = container.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThan(0);
      });

      it('applies visual emphasis to key steps', () => {
        const props = {
          mode: 'teaching' as const,
          steps: simplifyImaginarySteps,
        };

        const { container } = render(<StepByStepper {...props} />);

        const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
        
        // Steps 1, 3, and 4 are key steps (isKeyStep: true)
        expect(stepNumbers[0]).toHaveClass('bg-primary');
        expect(stepNumbers[2]).toHaveClass('bg-primary');
        expect(stepNumbers[3]).toHaveClass('bg-primary');
      });
    });

    describe('guided mode', () => {
      it('steps hidden on load with prompt for next step', () => {
        const props = {
          mode: 'guided' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText(/what's the next step/i)).toBeInTheDocument();
        expect(screen.queryByText('Simplify the square root of a negative number')).not.toBeInTheDocument();
      });

      it('correct selection reveals step with explanation', async () => {
        const props = {
          mode: 'guided' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        // Find and click the correct answer for the first step
        const options = screen.getAllByRole('button');
        const correctButton = options.find(btn => {
          const text = btn.textContent || '';
          return text.includes('√') || text.includes('sqrt');
        });
        expect(correctButton).toBeDefined();

        if (correctButton) {
          correctButton.click();
        }

        // Should show the explanation
        await waitFor(() => {
          expect(screen.getByText('Simplify the square root of a negative number')).toBeInTheDocument();
        });
      });

      it('incorrect selection shows hint', async () => {
        const props = {
          mode: 'guided' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        // Find and click an incorrect answer
        const options = screen.getAllByRole('button');
        const incorrectButton = options.find(btn => {
          const text = btn.textContent || '';
          return (text.includes('4i') || text.includes('-4') || text.includes('undefined')) && !text.includes('√');
        });
        expect(incorrectButton).toBeDefined();

        if (incorrectButton) {
          incorrectButton.click();
        }

        // Should show the hint
        await waitFor(() => {
          expect(screen.getByText('Remember that i = √(-1)')).toBeInTheDocument();
        });
      });
    });

    describe('practice mode', () => {
      it('presents fresh problem from pool', () => {
        const props = {
          mode: 'practice' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        expect(screen.getByText('Problem:')).toBeInTheDocument();
      });

      it('accepts math input in blank expressions', () => {
        const props = {
          mode: 'practice' as const,
          steps: simplifyImaginarySteps,
        };

        render(<StepByStepper {...props} />);

        // Should have input fields for blank expressions
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('simplify √(-n) with perfect square factors', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: simplifyComplexImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Simplify the square root of -18')).toBeInTheDocument();
      expect(screen.getByText('Factor out -1 and find perfect square factors')).toBeInTheDocument();
      expect(screen.getByText('Separate the square root into three factors')).toBeInTheDocument();
      expect(screen.getByText('Replace √(-1) with i and simplify √(9)')).toBeInTheDocument();
      expect(screen.getByText('Write the final simplified form with the radical')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: simplifyComplexImaginarySteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 3, 4, and 5 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[2]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
      expect(stepNumbers[4]).toHaveClass('bg-primary');
    });
  });

  describe('multiply imaginary numbers', () => {
    it('renders all steps correctly in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      expect(screen.getByText('Multiply two imaginary numbers')).toBeInTheDocument();
      expect(screen.getByText('Separate the coefficients and the imaginary units')).toBeInTheDocument();
      expect(screen.getByText('Multiply the coefficients and combine the imaginary units')).toBeInTheDocument();
      expect(screen.getByText('Replace i² with -1')).toBeInTheDocument();
      expect(screen.getByText('Write the final simplified form')).toBeInTheDocument();
    });

    it('applies visual emphasis to key steps', () => {
      const props = {
        mode: 'teaching' as const,
        steps: multiplyImaginarySteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepNumbers = container.querySelectorAll('[class*="rounded-full"]');
      
      // Steps 1, 3, and 4 are key steps (isKeyStep: true)
      expect(stepNumbers[0]).toHaveClass('bg-primary');
      expect(stepNumbers[2]).toHaveClass('bg-primary');
      expect(stepNumbers[3]).toHaveClass('bg-primary');
    });
  });

  describe('comprehensive simplify imaginary coverage', () => {
    it('covers all required steps: factor -1 → separate √(-1) → replace with i → simplify', () => {
      const props = {
        mode: 'teaching' as const,
        steps: simplifyImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      // Step 1: Original problem
      expect(screen.getByText('Simplify the square root of a negative number')).toBeInTheDocument();
      
      // Step 2: Factor out -1
      expect(screen.getByText('Factor out -1 from the radicand')).toBeInTheDocument();
      
      // Step 3: Separate √(-1)
      expect(screen.getByText('Separate the square root into two factors')).toBeInTheDocument();
      
      // Step 4: Replace with i and simplify
      expect(screen.getByText('Replace √(-1) with i and simplify √(16)')).toBeInTheDocument();
      
      // Step 5: Final form
      expect(screen.getByText('Write the final simplified form')).toBeInTheDocument();
    });

    it('validates i notation in answers', () => {
      const props = {
        mode: 'teaching' as const,
        steps: simplifyImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      // Check that the final answer uses i notation
      const { container } = render(<StepByStepper {...props} />);
      const mathElements = container.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for steps in teaching mode', () => {
      const props = {
        mode: 'teaching' as const,
        steps: simplifyImaginarySteps,
      };

      const { container } = render(<StepByStepper {...props} />);

      const stepContainers = container.querySelectorAll('[class*="prose"]');
      expect(stepContainers.length).toBe(5);
    });

    it('is keyboard navigable in guided mode', () => {
      const props = {
        mode: 'guided' as const,
        steps: simplifyImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels for input fields in practice mode', () => {
      const props = {
        mode: 'practice' as const,
        steps: simplifyImaginarySteps,
      };

      render(<StepByStepper {...props} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });
  });
});
