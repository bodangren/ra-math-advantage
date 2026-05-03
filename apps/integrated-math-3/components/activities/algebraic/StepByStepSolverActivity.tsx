'use client';

import { useCallback, useRef } from 'react';
import { StepByStepper } from '@math-platform/activity-components/algebraic';
import type { AlgebraicStep, StepAttempt } from '@math-platform/activity-components/algebraic';
import type { ProblemType } from '@/lib/activities/schemas/step-by-step-solver.schema';
import { buildAlgebraicSubmission } from '@/lib/activities/schemas/step-by-step-solver.schema';
import { generateDistractors, type DistractorType } from '@/lib/activities/algebraic/distractors';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

export interface StepByStepSolverActivityProps extends ActivityComponentProps {
  steps?: AlgebraicStep[];
  problemType?: ProblemType;
  equation?: string;
}

const defaultSteps: AlgebraicStep[] = [
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

export function StepByStepSolverActivity({
  activityId,
  mode,
  steps = defaultSteps,
  problemType = 'factoring',
  equation = 'x^2 + 5x + 6 = 0',
  onSubmit,
  onComplete,
}: StepByStepSolverActivityProps) {
  const interactionHistoryRef = useRef<Array<{ type: string; timestamp: number; data?: unknown }>>([]);

  const handlePracticeComplete = useCallback((attempts: StepAttempt[]) => {
    const stepsAttemptData = attempts.map((attempt) => ({
      stepIndex: attempt.stepIndex,
      userAnswer: attempt.userAnswer,
      isCorrect: attempt.isCorrect,
    }));

    const submission = buildAlgebraicSubmission({
      activityId,
      mode,
      steps: stepsAttemptData,
      hintsUsed: 0,
      interactionHistory: interactionHistoryRef.current,
      problemType,
      equation,
    });

    onSubmit?.(submission);
    onComplete?.();
  }, [activityId, mode, problemType, equation, onSubmit, onComplete]);

  const handleGenerateDistractors = useCallback(
    (expression: string, problemType: string) =>
      generateDistractors(expression, problemType as DistractorType),
    [],
  );

  return (
    <StepByStepper
      mode={mode}
      steps={steps}
      problemType={problemType}
      generateDistractors={handleGenerateDistractors}
      onPracticeComplete={mode === 'practice' ? handlePracticeComplete : undefined}
    />
  );
}
