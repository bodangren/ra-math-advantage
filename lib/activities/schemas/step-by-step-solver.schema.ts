import { z } from 'zod';

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
