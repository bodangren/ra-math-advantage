import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  srsCardStatePickValidator,
  srsCardStateLiteralValidator,
  srsEvidenceValidator,
  srsRatingValidator,
} from "./validators";

const cardStateValidator = v.object({
  cardId: v.string(),
  studentId: v.id("profiles"),
  objectiveId: v.string(),
  problemFamilyId: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  state: srsCardStateLiteralValidator,
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
  reviewId: v.optional(v.string()),
  cardId: v.string(),
  studentId: v.id("profiles"),
  rating: srsRatingValidator,
  submissionId: v.optional(v.string()),
  evidence: srsEvidenceValidator,
  stateBefore: srsCardStatePickValidator,
  stateAfter: srsCardStatePickValidator,
  reviewedAt: v.string(),
});

type SrsEvidence =
  | {
      action: 'teacher_reset';
      objectiveId: string;
    }
  | {
      baseRating: 'Again' | 'Hard' | 'Good' | 'Easy';
      timingAdjusted: boolean;
      reasons: string[];
      misconceptionTags?: string[];
    };

type SrsStatePick = {
  stability: number;
  difficulty: number;
  state: "new" | "learning" | "review" | "relearning";
  reps: number;
  lapses: number;
};

export type ProcessReviewArgs = {
  cardState: {
    cardId: string;
    studentId: Id<"profiles">;
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
    reviewId?: string;
    cardId: string;
    studentId: Id<"profiles">;
    rating: 'Again' | 'Hard' | 'Good' | 'Easy';
    submissionId?: string;
    evidence: SrsEvidence;
    stateBefore: SrsStatePick;
    stateAfter: SrsStatePick;
    reviewedAt: string;
  };
};

export async function processReviewHandler(
  ctx: MutationCtx,
  args: ProcessReviewArgs
): Promise<{ cardId: string; logEntryId: Id<"srs_review_log"> }> {
  const { cardState, reviewEntry } = args;

  if (cardState.studentId !== reviewEntry.studentId) {
    throw new Error("studentId mismatch: cardState and reviewEntry must refer to the same student");
  }

  const existing = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_problem_family", (q) =>
      q
        .eq("studentId", cardState.studentId)
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
      studentId: cardState.studentId,
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
    studentId: reviewEntry.studentId,
    rating: reviewEntry.rating,
    reviewId: reviewEntry.reviewId,
    submissionId: reviewEntry.submissionId,
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
