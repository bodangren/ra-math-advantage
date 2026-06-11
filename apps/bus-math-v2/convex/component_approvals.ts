import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  componentTypeValidator,
  approvalStatusValidator,
  submissionStatusValidator,
  issueCategoryValidator,
} from "./component_approval_validators";
import { computeComponentVersionHash } from "../lib/component-approval/version-hashes";

/**
 * Throws if the current authenticated user does not have the admin role.
 * @param ctx - The Convex query or mutation context.
 * @throws If the user is unauthenticated or not an admin.
 */
async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthorized");
  }
  const profile = await ctx.db
    .query("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_username", (q: any) => q.eq("username", identity.email!))
    .unique();
  if (!profile || profile.role !== "admin") {
    throw new ConvexError("Unauthorized");
  }
}

/**
 * Fetches a single component approval record by type and ID.
 * @param ctx - The Convex query context.
 * @param args - The component type and component ID to look up.
 * @returns The approval document, or null if not found.
 */
export async function getComponentApprovalHandler(
  ctx: QueryCtx,
  args: { componentType: "activity" | "example" | "practice"; componentId: string }
) {
  await requireAdmin(ctx);
  const approval = await ctx.db
    .query("componentApprovals")
    .withIndex("by_component", (q) =>
      q.eq("componentType", args.componentType).eq("componentId", args.componentId)
    )
    .first();
  return approval;
}

export const getComponentApproval = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: getComponentApprovalHandler,
});

/**
 * Computes the version hash for a component to detect source changes.
 * @param _ctx - The Convex query context.
 * @param args - The component type and component ID.
 * @returns The version hash string, or null for example components.
 */
export async function getComponentVersionHashHandler(
  _ctx: QueryCtx,
  args: { componentType: "activity" | "example" | "practice"; componentId: string }
) {
  await requireAdmin(_ctx);
  if (args.componentType === "example") {
    return null;
  }
  return await computeComponentVersionHash(args.componentType, args.componentId);
}

export const getComponentVersionHash = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: getComponentVersionHashHandler,
});

/**
 * Fetches the component review queue with optional type, status, and staleness
 * filters.
 * @param ctx - The Convex query context.
 * @param args - Optional filters for componentType, approvalStatus,
 *   and includeStale.
 * @returns A list of approval records, optionally annotated with effective
 *   staleness status.
 */
export async function getReviewQueueHandler(
  ctx: QueryCtx,
  args: {
    componentType?: "activity" | "example" | "practice";
    approvalStatus?:
      | "approved"
      | "rejected"
      | "unreviewed"
      | "changes_requested"
      | "stale";
    includeStale?: boolean;
  }
) {
  await requireAdmin(ctx);
  let approvals;

  if (args.componentType && args.approvalStatus) {
    // Both filters: use by_status index, then filter in memory
    approvals = await ctx.db
      .query("componentApprovals")
      .withIndex("by_status", (q) => q.eq("approvalStatus", args.approvalStatus!))
      .filter((q) => q.eq(q.field("componentType"), args.componentType!))
      .collect();
  } else if (args.componentType) {
    approvals = await ctx.db
      .query("componentApprovals")
      .withIndex("by_component", (q) => q.eq("componentType", args.componentType!))
      .collect();
  } else if (args.approvalStatus) {
    approvals = await ctx.db
      .query("componentApprovals")
      .withIndex("by_status", (q) => q.eq("approvalStatus", args.approvalStatus!))
      .collect();
  } else {
    approvals = await ctx.db.query("componentApprovals").collect();
  }

  if (args.includeStale) {
    return await Promise.all(
      approvals.map(async (approval) => {
        if (approval.componentType === "example") {
          return {
            ...approval,
            effectiveStatus: approval.approvalStatus,
            currentVersionHash: null,
          };
        }
        const currentHash = await computeComponentVersionHash(
          approval.componentType,
          approval.componentId
        );
        const effectiveStatus =
          approval.approvalStatus !== "unreviewed" &&
          approval.approvalVersionHash !== currentHash
            ? "stale"
            : approval.approvalStatus;
        return {
          ...approval,
          effectiveStatus,
          currentVersionHash: currentHash,
        };
      })
    );
  }

  return approvals;
}

