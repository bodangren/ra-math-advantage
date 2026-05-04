import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  srsCardStatePickValidator,
  srsEvidenceValidator,
  srsRatingValidator,
} from "./validators";

type SrsStatePick = {
  stability: number;
  difficulty: number;
  state: "new" | "learning" | "review" | "relearning";
  reps: number;
  lapses: number;
};

// COPIED from packages/srs-engine/src/srs/transition-validator.ts — DO NOT EDIT WITHOUT SYNCING
const VALID_STATE_TRANSITIONS: Record<string, string[]> = {
  new: ['learning', 'review'],
  learning: ['learning', 'review'],
  review: ['learning', 'review'],
  relearning: ['learning', 'review'],
};

function validateSrsTransition(
  stateBefore: SrsStatePick,
  stateAfter: SrsStatePick,
): void {
  if (stateAfter.reps !== stateBefore.reps + 1) {
    throw new Error(
      `reps must increase by exactly 1 (before: ${stateBefore.reps}, after: ${stateAfter.reps})`
    );
  }
  if (stateAfter.lapses < stateBefore.lapses) {
    throw new Error(
      `lapses cannot decrease (before: ${stateBefore.lapses}, after: ${stateAfter.lapses})`
    );
  }
  const allowedNextStates = VALID_STATE_TRANSITIONS[stateBefore.state];
  if (!allowedNextStates?.includes(stateAfter.state)) {
    throw new Error(
      `invalid state transition: ${stateBefore.state} → ${stateAfter.state}`
    );
  }
}

export async function saveReviewHandler(
  ctx: MutationCtx,
  args: {
    reviewId?: string;
    cardId: Id<"srs_cards">;
    studentId: Id<"profiles">;
    rating: "Again" | "Hard" | "Good" | "Easy";
    submissionId?: string;
    evidence: { action: "teacher_reset"; objectiveId: string } | { baseRating: "Again" | "Hard" | "Good" | "Easy"; timingAdjusted: boolean; reasons: string[]; misconceptionTags?: string[] };
    stateBefore: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number };
    stateAfter: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number };
    reviewedAt: string;
  }
) {
  // Teacher resets bypass SRS transition validation because they are administrative
  // overrides, not learner reviews. The reset action reinitializes the card state.
  if (!('action' in args.evidence)) {
    validateSrsTransition(args.stateBefore, args.stateAfter);
  }

  const reviewedAtMs = new Date(args.reviewedAt).getTime();
  if (Number.isNaN(reviewedAtMs)) {
    throw new Error(`Invalid reviewedAt date: ${args.reviewedAt}`);
  }
  const id = await ctx.db.insert("srs_review_log", {
    cardId: args.cardId,
    studentId: args.studentId,
    rating: args.rating,
    reviewId: args.reviewId,
    submissionId: args.submissionId,
    evidence: args.evidence,
    stateBefore: args.stateBefore,
    stateAfter: args.stateAfter,
    reviewedAt: reviewedAtMs,
  });
  return id;
}

export const saveReview = internalMutation({
  args: {
    reviewId: v.optional(v.string()),
    cardId: v.id("srs_cards"),
    studentId: v.id("profiles"),
    rating: srsRatingValidator,
    submissionId: v.optional(v.string()),
    evidence: srsEvidenceValidator,
    stateBefore: srsCardStatePickValidator,
    stateAfter: srsCardStatePickValidator,
    reviewedAt: v.string(),
  },
  handler: saveReviewHandler,
});

export async function getReviewsByCardHandler(
  ctx: QueryCtx,
  args: { cardId: Id<"srs_cards"> }
) {
  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_card", (q) =>
      q.eq("cardId", args.cardId)
    )
    .collect();
  return reviews
    .sort((a, b) => a.reviewedAt - b.reviewedAt)
    .map((review) => ({
      reviewId: review.reviewId ?? review._id,
      cardId: review.cardId,
      studentId: review.studentId,
      rating: review.rating,
      submissionId: review.submissionId ?? "",
      evidence: review.evidence,
      stateBefore: review.stateBefore,
      stateAfter: review.stateAfter,
      reviewedAt: new Date(review.reviewedAt).toISOString(),
    }));
}

export const getReviewsByCard = internalQuery({
  args: { cardId: v.id("srs_cards") },
  handler: getReviewsByCardHandler,
});

export async function getReviewsByStudentHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; since?: string }
) {
  let sinceMs: number | undefined;
  if (args.since) {
    sinceMs = new Date(args.since).getTime();
    if (Number.isNaN(sinceMs)) {
      throw new Error(`Invalid since date: ${args.since}`);
    }
  }
  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId)
    )
    .collect();
  return reviews
    .filter((review) =>
      sinceMs === undefined ? true : review.reviewedAt >= sinceMs
    )
    .sort((a, b) => a.reviewedAt - b.reviewedAt)
    .map((review) => ({
      reviewId: review.reviewId ?? review._id,
      cardId: review.cardId,
      studentId: review.studentId,
      rating: review.rating,
      submissionId: review.submissionId ?? "",
      evidence: review.evidence,
      stateBefore: review.stateBefore,
      stateAfter: review.stateAfter,
      reviewedAt: new Date(review.reviewedAt).toISOString(),
    }));
}

export const getReviewsByStudent = internalQuery({
  args: { studentId: v.id("profiles"), since: v.optional(v.string()) },
  handler: getReviewsByStudentHandler,
});
