import { z } from 'zod';

export const masterySnapshotSchema = z.object({
  timestamp: z.number().int().nonnegative(),
  masteredNodeIds: z.array(z.string().min(1)),
});

export const progressTrendHistorySchema = z.array(masterySnapshotSchema);

export type MasterySnapshot = z.infer<typeof masterySnapshotSchema>;
export type ProgressTrendHistory = z.infer<typeof progressTrendHistorySchema>;
