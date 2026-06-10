import { z } from 'zod';

export const liveResponseAnswerSchema = z.record(z.string(), z.unknown());

export type LiveResponseAnswer = z.infer<typeof liveResponseAnswerSchema>;
