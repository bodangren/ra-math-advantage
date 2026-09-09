'use client';

import { useCallback, useRef } from 'react';
import InlineMath from '@matejmazur/react-katex';
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

type SolverEquationProps =
  | { problemType: 'system'; equations: { first: string; second: string }; equation?: never }
  | { problemType?: Exclude<ProblemType, 'system'>; equation?: string; equations?: never };

export type StepByStepSolverActivityProps = ActivityComponentProps & SolverEquationProps & {
  steps?: AlgebraicStep[];
};

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
 * Renders a step-by-step algebraic solver activity with teaching, guided, and practice modes.
 *
 * @param {StepByStepSolverActivityProps} props - Activity configuration with steps, problem type, and callbacks.
 * @returns {JSX.Element} An interactive algebraic solver activity.
 */
export function StepByStepSolverActivity(props: StepByStepSolverActivityProps) {
  const { activityId, mode, steps = defaultSteps, onSubmit, onComplete } = props;
  const problemType = props.problemType ?? 'factoring';
  const interactionHistoryRef = useRef<Array<{ type: string; timestamp: number; data?: unknown }>>([]);

  const handlePracticeComplete = useCallback((attempts: StepAttempt[]) => {
    const stepsAttemptData = attempts.map((attempt) => ({
      stepIndex: attempt.stepIndex,
      userAnswer: attempt.userAnswer,
      isCorrect: attempt.isCorrect,
    }));

    const equationInput = props.problemType === 'system'
      ? { problemType: 'system' as const, equations: props.equations }
      : { problemType: props.problemType ?? 'factoring', equation: props.equation ?? 'x^2 + 5x + 6 = 0' };
    const submission = buildAlgebraicSubmission({
      activityId,
      mode,
      steps: stepsAttemptData,
      hintsUsed: 0,
      interactionHistory: interactionHistoryRef.current,
      ...equationInput,
    });

    onSubmit?.(submission);
    onComplete?.();
  }, [activityId, mode, props, onSubmit, onComplete]);

  const handleGenerateDistractors = useCallback(
    (expression: string, problemType: string) =>
      generateDistractors(expression, problemType as DistractorType),
    [],
  );

  return (
    <div data-testid="step-by-step-solver">
      {props.problemType === 'system' && (
        <div role="group" aria-label="System of equations" className="space-y-2">
          <div><InlineMath math={props.equations.first} /></div>
          <div><InlineMath math={props.equations.second} /></div>
        </div>
      )}
      <StepByStepper
        mode={mode}
        steps={steps}
        problemType={problemType}
        generateDistractors={handleGenerateDistractors}
        showInitialProblem={props.problemType !== 'system'}
        onPracticeComplete={mode === 'practice' ? handlePracticeComplete : undefined}
      />
    </div>
  );
}
