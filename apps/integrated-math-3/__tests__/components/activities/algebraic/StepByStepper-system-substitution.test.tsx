import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';
import 'katex/dist/katex.min.css';

describe('StepByStepper - System Substitution Problem Type', () => {
  const systemSubstitutionSteps = [
    {
      expression: '\\begin{cases} y = 2x + 1 \\\\ 3x + y = 11 \\end{cases}',
      explanation: 'Start with the system of equations',
      hint: 'We will use substitution method',
      isKeyStep: true,
      distractors: ['\\begin{cases} y = 2x - 1 \\\\ 3x + y = 11 \\end{cases}', '\\begin{cases} y = 2x + 1 \\\\ 3x - y = 11 \\end{cases}'],
    },
    {
      expression: '3x + (2x + 1) = 11',
      explanation: 'Substitute y from first equation into second',
      hint: 'Replace y with 2x + 1',
      distractors: ['3x + (2x - 1) = 11', '3(2x+1) + y = 11'],
    },
    {
      expression: '3x + 2x + 1 = 11',
      explanation: 'Remove parentheses',
      hint: 'Distribute if needed, here we just drop them',
      distractors: ['3x + 2x - 1 = 11', '3x(2x + 1) = 11'],
    },
    {
      expression: '5x + 1 = 11',
      explanation: 'Combine like terms',
      hint: '3x + 2x = 5x',
      distractors: ['6x + 1 = 11', '5x - 1 = 11'],
    },
    {
      expression: '5x = 10',
      explanation: 'Subtract 1 from both sides',
      hint: '11 - 1 = 10',
      distractors: ['5x = 12', '5x = 9'],
    },
    {
      expression: 'x = 2',
      explanation: 'Divide both sides by 5',
      hint: '10 / 5 = 2',
      isKeyStep: true,
      distractors: ['x = 5', 'x = 10'],
    },
    {
      expression: 'y = 2(2) + 1 = 4 + 1 = 5',
      explanation: 'Substitute x = 2 back into first equation to find y',
      hint: 'y = 2x + 1, x=2',
      distractors: ['y = 2(2) -1 = 3', 'y = 2(5)+1=11'],
    },
    {
      expression: '(x, y) = (2, 5)',
      explanation: 'Solution as ordered pair',
      hint: 'x=2, y=5',
      isKeyStep: true,
      distractors: ['(5, 2)', '(2, 3)'],
    },
  ];

  describe('teaching mode', () => {
    it('renders all system substitution steps', () => {
      render(<StepByStepper mode="teaching" steps={systemSubstitutionSteps} />);
      expect(screen.getByText('Start with the system of equations')).toBeInTheDocument();
      expect(screen.getByText('Substitute y from first equation into second')).toBeInTheDocument();
      expect(screen.getByText('Solution as ordered pair')).toBeInTheDocument();
    });
  });
});
