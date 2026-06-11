import type { SrsReviewLogEntry, SrsRating, ReviewLogStore } from "@math-platform/srs-engine";
import { internal } from "../../convex/_generated/api";
import { type MutationCtx } from "../../convex/_generated/server";
import { type Id } from "../../convex/_generated/dataModel";

export class ConvexReviewLogStore implements ReviewLogStore {
  private ctx: MutationCtx;

  constructor(ctx: MutationCtx) {
    this.ctx = ctx;
  }

  async saveReview(entry: SrsReviewLogEntry): Promise<void> {
    await this.ctx.runMutation(internal.srs.reviews.saveReview, {
      reviewId: entry.reviewId,
      cardId: entry.cardId as Id<"srs_cards">,
      studentId: entry.studentId as Id<"profiles">,
      rating: entry.rating,
      submissionId: entry.submissionId,
      evidence: entry.evidence,
      stateBefore: entry.stateBefore,
      stateAfter: entry.stateAfter,
      reviewedAt: entry.reviewedAt,
    });
  }

  async getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]> {
    const result = await this.ctx.runQuery(internal.srs.reviews.getReviewsByCard, {
      cardId: cardId as Id<"srs_cards">,
    });
    return result.map((r) => ({ ...r, rating: r.rating as SrsRating }));
  }

  async getReviewsByStudent(
    studentId: string,
    since?: string
  ): Promise<SrsReviewLogEntry[]> {
    const result = await this.ctx.runQuery(
      internal.srs.reviews.getReviewsByStudent,
      {
        studentId: studentId as Id<"profiles">,
        since,
      }
    );
    return result.map((r) => ({ ...r, rating: r.rating as SrsRating }));
  }
}

/** Creates a Convex-backed review-log store instance for the given mutation context. */
export function createConvexReviewLogStore(
  ctx: MutationCtx
): ConvexReviewLogStore {
  return new ConvexReviewLogStore(ctx);
}
