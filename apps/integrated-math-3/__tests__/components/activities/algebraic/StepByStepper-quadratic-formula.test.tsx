import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Quadratic Formula Problem Type', () => {
  const quadraticFormulaSteps = [
    {
      expression: '2x^2 + 5x - 3 = 0',
      explanation: 'Identify a, b, and c in standard form ax^2 + bx + c = 0',
      hint: 'a is the coefficient of x^2, b of x, c is the constant',
      isKeyStep: true,
      distractors: ['a=2, b=-5, c=3', 'a=2, b=5, c=3'],
    },
    {
      expression: 'a = 2, b = 5, c = -3',
      explanation: 'List the values of a, b, and c',
      hint: 'Pay attention to the signs',
      distractors: ['a=2, b=-5, c=3', 'a=-2, b=5, c=-3'],
    },
    {
      expression: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      explanation: 'Write the quadratic formula',
      hint: 'Memorize this formula!',
      isKeyStep: true,
      distractors: ['x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}', 'x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
    },
    {
      expression: 'x = \\frac{-(5) \\pm \\sqrt{(5)^2 - 4(2)(-3)}}{2(2)}',
      explanation: 'Substitute a, b, and c into the formula',
      hint: 'Be careful with the negative signs',
      distractors: ['x = \\frac{-5 \\pm \\sqrt{25 - 24}}{4}', 'x = \\frac{-5 \\pm \\sqrt{25 + 24}}{2}'],
    },
    {
      expression: 'x = \\frac{-5 \\pm \\sqrt{25 + 24}}{4}',
      explanation: 'Simplify the discriminant',
      hint: '-4ac = -4*2*(-3) = +24',
      distractors: ['x = \\frac{-5 \\pm \\sqrt{25 - 24}}{4}', 'x = \\frac{-5 \\pm \\sqrt{49}}{2}'],
    },
    {
      expression: 'x = \\frac{-5 \\pm \\sqrt{49}}{4}',
      explanation: 'Add the terms under the square root',
      hint: '25+24=49',
      distractors: ['x = \\frac{-5 \\pm \\sqrt{1}}{4}', 'x = \\frac{-5 \\pm 7}{2}'],
    },
    {
      expression: 'x = \\frac{-5 \\pm 7}{4}',
      explanation: 'Simplify the square root',
      hint: '√49 = 7',
      isKeyStep: true,
      distractors: ['x = \\frac{-5 \\pm 49}{4}', 'x = \\frac{-5 \\pm 7}{2}'],
    },
    {
      expression: 'x = \\frac{-5 + 7}{4} = \\frac{2}{4} = \\frac{1}{2}, x = \\frac{-5 - 7}{4} = \\frac{-12}{4} = -3',
      explanation: 'Calculate both solutions',
      hint: 'Compute both the + and - cases',
      isKeyStep: true,
      distractors: ['x = 1, x = -3', 'x = 1/2, x = 3'],
    },
  ];

  describe('teaching mode', () => {
    it('renders all quadratic formula steps', () => {
      render(<StepByStepper mode="teaching" steps={quadraticFormulaSteps} />);
      expect(screen.getByText('Identify a, b, and c in standard form ax^2 + bx + c = 0')).toBeInTheDocument();
      expect(screen.getByText('Write the quadratic formula')).toBeInTheDocument();
      expect(screen.getByText('Calculate both solutions')).toBeInTheDocument();
    });
  });
});
