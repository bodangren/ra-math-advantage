'use client';

import { useCallback, useRef } from 'react';
import { StepByStepper } from './StepByStepper';
import type { AlgebraicStep, StepAttempt } from './StepByStepper';
import type { ProblemType } from '../../schemas/step-by-step-solver.schema';

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

/**
 * Build a practice submission envelope for an algebraic step-by-step activity.
 * @param {Record<string, unknown>} props - The submission data including activity ID, mode, steps, and analytics
 * @returns {unknown} - The formatted submission envelope object
 */
function buildAlgebraicSubmission({
  activityId,
  mode,
  steps,
  hintsUsed,
  interactionHistory,
  problemType,
  equation,
}: {
  activityId: string;
  mode: string;
  steps: Array<{ stepIndex: number; userAnswer: string | null; isCorrect: boolean }>;
  hintsUsed: number;
  interactionHistory: Array<{ type: string; timestamp: number; data?: unknown }>;
  problemType: string;
  equation: string;
}): unknown {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode: mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: {
      steps,
      problemType,
      equation,
    },
    parts: steps.map((step) => ({
      partId: `step-${step.stepIndex}`,
      rawAnswer: step.userAnswer,
      isCorrect: step.isCorrect,
    })),
    interactionHistory,
    analytics: {
      hintsUsed,
      totalSteps: steps.length,
      correctSteps: steps.filter(s => s.isCorrect).length,
      problemType,
    },
  };
}

/**
 * Render a step-by-step solver activity wrapper with submission handling.
 * @param {StepByStepSolverActivityProps} props - The activity configuration including steps, problem type, and callbacks
 * @returns {import("react").JSX.Element} The activity component JSX
 */
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

  return (
    <StepByStepper
      mode={mode}
      steps={steps}
      problemType={problemType}
      onPracticeComplete={mode === 'practice' ? handlePracticeComplete : undefined}
    />
  );
}
