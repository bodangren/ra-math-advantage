import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
import 'katex/dist/katex.min.css';

describe('StepByStepper - Complete the Square Problem Type', () => {
  const completeTheSquareStepsA1 = [
    {
      expression: 'x^2 + 6x + 8 = 0',
      explanation: 'Start with the quadratic equation in standard form',
      hint: 'Standard form is ax^2 + bx + c = 0',
      isKeyStep: true,
      distractors: ['x^2 - 6x + 8 = 0', 'x^2 + 6x - 8 = 0'],
    },
    {
      expression: 'x^2 + 6x = -8',
      explanation: 'Move the constant term to the right side',
      hint: 'Subtract 8 from both sides',
      distractors: ['x^2 + 6x = 8', 'x^2 + 6x + 8 = 8'],
    },
    {
      expression: '(b/2)^2 = (6/2)^2 = 3^2 = 9',
      explanation: 'Find the value to complete the square',
      hint: 'Take half of b, then square it',
      isKeyStep: true,
      distractors: ['(b/2)^2 = 6^2 = 36', '(b/2)^2 = 3'],
    },
    {
      expression: 'x^2 + 6x + 9 = -8 + 9',
      explanation: 'Add the value to both sides',
      hint: 'Add 9 to both sides to keep the equation balanced',
      distractors: ['x^2 + 6x + 9 = -8', 'x^2 + 6x = -8 + 9'],
    },
    {
      expression: '(x + 3)^2 = 1',
      explanation: 'Write the left side as a perfect square',
      hint: '(x + b/2)^2',
      isKeyStep: true,
      distractors: ['(x + 3)^2 = 17', '(x - 3)^2 = 1'],
    },
    {
      expression: 'x + 3 = \\pm\\sqrt{1}',
      explanation: 'Take the square root of both sides',
      hint: 'Remember the ± sign',
      distractors: ['x + 3 = \\sqrt{1}', 'x + 3 = 1'],
    },
    {
      expression: 'x + 3 = \\pm1',
      explanation: 'Simplify the square root',
      hint: '\\sqrt{1} = 1',
      distractors: ['x + 3 = \\pm i', 'x + 3 = 1'],
    },
    {
      expression: 'x = -3 ± 1',
      explanation: 'Subtract 3 from both sides',
      hint: 'Isolate x',
      distractors: ['x = 3 ± 1', 'x = -3 ± i'],
    },
    {
      expression: 'x = -3 + 1 = -2, x = -3 - 1 = -4',
      explanation: 'Solve for both values of x',
      hint: 'Calculate both solutions',
      isKeyStep: true,
      distractors: ['x = 2, x = 4', 'x = -2, x = 4'],
    },
  ];

  const completeTheSquareStepsANot1 = [
    {
      expression: '2x^2 + 4x - 6 = 0',
      explanation: 'Start with the quadratic equation',
      hint: 'First, factor out the coefficient of x^2',
      isKeyStep: true,
      distractors: ['2x^2 - 4x + 6 = 0', '3x^2 + 4x - 6 = 0'],
    },
    {
      expression: '2(x^2 + 2x) - 6 = 0',
      explanation: 'Factor out a=2 from the first two terms',
      hint: 'Factor 2 from 2x^2 + 4x',
      distractors: ['2(x^2 + 4x) - 6 = 0', 'x^2 + 2x - 3 = 0'],
    },
    {
      expression: '2(x^2 + 2x) = 6',
      explanation: 'Move the constant to the right',
      hint: 'Add 6 to both sides',
      distractors: ['2(x^2 + 2x) = -6', 'x^2 + 2x = 3'],
    },
    {
      expression: '(b/2)^2 = (2/2)^2 = 1^2 = 1',
      explanation: 'Find the value to complete the square inside the parentheses',
      hint: 'Inside the parentheses, b=2',
      isKeyStep: true,
      distractors: ['(b/2)^2 = 2^2 = 4', '(b/2)^2 = 1'],
    },
    {
      expression: '2(x^2 + 2x + 1) = 6 + 2(1)',
      explanation: 'Add the value inside the parentheses and add 2*1 to the right',
      hint: 'Since we factored out a 2, we have to add 2*1 to the right side',
      distractors: ['2(x^2 + 2x + 1) = 6 + 1', 'x^2 + 2x + 1 = 3 + 1'],
    },
    {
      expression: '2(x + 1)^2 = 8',
      explanation: 'Write the perfect square and simplify the right',
      hint: '2*1=2, so 6+2=8',
      isKeyStep: true,
      distractors: ['2(x + 1)^2 = 7', '(x + 1)^2 = 8'],
    },
    {
      expression: '(x + 1)^2 = 4',
      explanation: 'Divide both sides by 2',
      hint: 'Isolate the perfect square',
      distractors: ['(x + 1)^2 = 16', '2(x + 1)^2 = 4'],
    },
    {
      expression: 'x + 1 = \\pm\\sqrt{4}',
      explanation: 'Take square roots of both sides',
      hint: '\\pm\\sqrt{4} = \\pm2',
      distractors: ['x + 1 = \\sqrt{4}', 'x + 1 = 4'],
    },
    {
      expression: 'x = -1 ± 2',
      explanation: 'Subtract 1 from both sides',
      hint: 'Isolate x',
      distractors: ['x = 1 ± 2', 'x = -1 ± i'],
    },
    {
      expression: 'x = -1 + 2 = 1, x = -1 - 2 = -3',
      explanation: 'Solve for both x values',
      hint: 'Calculate both solutions',
      isKeyStep: true,
      distractors: ['x = 3, x = -1', 'x = 1, x = 3'],
    },
  ];

  const completeTheSquareImaginarySteps = [
    {
      expression: 'x^2 + 2x + 5 = 0',
      explanation: 'Start with the quadratic equation',
      hint: 'This will have imaginary solutions',
      isKeyStep: true,
      distractors: ['x^2 + 2x - 5 = 0', 'x^2 - 2x + 5 = 0'],
    },
    {
      expression: 'x^2 + 2x = -5',
      explanation: 'Move the constant to the right',
      hint: 'Subtract 5 from both sides',
      distractors: ['x^2 + 2x = 5', 'x^2 + 2x + 5 = 5'],
    },
    {
      expression: '(b/2)^2 = (2/2)^2 = 1',
      explanation: 'Find value to complete the square',
      hint: 'b=2, half of 2 is 1, squared is 1',
      isKeyStep: true,
      distractors: ['(b/2)^2 = 4', '(b/2)^2 = 2'],
    },
    {
      expression: 'x^2 + 2x + 1 = -5 + 1',
      explanation: 'Add 1 to both sides',
      hint: 'Keep the equation balanced',
      distractors: ['x^2 + 2x + 1 = -5', 'x^2 + 2x = -5 + 1'],
    },
    {
      expression: '(x + 1)^2 = -4',
      explanation: 'Write as perfect square',
      hint: 'Right side is negative, so solutions are imaginary',
      isKeyStep: true,
      distractors: ['(x + 1)^2 = 4', '(x - 1)^2 = -4'],
    },
    {
      expression: 'x + 1 = \\pm\\sqrt{-4}',
      explanation: 'Take square roots',
      hint: '\\sqrt{-4} = 2i',
      distractors: ['x + 1 = \\pm\\sqrt{4}', 'x + 1 = \\sqrt{-4}'],
    },
    {
      expression: 'x + 1 = ±2i',
      explanation: 'Simplify √(-4)',
      hint: '√(-1) = i',
      distractors: ['x + 1 = ±2', 'x + 1 = ±4i'],
    },
    {
      expression: 'x = -1 ± 2i',
      explanation: 'Solve for x',
      hint: 'Subtract 1 from both sides',
      isKeyStep: true,
      distractors: ['x = 1 ± 2i', 'x = -1 ± 2'],
    },
  ];

  const completeTheSquareVertexFormSteps = [
    {
      expression: 'f(x) = x^2 + 4x + 3',
      explanation: 'Start with the quadratic function',
      hint: 'We will convert to vertex form f(x) = a(x - h)^2 + k',
      isKeyStep: true,
      distractors: ['f(x) = x^2 - 4x + 3', 'f(x) = x^2 + 4x - 3'],
    },
    {
      expression: 'f(x) = (x^2 + 4x) + 3',
      explanation: 'Group the x terms',
      hint: 'Group x^2 + 4x',
      distractors: ['f(x) = x^2 + (4x + 3)', 'f(x) = (x^2 + 4x + 3)'],
    },
    {
      expression: '(b/2)^2 = (4/2)^2 = 4',
      explanation: 'Find value to complete the square',
      hint: 'b=4, so (4/2)^2=4',
      isKeyStep: true,
      distractors: ['(b/2)^2 = 16', '(b/2)^2 = 2'],
    },
    {
      expression: 'f(x) = (x^2 + 4x + 4) + 3 - 4',
      explanation: 'Add and subtract 4',
      hint: 'Add 4 inside the parentheses, subtract 4 outside to keep the function the same',
      distractors: ['f(x) = (x^2 + 4x + 4) + 3', 'f(x) = (x^2 + 4x + 4) + 3 + 4'],
    },
    {
      expression: 'f(x) = (x + 2)^2 - 1',
      explanation: 'Write as perfect square and simplify',
      hint: '3-4=-1',
      isKeyStep: true,
      distractors: ['f(x) = (x + 2)^2 + 1', 'f(x) = (x - 2)^2 - 1'],
    },
  ];

  describe('teaching mode', () => {
    it('renders all complete the square steps for a=1', () => {
      render(<StepByStepper mode="teaching" steps={completeTheSquareStepsA1} />);
      expect(screen.getByText('Start with the quadratic equation in standard form')).toBeInTheDocument();
      expect(screen.getByText('Move the constant term to the right side')).toBeInTheDocument();
      expect(screen.getByText('Find the value to complete the square')).toBeInTheDocument();
      expect(screen.getByText('Add the value to both sides')).toBeInTheDocument();
      expect(screen.getByText('Write the left side as a perfect square')).toBeInTheDocument();
      expect(screen.getByText('Take the square root of both sides')).toBeInTheDocument();
      expect(screen.getByText('Solve for both values of x')).toBeInTheDocument();
    });

    it('renders all complete the square steps for a≠1', () => {
      render(<StepByStepper mode="teaching" steps={completeTheSquareStepsANot1} />);
      expect(screen.getByText('Start with the quadratic equation')).toBeInTheDocument();
      expect(screen.getByText('Factor out a=2 from the first two terms')).toBeInTheDocument();
    });

    it('renders imaginary solution steps', () => {
      render(<StepByStepper mode="teaching" steps={completeTheSquareImaginarySteps} />);
      expect(screen.getByText('Start with the quadratic equation')).toBeInTheDocument();
    });

    it('renders vertex form conversion steps', () => {
      render(<StepByStepper mode="teaching" steps={completeTheSquareVertexFormSteps} />);
      expect(screen.getByText('Start with the quadratic function')).toBeInTheDocument();
      expect(screen.getByText('Group the x terms')).toBeInTheDocument();
    });
  });
});
