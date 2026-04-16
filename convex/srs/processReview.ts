import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const cardStateValidator = v.object({
  cardId: v.string(),
  studentId: v.string(),
  objectiveId: v.string(),
  problemFamilyId: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  state: v.union(
    v.literal("new"),
    v.literal("learning"),
    v.literal("review"),
    v.literal("relearning")
  ),
  dueDate: v.string(),
  elapsedDays: v.number(),
  scheduledDays: v.number(),
  reps: v.number(),
  lapses: v.number(),
  lastReview: v.optional(v.union(v.string(), v.null())),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const reviewEntryValidator = v.object({
  reviewId: v.string(),
  cardId: v.string(),
  studentId: v.string(),
  rating: v.string(),
  submissionId: v.string(),
  evidence: v.any(),
  stateBefore: v.any(),
  stateAfter: v.any(),
  reviewedAt: v.string(),
});

export type ProcessReviewArgs = {
  cardState: {
    cardId: string;
    studentId: string;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: "new" | "learning" | "review" | "relearning";
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  reviewEntry: {
    reviewId: string;
    cardId: string;
    studentId: string;
    rating: string;
    submissionId: string;
    evidence: unknown;
    stateBefore: unknown;
    stateAfter: unknown;
    reviewedAt: string;
  };
};

export async function processReviewHandler(
  ctx: MutationCtx,
  args: ProcessReviewArgs
): Promise<{ cardId: string; logEntryId: Id<"srs_review_log"> }> {
  const { cardState, reviewEntry } = args;

  const existing = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_problem_family", (q) =>
      q
        .eq("studentId", cardState.studentId as Id<"profiles">)
        .eq("problemFamilyId", cardState.problemFamilyId)
    )
    .first();

  let cardDocId: Id<"srs_cards">;
  if (existing) {
    await ctx.db.replace(existing._id, {
      studentId: existing.studentId,
      objectiveId: cardState.objectiveId,
      problemFamilyId: cardState.problemFamilyId,
      stability: cardState.stability,
      difficulty: cardState.difficulty,
      state: cardState.state,
      dueDate: cardState.dueDate,
      elapsedDays: cardState.elapsedDays,
      scheduledDays: cardState.scheduledDays,
      reps: cardState.reps,
      lapses: cardState.lapses,
      lastReview: cardState.lastReview ?? undefined,
      createdAt: existing.createdAt,
      updatedAt: new Date(cardState.updatedAt).getTime(),
    });
    cardDocId = existing._id;
  } else {
    cardDocId = await ctx.db.insert("srs_cards", {
      studentId: cardState.studentId as Id<"profiles">,
      objectiveId: cardState.objectiveId,
      problemFamilyId: cardState.problemFamilyId,
      stability: cardState.stability,
      difficulty: cardState.difficulty,
      state: cardState.state,
      dueDate: cardState.dueDate,
      elapsedDays: cardState.elapsedDays,
      scheduledDays: cardState.scheduledDays,
      reps: cardState.reps,
      lapses: cardState.lapses,
      lastReview: cardState.lastReview ?? undefined,
      createdAt: new Date(cardState.createdAt).getTime(),
      updatedAt: new Date(cardState.updatedAt).getTime(),
    });
  }

  const logEntryId = await ctx.db.insert("srs_review_log", {
    cardId: cardDocId,
    studentId: reviewEntry.studentId as Id<"profiles">,
    rating: reviewEntry.rating,
    reviewId: reviewEntry.reviewId || undefined,
    submissionId: reviewEntry.submissionId || undefined,
    evidence: reviewEntry.evidence,
    stateBefore: reviewEntry.stateBefore,
    stateAfter: reviewEntry.stateAfter,
    reviewedAt: new Date(reviewEntry.reviewedAt).getTime(),
  });

  return {
    cardId: cardState.cardId,
    logEntryId,
  };
}

export const processReview = internalMutation({
  args: {
    cardState: cardStateValidator,
    reviewEntry: reviewEntryValidator,
  },
  handler: processReviewHandler,
});