export const getReviewQueue = query({
  args: {
    componentType: v.optional(componentTypeValidator),
    approvalStatus: v.optional(approvalStatusValidator),
    includeStale: v.optional(v.boolean()),
  },
  handler: getReviewQueueHandler,
});

/**
 * Fetches all reviews for a specific component, ordered newest first.
 * @param ctx - The Convex query context.
 * @param args - The component type and component ID.
 * @returns A list of review documents.
 */
export async function getComponentReviewsHandler(
  ctx: QueryCtx,
  args: { componentType: "activity" | "example" | "practice"; componentId: string }
) {
  await requireAdmin(ctx);
  const reviews = await ctx.db
    .query("componentReviews")
    .withIndex("by_component_and_created", (q) =>
      q.eq("componentType", args.componentType).eq("componentId", args.componentId)
    )
    .order("desc")
    .collect();
  return reviews;
}

export const getComponentReviews = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: getComponentReviewsHandler,
});

/**
 * Submits a review for a component, creating a review record and upserting
 * the corresponding approval status. Validates version hash match and
 * requires improvement notes for negative statuses.
 * @param ctx - The Convex mutation context.
 * @param args - The component type, ID, version hash, status, summary,
 *   improvement notes, and issue categories.
 * @returns The newly created review ID.
 * @throws If the component is an example, version hash mismatches, or
 *   improvement notes are missing for negative statuses.
 */
