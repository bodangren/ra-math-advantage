import { z } from 'zod';
import type { PracticeSubmissionPart } from '@math-platform/practice-core/submission-schema';

const PROBLEM_TYPES = [
  'quadratic_formula',
  'factoring',
  'completing_the_square',
  'square_root_property',
  'graphing',
] as const;

const stepSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  expression: z.string().min(1),
  explanation: z.string().optional(),
});

export const stepByStepSolverSchema = z
  .object({
    problemType: z.enum(PROBLEM_TYPES),
    equation: z.string().min(1),
    steps: z.array(stepSchema).optional(),
    hints: z.array(z.string().min(1)).optional(),
  })
  .strict();

export type StepByStepSolverProps = z.infer<typeof stepByStepSolverSchema>;
export type ProblemType = (typeof PROBLEM_TYPES)[number];

export interface AlgebraicSubmissionInput {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  steps: Array<{
    stepIndex: number;
    userAnswer: string | null;
    isCorrect: boolean;
  }>;
  hintsUsed: number;
  interactionHistory: Array<{ type: string; timestamp: number; data?: unknown }>;
  problemType: ProblemType;
  equation: string;
}

/**
 * Build a practice.v1 submission from algebraic step-by-step solver input.
 * @param {AlgebraicSubmissionInput} input - Submission input with steps, hints, and problem metadata
 * @returns {{ contractVersion: "practice.v1"; activityId: string; mode: string; status: "submitted"; attemptNumber: number; submittedAt: string; answers: Record<string, unknown>; parts: { partId: string; rawAnswer: unknown; normalizedAnswer?: string | undefined; isCorrect?: boolean | undefined; score?: number | undefined; maxScore?: number | undefined; misconceptionTags?: string[] | undefined; hintsUsed?: number | undefined; revealStepsSeen?: number | undefined; changedCount?: number | undefined; firstInteractionAt?: string | undefined; answeredAt?: string | undefined; wallClockMs?: number | undefined; activeMs?: number | undefined; }[]; artifact: { problemType: "quadratic_formula" | "factoring" | "completing_the_square" | "square_root_property" | "graphing"; equation: string; steps: { stepIndex: number; userAnswer: string | null; isCorrect: boolean; }[]; hintsUsed: number; }; interactionHistory: { type: string; timestamp: number; data?: unknown; }[]; isCorrect: boolean; }} Practice.v1 formatted submission object
 */
export function buildAlgebraicSubmission(input: AlgebraicSubmissionInput) {
  const {
    activityId,
    mode,
    steps,
    hintsUsed,
    interactionHistory,
    problemType,
    equation,
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
      problemType,
      equation,
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
