import { z } from 'zod';

export const sessionSettingsSchema = z.object({
  timeLimitSeconds: z.number().positive().optional(),
  showLeaderboard: z.boolean().default(true),
  allowLateJoin: z.boolean().default(true),
  questionOrder: z.enum(['sequential', 'random']).default('sequential'),
});

export type SessionSettings = z.infer<typeof sessionSettingsSchema>;
