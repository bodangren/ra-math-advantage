import { z } from 'zod';

export const validationErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
