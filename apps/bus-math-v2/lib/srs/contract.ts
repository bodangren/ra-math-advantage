export { SRS_CONTRACT_VERSION } from '@math-platform/srs-engine';

export type {
  SrsCardId,
  SrsCardState,
  SrsReviewLogEntry,
  SrsRating,
} from '@math-platform/srs-engine';

import { z } from 'zod';
export const srsRatingSchema = z.enum(['Again', 'Hard', 'Good', 'Easy']);
export type LocalSrsRating = z.infer<typeof srsRatingSchema>;

export const srsReviewLogSchema = z.object({
  problemFamilyId: z.string().min(1),
  studentId: z.string().min(1),
  rating: srsRatingSchema,
  scheduledAt: z.number(),
  reviewedAt: z.number(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reviewDurationMs: z.number().nonnegative().optional(),
  timingConfidence: z.string().optional(),
});
export type SrsReviewLog = z.infer<typeof srsReviewLogSchema>;

export const srsSessionSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  startedAt: z.number(),
  completedAt: z.number().optional(),
  cardCount: z.number().int().nonnegative(),
  ratings: z.object({
    again: z.number().int().nonnegative(),
    hard: z.number().int().nonnegative(),
    good: z.number().int().nonnegative(),
    easy: z.number().int().nonnegative(),
  }),
});
export type SrsSession = z.infer<typeof srsSessionSchema>;

export const dailyQueueSchema = z.object({
  cards: z.array(z.object({
    cardId: z.string(),
    studentId: z.string(),
    objectiveId: z.string(),
    problemFamilyId: z.string(),
    stability: z.number(),
    difficulty: z.number(),
    state: z.enum(['new', 'learning', 'review', 'relearning']),
    dueDate: z.string(),
    elapsedDays: z.number(),
    scheduledDays: z.number(),
    reps: z.number(),
    lapses: z.number(),
    lastReview: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  sessionSize: z.number().int().positive(),
  generatedAt: z.number(),
});
export type DailyQueue = z.infer<typeof dailyQueueSchema>;

export const srsReviewResultSchema = z.object({
  card: dailyQueueSchema.shape.cards.element,
  reviewLog: srsReviewLogSchema,
  rating: srsRatingSchema,
});
export type SrsReviewResult = z.infer<typeof srsReviewResultSchema>;
