import { z } from 'zod';
import type { PracticeSubmissionPart } from '@math-platform/practice-core/submission-schema';

export const PROBLEM_TYPES = [
  'quadratic_formula',
  'factoring',
  'completing_the_square',
  'square_root_property',
  'graphing',
  'simplify_imaginary',
  'complex_operations',
  'vertex-form',
  'inequality',
  'system',
  'polynomial',
  'rate_of_change',
] as const;

const NON_SYSTEM_PROBLEM_TYPES = PROBLEM_TYPES.filter(
  (problemType): problemType is Exclude<ProblemType, 'system'> => problemType !== 'system',
);

const stepSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  expression: z.string().min(1),
  explanation: z.string().optional(),
});

const sharedSolverFields = {
  steps: z.array(stepSchema).optional(),
  hints: z.array(z.string().min(1)).optional(),
};

export const stepByStepSolverSchema = z.discriminatedUnion('problemType', [
  z.object({
    problemType: z.literal('system'),
    equations: z.object({
      first: z.string().min(1),
      second: z.string().min(1),
    }).strict(),
    ...sharedSolverFields,
  }).strict(),
  z.object({
    problemType: z.enum(NON_SYSTEM_PROBLEM_TYPES),
    equation: z.string().min(1),
    ...sharedSolverFields,
  }).strict(),
]);

export type StepByStepSolverProps = z.infer<typeof stepByStepSolverSchema>;
export type ProblemType = (typeof PROBLEM_TYPES)[number];

interface AlgebraicSubmissionInputBase {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  steps: Array<{
    stepIndex: number;
    userAnswer: string | null;
    isCorrect: boolean;
  }>;
  hintsUsed: number;
  interactionHistory: Array<{ type: string; timestamp: number; data?: unknown }>;
}

export type AlgebraicSubmissionInput = AlgebraicSubmissionInputBase & (
  | { problemType: 'system'; equations: { first: string; second: string }; equation?: never }
  | { problemType: Exclude<ProblemType, 'system'>; equation: string; equations?: never }
);

/**
 * Build a practice.v1 submission from algebraic step-by-step solver input.
 * @param {AlgebraicSubmissionInput} input - Submission input with steps, hints, and problem metadata
 * @returns {object} A practice.v1 submission with the source equation shape.
 */
export function buildAlgebraicSubmission(input: AlgebraicSubmissionInput) {
  const {
    activityId,
    mode,
    steps,
    hintsUsed,
    interactionHistory,
  } = input;

  const parts: PracticeSubmissionPart[] = steps.map((step) => ({
    partId: `step_${step.stepIndex}`,
    rawAnswer: step.userAnswer,
    isCorrect: step.isCorrect,
  }));

  const answers: Record<string, unknown> = {
    steps: steps.map((step) => ({
      stepIndex: step.stepIndex,
      userAnswer: step.userAnswer,
    })),
  };

  const isFinalCorrect = steps.every((step) => step.isCorrect);

  return {
    contractVersion: 'practice.v1' as const,
    activityId,
    mode: mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode,
    status: 'submitted' as const,
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers,
    parts,
    artifact: {
      problemType: input.problemType,
      ...(input.problemType === 'system'
        ? { equations: input.equations }
        : { equation: input.equation }),
      steps: steps.map((step) => ({
        stepIndex: step.stepIndex,
        userAnswer: step.userAnswer,
        isCorrect: step.isCorrect,
      })),
      hintsUsed,
    },
    interactionHistory,
    isCorrect: isFinalCorrect,
  };
}
