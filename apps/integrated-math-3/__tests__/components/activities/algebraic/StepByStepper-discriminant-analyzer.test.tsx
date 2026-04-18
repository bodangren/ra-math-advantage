import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Discriminant Analysis Problem Type', () => {
  const discriminantPositiveSteps = [
    {
      expression: 'x^2 + 5x + 6 = 0',
      explanation: 'Start with quadratic equation',
      hint: 'We will analyze the discriminant',
      isKeyStep: true,
      distractors: ['x^2 - 5x + 6 = 0', 'x^2 + 5x - 6 = 0'],
    },
    {
      expression: 'a = 1, b = 5, c = 6',
      explanation: 'Identify a, b, c',
      hint: 'a=1, b=5, c=6',
      distractors: ['a=1, b=-5, c=6', 'a=1, b=5, c=-6'],
    },
    {
      expression: 'D = b^2 - 4ac',
      explanation: 'Discriminant formula',
      hint: 'D = b² - 4ac',
      isKeyStep: true,
      distractors: ['D = b^2 + 4ac', 'D = 4ac - b^2'],
    },
    {
      expression: 'D = (5)^2 - 4(1)(6) = 25 - 24 = 1',
      explanation: 'Calculate discriminant',
      hint: '25 - 24 = 1',
      distractors: ['D = 25 + 24 = 49', 'D = 25 - 24 = -1'],
    },
    {
      expression: 'D = 1 > 0',
      explanation: 'Discriminant is positive',
      hint: 'D > 0 means two distinct real solutions',
      isKeyStep: true,
      distractors: ['D = 1 < 0', 'D = 1 = 0'],
    },
    {
      expression: 'Two distinct real solutions',
      explanation: 'Conclusion',
      hint: 'Positive discriminant → two real roots',
      isKeyStep: true,
      distractors: ['One real solution', 'Two imaginary solutions'],
    },
  ];

  const discriminantZeroSteps = [
    {
      expression: 'x^2 + 4x + 4 = 0',
      explanation: 'Start with quadratic equation',
      hint: 'Discriminant will be zero',
      isKeyStep: true,
      distractors: ['x^2 - 4x + 4 = 0', 'x^2 + 4x - 4 = 0'],
    },
    {
      expression: 'a=1, b=4, c=4',
      explanation: 'Identify a,b,c',
      hint: 'a=1, b=4, c=4',
      distractors: ['a=1, b=-4, c=4', 'a=1, b=4, c=-4'],
    },
    {
      expression: 'D = (4)^2 - 4(1)(4) = 16 - 16 = 0',
      explanation: 'Calculate discriminant',
      hint: '16 - 16 = 0',
      distractors: ['D = 16 + 16 = 32', 'D = 16 - 16 = -0'],
    },
    {
      expression: 'D = 0',
      explanation: 'Discriminant is zero',
      hint: 'D = 0 means one real solution (repeated root)',
      isKeyStep: true,
      distractors: ['D = 0 > 0', 'D = 0 < 0'],
    },
    {
      expression: 'One real solution (repeated root)',
      explanation: 'Conclusion',
      hint: 'Zero discriminant → one real root',
      isKeyStep: true,
      distractors: ['Two distinct real solutions', 'Two imaginary solutions'],
    },
  ];

  const discriminantNegativeSteps = [
    {
      expression: 'x^2 + 2x + 5 = 0',
      explanation: 'Start with quadratic equation',
      hint: 'Discriminant will be negative',
      isKeyStep: true,
      distractors: ['x^2 - 2x + 5 = 0', 'x^2 + 2x - 5 = 0'],
    },
    {
      expression: 'a=1, b=2, c=5',
      explanation: 'Identify a,b,c',
      hint: 'a=1, b=2, c=5',
      distractors: ['a=1, b=-2, c=5', 'a=1, b=2, c=-5'],
    },
    {
      expression: 'D = (2)^2 - 4(1)(5) = 4 - 20 = -16',
      explanation: 'Calculate discriminant',
      hint: '4 - 20 = -16',
      distractors: ['D = 4 + 20 = 24', 'D = 4 - 20 = 16'],
    },
    {
      expression: 'D = -16 < 0',
      explanation: 'Discriminant is negative',
      hint: 'D < 0 means two imaginary solutions',
      isKeyStep: true,
      distractors: ['D = -16 > 0', 'D = -16 = 0'],
    },
    {
      expression: 'Two imaginary solutions',
      explanation: 'Conclusion',
      hint: 'Negative discriminant → two complex conjugate roots',
      isKeyStep: true,
      distractors: ['Two distinct real solutions', 'One real solution'],
    },
  ];

  describe('teaching mode', () => {
    it('renders positive discriminant steps', () => {
      render(<StepByStepper mode="teaching" steps={discriminantPositiveSteps} />);
      expect(screen.getByText('Discriminant formula')).toBeInTheDocument();
      expect(screen.getByText('Conclusion')).toBeInTheDocument();
    });

    it('renders zero discriminant steps', () => {
      render(<StepByStepper mode="teaching" steps={discriminantZeroSteps} />);
      expect(screen.getByText('Discriminant is zero')).toBeInTheDocument();
    });

    it('renders negative discriminant steps', () => {
      render(<StepByStepper mode="teaching" steps={discriminantNegativeSteps} />);
      expect(screen.getByText('Discriminant is negative')).toBeInTheDocument();
    });
  });
});
