import { z } from 'zod';

export const classMetadataSchema = z.object({
  period: z.string().optional(),
  room: z.string().optional(),
  schedule: z.string().optional(),
  notes: z.string().optional(),
});

export type ClassMetadata = z.infer<typeof classMetadataSchema>;
