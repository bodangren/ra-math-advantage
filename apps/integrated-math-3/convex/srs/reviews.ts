import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import {
  srsCardStatePickValidator,
  srsEvidenceValidator,
  srsRatingValidator,
} from "./validators";

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
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("srs_review_log", {
      cardId: args.cardId,
      studentId: args.studentId,
      rating: args.rating,
      reviewId: args.reviewId,
      submissionId: args.submissionId,
      evidence: args.evidence,
      stateBefore: args.stateBefore,
      stateAfter: args.stateAfter,
      reviewedAt: new Date(args.reviewedAt).getTime(),
    });
    return id;
  },
});

export const getReviewsByCard = internalQuery({
  args: { cardId: v.id("srs_cards") },
  handler: async (ctx, args) => {
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
  },
});

export const getReviewsByStudent = internalQuery({
  args: { studentId: v.id("profiles"), since: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sinceMs = args.since ? new Date(args.since).getTime() : undefined;
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
  },
});
