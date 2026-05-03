import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Factor Trinomial Problem Type', () => {
  const factorTrinomialStepsA1 = [
    {
      expression: 'x^2 + 5x + 6',
      explanation: 'Identify the quadratic trinomial to factor',
      hint: 'We need two numbers that multiply to 6 and add to 5',
      isKeyStep: true,
      distractors: ['x^2 + 5x - 6', 'x^2 - 5x + 6'],
    },
    {
      expression: 'ac = 1*6 = 6, b = 5',
      explanation: 'For ax^2 + bx + c, find ac and b',
      hint: 'a is 1, c is 6, so ac = 6; b is 5',
      distractors: ['ac = 5, b = 6', 'ac = 1, b = 5'],
    },
    {
      expression: 'Numbers: 2 and 3 (2*3=6, 2+3=5)',
      explanation: 'Find two numbers that multiply to ac and add to b',
      hint: 'Try factor pairs of 6: (1,6), (2,3)',
      distractors: ['Numbers: 1 and 6', 'Numbers: -2 and -3'],
    },
    {
      expression: 'x^2 + 2x + 3x + 6',
      explanation: 'Split the middle term using the two numbers',
      hint: 'Rewrite 5x as 2x + 3x',
      distractors: ['x^2 + 3x + 2x + 6', 'x^2 + 1x + 6x + 6'],
    },
    {
      expression: 'x(x + 2) + 3(x + 2)',
      explanation: 'Factor out the GCF from each pair',
      hint: 'Factor x from first two terms, 3 from last two',
      distractors: ['x(x + 3) + 2(x + 2)', 'x(x + 2) - 3(x + 2)'],
    },
    {
      expression: '(x + 2)(x + 3)',
      explanation: 'Factor out the common binomial factor',
      hint: 'Both terms have (x + 2), so factor that out',
      isKeyStep: true,
      distractors: ['(x + 1)(x + 6)', '(x - 2)(x - 3)'],
    },
  ];

  const factorTrinomialStepsANot1 = [
    {
      expression: '2x^2 + 7x + 3',
      explanation: 'Identify the quadratic trinomial to factor',
      hint: 'a is not 1, so we use the ac-method',
      isKeyStep: true,
      distractors: ['2x^2 - 7x + 3', '3x^2 + 7x + 2'],
    },
    {
      expression: 'ac = 2*3 = 6, b = 7',
      explanation: 'Calculate ac and identify b',
      hint: 'a=2, c=3, so ac=6; b=7',
      distractors: ['ac=7, b=6', 'ac=5, b=7'],
    },
    {
      expression: 'Numbers: 1 and 6 (1*6=6, 1+6=7)',
      explanation: 'Find two numbers that multiply to ac and add to b',
      hint: 'Factor pairs of 6: (1,6), (2,3)',
      distractors: ['Numbers: 2 and 3', 'Numbers: -1 and -6'],
    },
    {
      expression: '2x^2 + 1x + 6x + 3',
      explanation: 'Split the middle term',
      hint: 'Rewrite 7x as 1x + 6x',
      distractors: ['2x^2 + 6x + 1x + 3', '2x^2 + 2x + 3x + 3'],
    },
    {
      expression: 'x(2x + 1) + 3(2x + 1)',
      explanation: 'Factor out GCF from each pair',
      hint: 'Factor x from first two terms, 3 from last two',
      distractors: ['2x(x + 1) + 3(x + 1)', 'x(2x + 3) + 1(2x + 3)'],
    },
    {
      expression: '(2x + 1)(x + 3)',
      explanation: 'Factor out the common binomial',
      hint: 'Both terms have (2x + 1)',
      isKeyStep: true,
      distractors: ['(2x + 3)(x + 1)', '(2x - 1)(x - 3)'],
    },
  ];

  const factorDifferenceOfSquaresSteps = [
    {
      expression: 'x^2 - 9',
      explanation: 'Identify the difference of squares',
      hint: 'a^2 - b^2 = (a - b)(a + b)',
      isKeyStep: true,
      distractors: ['x^2 + 9', 'x^2 - 6'],
    },
    {
      expression: 'a = x, b = 3 (since 3^2 = 9)',
      explanation: 'Identify a and b',
      hint: 'x^2 is a^2, 9 is 3^2',
      distractors: ['a = 3, b = x', 'a = x, b = 9'],
    },
    {
      expression: '(x - 3)(x + 3)',
      explanation: 'Apply the difference of squares formula',
      hint: '(a - b)(a + b)',
      isKeyStep: true,
      distractors: ['(x - 3)^2', '(x + 3)^2'],
    },
  ];

  const factorPerfectSquareSteps = [
    {
      expression: 'x^2 + 6x + 9',
      explanation: 'Identify the perfect square trinomial',
      hint: 'a^2 + 2ab + b^2 = (a + b)^2',
      isKeyStep: true,
      distractors: ['x^2 + 6x - 9', 'x^2 - 6x + 9'],
    },
    {
      expression: 'a = x, b = 3 (2ab = 2*x*3 = 6x)',
      explanation: 'Verify it fits the pattern',
      hint: 'Check that 2ab equals the middle term',
      distractors: ['a = 3, b = x', 'a = x, b = 6'],
    },
    {
      expression: '(x + 3)^2',
      explanation: 'Apply the perfect square formula',
      hint: '(a + b)^2',
      isKeyStep: true,
      distractors: ['(x + 3)(x - 3)', '(x - 3)^2'],
    },
  ];

  const factorGCFFirstSteps = [
    {
      expression: '2x^2 + 10x + 12',
      explanation: 'First, factor out the greatest common factor (GCF)',
      hint: 'All terms are divisible by 2',
      isKeyStep: true,
      distractors: ['2x^2 - 10x + 12', '3x^2 + 10x + 12'],
    },
    {
      expression: '2(x^2 + 5x + 6)',
      explanation: 'Factor out the GCF of 2',
      hint: '2*x^2 + 2*5x + 2*6',
      distractors: ['2(x^2 + 10x + 12)', 'x(2x + 10) + 12'],
    },
    {
      expression: '2(x + 2)(x + 3)',
      explanation: 'Now factor the trinomial inside the parentheses',
      hint: 'Use the same method as before for x^2 + 5x + 6',
      isKeyStep: true,
      distractors: ['2(x + 1)(x + 6)', '(2x + 4)(x + 3)'],
    },
  ];

  describe('teaching mode', () => {
    it('renders all factoring steps for a=1 trinomial', () => {
      render(<StepByStepper mode="teaching" steps={factorTrinomialStepsA1} />);
      expect(screen.getByText('Identify the quadratic trinomial to factor')).toBeInTheDocument();
      expect(screen.getByText('For ax^2 + bx + c, find ac and b')).toBeInTheDocument();
      expect(screen.getByText('Find two numbers that multiply to ac and add to b')).toBeInTheDocument();
      expect(screen.getByText('Split the middle term using the two numbers')).toBeInTheDocument();
      expect(screen.getByText('Factor out the GCF from each pair')).toBeInTheDocument();
      expect(screen.getByText('Factor out the common binomial factor')).toBeInTheDocument();
    });

    it('renders all factoring steps for a≠1 trinomial', () => {
      render(<StepByStepper mode="teaching" steps={factorTrinomialStepsANot1} />);
      expect(screen.getByText('Identify the quadratic trinomial to factor')).toBeInTheDocument();
      expect(screen.getByText('Calculate ac and identify b')).toBeInTheDocument();
    });

    it('renders difference of squares steps', () => {
      render(<StepByStepper mode="teaching" steps={factorDifferenceOfSquaresSteps} />);
      expect(screen.getByText('Identify the difference of squares')).toBeInTheDocument();
      expect(screen.getByText('Apply the difference of squares formula')).toBeInTheDocument();
    });

    it('renders perfect square trinomial steps', () => {
      render(<StepByStepper mode="teaching" steps={factorPerfectSquareSteps} />);
      expect(screen.getByText('Identify the perfect square trinomial')).toBeInTheDocument();
      expect(screen.getByText('Apply the perfect square formula')).toBeInTheDocument();
    });

    it('renders GCF first steps', () => {
      render(<StepByStepper mode="teaching" steps={factorGCFFirstSteps} />);
      expect(screen.getByText('First, factor out the greatest common factor (GCF)')).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('correct selection reveals step for a=1 trinomial', async () => {
      render(<StepByStepper mode="guided" steps={factorTrinomialStepsA1} />);
      const options = screen.getAllByRole('button');
      const correctButton = options.find(btn => btn.textContent?.includes('x^2 + 5x + 6'));
      expect(correctButton).toBeDefined();
      if (correctButton) correctButton.click();
      await waitFor(() => {
        expect(screen.getByText('Identify the quadratic trinomial to factor')).toBeInTheDocument();
      });
    });
  });

  describe('practice mode', () => {
    it('accepts input and shows solution for a=1 trinomial', async () => {
      render(<StepByStepper mode="practice" steps={factorTrinomialStepsA1} />);
      expect(screen.getByText('Problem:')).toBeInTheDocument();
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
