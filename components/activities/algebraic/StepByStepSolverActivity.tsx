'use client';

import { StepByStepper } from '@/components/activities/algebraic/StepByStepper';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

export function StepByStepSolverActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
}: ActivityComponentProps) {
  const sampleSteps = [
    {
      expression: 'x^2 + 5x + 6 = 0',
      explanation: 'Start with the quadratic equation in standard form.',
    },
    {
      expression: '(x + 2)(x + 3) = 0',
      explanation: 'Factor the trinomial into two binomials.',
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

  return (
    <StepByStepper
      mode={mode}
      steps={sampleSteps}
    />
  );
}