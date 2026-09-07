// Math renderer registry
//
// Maps componentKey → renderer descriptor with props schema.
// Renderers themselves live in packages/activity-components or app-local components;
// this registry only references their key + props schema.

import { z } from 'zod';

export interface MathRendererDescriptor {
  key: string;
  propsSchema: z.ZodType<unknown>;
}

// ---------------------------------------------------------------------------
// Props schemas for known renderers
// ---------------------------------------------------------------------------

const stepByStepSolverPropsSchema = z.object({
  problem: z.string(),
  steps: z.array(z.unknown()).optional(),
});

const graphingExplorerPropsSchema = z.object({
  problem: z.string(),
  initialView: z.object({
    xmin: z.number(),
    xmax: z.number(),
    ymin: z.number(),
    ymax: z.number(),
  }).optional(),
});

const comprehensionQuizPropsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()),
  })),
});

const fillInTheBlankPropsSchema = z.object({
  activityId: z.string().min(1),
  mode: z.enum(['teaching', 'guided', 'practice']),
  template: z.string().min(1),
  blanks: z.array(z.object({
    id: z.string(),
    correctAnswer: z.string().min(1).optional(),
    acceptedAnswers: z.array(z.string().min(1)).min(1).optional(),
    isMath: z.boolean().optional(),
  })),
  reasoningSteps: z.array(z.object({
    description: z.string().min(1),
    expression: z.string().min(1).optional(),
  })).min(1).optional(),
  guidedSupport: z.object({
    feedback: z.literal('on_check'),
    hints: z.array(z.string().min(1)).min(1),
    revealAfterAttempts: z.number().int().positive(),
  }).optional(),
});

const rateOfChangeCalculatorPropsSchema = z.object({
  points: z.array(z.object({
    x: z.number(),
    y: z.number(),
  })),
});

const discriminantAnalyzerPropsSchema = z.object({
  coefficients: z.object({
    a: z.number(),
    b: z.number(),
    c: z.number(),
  }),
});

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const RENDERER_REGISTRY: Record<string, MathRendererDescriptor> = {
  'step-by-step-solver': {
    key: 'step-by-step-solver',
    propsSchema: stepByStepSolverPropsSchema,
  },
  'graphing-explorer': {
    key: 'graphing-explorer',
    propsSchema: graphingExplorerPropsSchema,
  },
  'comprehension-quiz': {
    key: 'comprehension-quiz',
    propsSchema: comprehensionQuizPropsSchema,
  },
  'fill-in-the-blank': {
    key: 'fill-in-the-blank',
    propsSchema: fillInTheBlankPropsSchema,
  },
  'rate-of-change-calculator': {
    key: 'rate-of-change-calculator',
    propsSchema: rateOfChangeCalculatorPropsSchema,
  },
  'discriminant-analyzer': {
    key: 'discriminant-analyzer',
    propsSchema: discriminantAnalyzerPropsSchema,
  },
};

export const RENDERER_KEYS = Object.keys(RENDERER_REGISTRY) as string[];

/**
 * Look up a math renderer descriptor by its key.
 * @param {string} key - Renderer key string
 * @returns {MathRendererDescriptor} - The matching MathRendererDescriptor
 * @throws Error if the key is not registered
 */
export function getRenderer(key: string): MathRendererDescriptor {
  const renderer = RENDERER_REGISTRY[key];
  if (!renderer) {
    throw new Error(`Unknown renderer key: "${key}"`);
  }
  return renderer;
}
