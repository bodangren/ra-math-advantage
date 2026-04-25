import { v } from 'convex/values';

export const srsCardStateValidator = v.object({
  cardId: v.string(),
  studentId: v.id('profiles'),
  objectiveId: v.string(),
  problemFamilyId: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  state: v.union(
    v.literal('new'),
    v.literal('learning'),
    v.literal('review'),
    v.literal('relearning')
  ),
  dueDate: v.string(),
  elapsedDays: v.number(),
  scheduledDays: v.number(),
  reps: v.number(),
  lapses: v.number(),
  lastReview: v.union(v.string(), v.null()),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export const srsRatingValidator = v.union(
  v.literal('Again'),
  v.literal('Hard'),
  v.literal('Good'),
  v.literal('Easy')
);

export const srsCardValidator = v.object({
  due: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  elapsed_days: v.number(),
  scheduled_days: v.number(),
  reps: v.number(),
  lapses: v.number(),
  learning_steps: v.number(),
  state: v.number(),
  last_review: v.union(v.string(), v.null()),
});
