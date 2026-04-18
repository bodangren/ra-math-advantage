import { z } from 'zod';
import type { PracticeSubmissionPart } from '@/lib/practice/submission.schema';

export const graphingExplorerSchema = z
  .object({
    variant: z.enum(['plot_from_equation', 'compare_functions', 'find_intercepts', 'graph_system']).optional(),
    equation: z.string().min(1),
    domain: z.tuple([z.number(), z.number()]).optional(),
    range: z.tuple([z.number(), z.number()]).optional(),
    points: z.array(z.tuple([z.number(), z.number()])).optional(),
    comparisonEquation: z.string().optional(),
    comparisonQuestion: z.string().optional(),
    comparisonAnswer: z.enum(['first', 'second']).optional(),
    linearEquation: z.string().optional(),
  })
  .strict();

export type GraphingExplorerSchemaProps = z.infer<typeof graphingExplorerSchema>;

export interface GraphingSubmissionInput {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  placedPoints: Array<{ x: number; y: number }>;
  intercepts: Array<{ type: string; data: { x: number; y: number } | null; timestamp: number }>;
  hints: Array<{ type: string; data: unknown; timestamp: number }>;
  interactionHistory: Array<{ type: string; timestamp: number; data?: unknown }>;
  equation: string;
  comparisonEquation?: string;
  linearEquation?: string;
  domain?: [number, number];
  range?: [number, number];
  comparisonAnswerSelected?: 'first' | 'second' | null;
  intersectionPoints?: Array<{ x: number; y: number }>;
  assessPointsCorrectness: () => boolean;
  assessInterceptsCorrectness: () => boolean;
  assessComparisonCorrectness?: () => boolean;
}

export function buildGraphingSubmission(input: GraphingSubmissionInput) {
  const {
    activityId,
    mode,
    placedPoints,
    intercepts,
    hints,
    interactionHistory,
    equation,
    comparisonEquation,
    linearEquation,
    domain,
    range,
    comparisonAnswerSelected,
    intersectionPoints,
    assessPointsCorrectness,
    assessInterceptsCorrectness,
    assessComparisonCorrectness,
  } = input;

  const parts: PracticeSubmissionPart[] = [
    {
      partId: 'placed_points',
      rawAnswer: placedPoints,
      isCorrect: assessPointsCorrectness(),
    },
    {
      partId: 'intercepts',
      rawAnswer: intercepts,
      isCorrect: assessInterceptsCorrectness(),
      hintsUsed: hints.length,
    },
  ];

  const answers: Record<string, unknown> = {
    placedPoints,
    intercepts,
  };

  if (comparisonAnswerSelected && assessComparisonCorrectness) {
    parts.push({
      partId: 'comparison',
      rawAnswer: comparisonAnswerSelected,
      isCorrect: assessComparisonCorrectness(),
    });
    answers.comparisonAnswer = comparisonAnswerSelected;
  }

  if (intersectionPoints) {
    parts.push({
      partId: 'intersections',
      rawAnswer: intersectionPoints,
      isCorrect: assessPointsCorrectness(),
    });
    answers.intersections = intersectionPoints;
  }

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
      graphState: {
        equation,
        comparisonEquation,
        linearEquation,
        domain,
        range,
        placedPoints,
        intercepts,
        intersectionPoints,
      },
    },
    interactionHistory,
  };
}
