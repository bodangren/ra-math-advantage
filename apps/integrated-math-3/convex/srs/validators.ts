import { v } from "convex/values";

export const srsCardStateLiteralValidator = v.union(
  v.literal("new"),
  v.literal("learning"),
  v.literal("review"),
  v.literal("relearning")
);

export const srsRatingValidator = v.union(
  v.literal("Again"),
  v.literal("Hard"),
  v.literal("Good"),
  v.literal("Easy")
);

export const srsCardStatePickValidator = v.object({
  stability: v.number(),
  difficulty: v.number(),
  state: srsCardStateLiteralValidator,
  reps: v.number(),
  lapses: v.number(),
});

export const srsEvidenceValidator = v.union(
  v.object({
    action: v.literal("teacher_reset"),
    objectiveId: v.string(),
  }),
  v.object({
    baseRating: srsRatingValidator,
    timingAdjusted: v.boolean(),
    reasons: v.array(v.string()),
    misconceptionTags: v.optional(v.array(v.string())),
  })
);
