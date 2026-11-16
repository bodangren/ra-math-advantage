import { z } from 'zod';

const sharedFields = {
  title: z.string().min(1).optional(),
  prompt: z.string().min(1),
  equation: z.string().min(1),
};

const workedStepSchema = z.object({
  description: z.string().min(1),
  expression: z.string().min(1).optional(),
}).strict();

const fieldHelpSchema = z.object({
  discriminant: z.string().min(1).optional(),
  x1: z.string().min(1).optional(),
  x2: z.string().min(1).optional(),
}).strict();

export const quadraticFormulaActivitySchema = z.discriminatedUnion('presentationMode', [
  z.object({
    ...sharedFields,
    presentationMode: z.literal('worked'),
    workedSteps: z.array(workedStepSchema).min(1),
  }).strict(),
  z.object({
    ...sharedFields,
    presentationMode: z.literal('guided'),
    fieldHelp: fieldHelpSchema.optional(),
  }).strict(),
  z.object({
    ...sharedFields,
    presentationMode: z.literal('independent'),
  }).strict(),
]);

export type QuadraticFormulaActivityPayload = z.infer<typeof quadraticFormulaActivitySchema>;