export async function submitComponentReviewHandler(
  ctx: MutationCtx,
  args: {
    componentType: "activity" | "example" | "practice";
    componentId: string;
    componentVersionHash: string;
    status: "approved" | "rejected" | "unreviewed" | "changes_requested";
    reviewSummary?: string;
    improvementNotes?: string;
    issueCategories: (
      | "math_correctness"
      | "pedagogy"
      | "wording"
      | "ui_bug"
      | "accessibility"
      | "algorithmic_variation"
      | "missing_feedback"
      | "too_easy"
      | "too_hard"
      | "completion_behavior"
      | "evidence_quality"
    )[];
  }
) {
  await requireAdmin(ctx);

  if (args.componentType === "example") {
    throw new ConvexError(
      "Example components are not supported for review. Examples are embedded lesson content, not standalone React components, and do not have source files to hash for version tracking."
    );
  }

  if (
    (args.status === "changes_requested" || args.status === "rejected") &&
    !args.improvementNotes
  ) {
    throw new ConvexError(
      "Improvement notes are required for changes_requested or rejected status"
    );
  }

  const serverHash = await computeComponentVersionHash(
    args.componentType,
    args.componentId
  );
  if (serverHash !== args.componentVersionHash) {
    throw new ConvexError("Component version hash mismatch");
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_username", (q) => q.eq("username", identity.email!))
    .unique();
  if (!profile) {
    throw new ConvexError("Profile not found");
  }

  const now = Date.now();

  const reviewId = await ctx.db.insert("componentReviews", {
    componentType: args.componentType,
    componentId: args.componentId,
    componentVersionHash: args.componentVersionHash,
    status: args.status,
    reviewerId: profile._id,
    reviewSummary: args.reviewSummary,
    improvementNotes: args.improvementNotes,
    issueCategories: args.issueCategories,
    createdAt: now,
  });

  const existingApproval = await ctx.db
    .query("componentApprovals")
    .withIndex("by_component", (q) =>
      q.eq("componentType", args.componentType).eq("componentId", args.componentId)
    )
    .first();

  if (existingApproval) {
    await ctx.db.patch(existingApproval._id, {
      approvalStatus: args.status,
      approvalVersionHash: args.componentVersionHash,
      approvalReviewedAt: now,
      approvalReviewedBy: profile._id,
      latestReviewId: reviewId,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("componentApprovals", {
      componentType: args.componentType,
      componentId: args.componentId,
      approvalStatus: args.status,
      approvalVersionHash: args.componentVersionHash,
      approvalReviewedAt: now,
      approvalReviewedBy: profile._id,
      latestReviewId: reviewId,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { reviewId };
}

export const submitComponentReview = mutation({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
    componentVersionHash: v.string(),
    status: submissionStatusValidator,
    reviewSummary: v.optional(v.string()),
    improvementNotes: v.optional(v.string()),
    issueCategories: v.array(issueCategoryValidator),
  },
  handler: submitComponentReviewHandler,
});

/**
 * Fetches all unresolved component reviews, optionally filtered by type.
 * @param ctx - The Convex query context.
 * @param args - Optional component type filter.
 * @returns A list of review documents without a resolvedAt timestamp.
 */
export async function getUnresolvedReviewsHandler(
  ctx: QueryCtx,
  args: { componentType?: "activity" | "example" | "practice" }
) {
  await requireAdmin(ctx);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let query: any = ctx.db.query("componentReviews");

  if (args.componentType) {
    query = query.withIndex("by_component", (q: any) =>
      q.eq("componentType", args.componentType)
    );
  }

  const reviews = await query
    .filter((q: any) => q.eq(q.field("resolvedAt"), undefined))
    .collect();
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return reviews;
}

export const getUnresolvedReviews = query({
  args: {
    componentType: v.optional(componentTypeValidator),
  },
  handler: getUnresolvedReviewsHandler,
});

/**
 * Builds a summary of unresolved reviews grouped by component type and issue
 * category, including counts, notes, and affected component IDs.
 * @param ctx - The Convex query context.
 * @param args - Optional component type filter.
 * @returns A nested record keyed by type then category.
 */
export async function getAuditSummaryHandler(
  ctx: QueryCtx,
  args: { componentType?: "activity" | "example" | "practice" }
) {
  await requireAdmin(ctx);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let query: any = ctx.db.query("componentReviews");

  if (args.componentType) {
    query = query.withIndex("by_component", (q: any) =>
      q.eq("componentType", args.componentType)
    );
  }

  const unresolved = await query
    .filter((q: any) => q.eq(q.field("resolvedAt"), undefined))
    .collect();
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const summary: Record<
    string,
    Record<string, { count: number; notes: string[]; componentIds: string[] }>
  > = {};

  for (const review of unresolved) {
    const type = review.componentType;
    for (const category of review.issueCategories) {
      if (!summary[type]) summary[type] = {};
      if (!summary[type][category]) {
        summary[type][category] = { count: 0, notes: [], componentIds: [] };
      }
      summary[type][category].count++;
      if (review.improvementNotes) {
        summary[type][category].notes.push(review.improvementNotes);
      }
      if (!summary[type][category].componentIds.includes(review.componentId)) {
        summary[type][category].componentIds.push(review.componentId);
      }
    }
  }

  return summary;
}

export const getAuditSummary = query({
  args: {
    componentType: v.optional(componentTypeValidator),
  },
  handler: getAuditSummaryHandler,
});

/**
 * Marks a component review as resolved by setting resolvedAt and resolvedBy.
 * @param ctx - The Convex mutation context.
 * @param args - The review ID to resolve.
 * @returns An object confirming success.
 * @throws If the review or the admin profile is not found.
 */
export async function resolveReviewHandler(
  ctx: MutationCtx,
  args: { reviewId: Id<"componentReviews"> }
) {
  await requireAdmin(ctx);

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_username", (q) => q.eq("username", identity.email!))
    .unique();
  if (!profile) {
    throw new ConvexError("Profile not found");
  }

  const review = await ctx.db.get(args.reviewId);
  if (!review) {
    throw new ConvexError("Review not found");
  }

  await ctx.db.patch(args.reviewId, {
    resolvedAt: Date.now(),
    resolvedBy: profile._id,
  });

  return { success: true };
}

export const resolveReview = mutation({
  args: {
    reviewId: v.id("componentReviews"),
  },
  handler: resolveReviewHandler,
});
