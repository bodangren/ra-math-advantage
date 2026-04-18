/**
 * Dev-only internal Convex functions for the component approval workflow.
 *
 * AUTH BOUNDARY NOTE:
 * These are internalQuery/internalMutation functions, callable only from other
 * Convex functions or from the Next.js server layer via admin auth. There is no
 * convex/auth.config.ts in this project, so ctx.auth.getUserIdentity() cannot
 * be used inside these handlers. Authentication and authorization are enforced
 * at the Next.js route layer (see app/api/dev/review-queue/route.ts), which
 * uses requireDeveloperRequestClaims before calling these functions.
 *
 * - listReviewQueue: read-only, no auth-sensitive args.
 * - submitReview: accepts createdBy as an arg because the trusted caller (the
 *   Next.js server route) has already authenticated the user and resolved the
 *   profile ID. This function MUST remain internal-only.
 * - getAuditContext: read-only, returns unresolved review feedback for LLM
 *   audit context.
 */

import { internalQuery, internalMutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { computeComponentContentHash } from "../lib/activities/content-hash";
import {
  buildActivityPlacementMap,
  assembleReviewQueueItem,
  resolveComponentKind,
  type ReviewQueueItem,
} from "../lib/activities/review-queue";

type ListReviewQueueArgs = {
  componentKind?: "example" | "activity" | "practice";
  status?: "unreviewed" | "approved" | "needs_changes" | "rejected";
  onlyStale?: boolean;
};

export async function listReviewQueueHandler(
  ctx: QueryCtx,
  args: ListReviewQueueArgs,
): Promise<ReviewQueueItem[]> {
  const items: ReviewQueueItem[] = [];
  const MAX_ITEMS = 500;

  // Build activity placement map from curriculum data
  const sections = await ctx.db.query("phase_sections").take(MAX_ITEMS);
  const phaseIds = new Set<Id<"phase_versions">>();
  for (const section of sections) {
    const activityId = (section.content as { activityId?: string })?.activityId;
    if (activityId) {
      phaseIds.add(section.phaseVersionId);
    }
  }

  const phases: Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">> = [];
  for (const phaseId of phaseIds) {
    const phase = await ctx.db.get(phaseId);
    if (phase) {
      phases.push(phase);
    }
  }

  const placementMap = buildActivityPlacementMap(sections, phases);

  // Build component approvals lookup map for example/practice
  const componentApprovals = await ctx.db.query("component_approvals").take(MAX_ITEMS);
  const approvalsMap = new Map<string, Doc<"component_approvals">>();
  for (const approval of componentApprovals) {
    approvalsMap.set(`${approval.componentKind}:${approval.componentId}`, approval);
  }

  // Process all activities with their resolved component kinds
  const activities = await ctx.db.query("activities").take(MAX_ITEMS);
  for (const activity of activities) {
    const placement = placementMap.get(activity._id);
    const approvalRecord = placement
      ? approvalsMap.get(`${resolveComponentKind(placement.phaseType)}:${activity._id}`)
      : undefined;

    const item = await assembleReviewQueueItem({
      activity,
      placement,
      approvalRecord,
      filterKind: args.componentKind,
      filterStatus: args.status,
      onlyStale: args.onlyStale,
    });

    if (item) {
      items.push(item);
    }
  }

  // Include any orphaned component_approvals that don't map to an existing activity
  // (e.g., from deleted curriculum data) to preserve review history accessibility
  for (const approval of componentApprovals) {
    if (approval.componentKind === "activity") continue;
    // Skip if this approval already matched an activity above
    const activityExists = activities.some((a) => a._id === approval.componentId);
    if (activityExists) continue;

    if (args.componentKind && args.componentKind !== approval.componentKind) continue;
    const effectiveStatus = approval.status || "unreviewed";
    if (args.status && args.status !== effectiveStatus) continue;

    items.push({
      componentKind: approval.componentKind,
      componentId: approval.componentId,
      componentKey: approval.componentKey || approval.componentId,
      displayName: approval.componentKey || approval.componentId,
      approval: {
        status: approval.status,
        contentHash: approval.contentHash ?? undefined,
        reviewedAt: approval.reviewedAt ?? undefined,
        reviewedBy: approval.reviewedBy ?? undefined,
      },
    });
  }

  return items;
}

export const listReviewQueue = internalQuery({
  args: {
    componentKind: v.optional(v.union(v.literal("example"), v.literal("activity"), v.literal("practice"))),
    status: v.optional(v.union(v.literal("unreviewed"), v.literal("approved"), v.literal("needs_changes"), v.literal("rejected"))),
    onlyStale: v.optional(v.boolean()),
  },
  handler: listReviewQueueHandler,
});

type SubmitReviewArgs = {
  componentKind: "example" | "activity" | "practice";
  componentId: string;
  componentKey?: string;
  status: "approved" | "needs_changes" | "rejected";
  comment?: string;
  issueTags?: string[];
  priority?: "low" | "medium" | "high";
  placement?: {
    lessonId?: string;
    lessonVersionId?: string;
    phaseId?: string;
    phaseNumber?: number;
    sectionId?: string;
  };
  createdBy: Id<"profiles">;
};

export async function submitReviewHandler(ctx: MutationCtx, args: SubmitReviewArgs) {
  if ((args.status === "needs_changes" || args.status === "rejected") && !args.comment) {
    throw new Error("Comment is required for needs_changes or rejected status");
  }

  const activity = await ctx.db.get(args.componentId as Id<"activities">);
  if (!activity) throw new Error("Activity not found");

  let derivedComponentKind: "example" | "activity" | "practice" = args.componentKind;
  if (args.placement?.phaseId) {
    const phaseVersion = await ctx.db.get(args.placement.phaseId as Id<"phase_versions">);
    if (phaseVersion?.phaseType) {
      derivedComponentKind = resolveComponentKind(phaseVersion.phaseType);
    }
  }

  const componentContentHash = await computeComponentContentHash({
    componentKind: derivedComponentKind,
    componentKey: activity.componentKey,
    props: activity.props,
    gradingConfig: activity.gradingConfig,
  });

  const now = Date.now();

  const reviewId = await ctx.db.insert("component_reviews", {
    componentKind: derivedComponentKind,
    componentId: args.componentId,
    componentKey: args.componentKey,
    componentContentHash,
    status: args.status,
    comment: args.comment,
    issueTags: args.issueTags,
    priority: args.priority,
    placement: args.placement,
    createdBy: args.createdBy,
    createdAt: now,
  });

  const approvalSummary = {
    status: args.status,
    contentHash: componentContentHash,
    reviewedAt: now,
    reviewedBy: args.createdBy,
    reviewId,
  };

  if (derivedComponentKind === "activity") {
    await ctx.db.patch(args.componentId as Id<"activities">, {
      approval: approvalSummary,
    });
  } else {
    const existingApproval = await ctx.db
      .query("component_approvals")
      .withIndex("by_component", (q) => q.eq("componentKind", derivedComponentKind).eq("componentId", args.componentId))
      .unique();
    if (existingApproval) {
      await ctx.db.patch(existingApproval._id, {
        ...approvalSummary,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("component_approvals", {
        componentKind: derivedComponentKind,
        componentId: args.componentId,
        componentKey: args.componentKey,
        ...approvalSummary,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { reviewId };
}

export const submitReview = internalMutation({
  args: {
    componentKind: v.union(v.literal("example"), v.literal("activity"), v.literal("practice")),
    componentId: v.string(),
    componentKey: v.optional(v.string()),
    status: v.union(v.literal("approved"), v.literal("needs_changes"), v.literal("rejected")),
    comment: v.optional(v.string()),
    issueTags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    placement: v.optional(v.object({
      lessonId: v.optional(v.string()),
      lessonVersionId: v.optional(v.string()),
      phaseId: v.optional(v.string()),
      phaseNumber: v.optional(v.number()),
      sectionId: v.optional(v.string()),
    })),
    createdBy: v.id("profiles"),
  },
  handler: submitReviewHandler,
});

export async function getAuditContextHandler(ctx: QueryCtx): Promise<Doc<"component_reviews">[]> {
  const needsChanges = await ctx.db
    .query("component_reviews")
    .withIndex("by_status", (q) => q.eq("status", "needs_changes"))
    .filter((q) => q.eq(q.field("resolvedAt"), undefined))
    .take(100);

  const rejected = await ctx.db
    .query("component_reviews")
    .withIndex("by_status", (q) => q.eq("status", "rejected"))
    .filter((q) => q.eq(q.field("resolvedAt"), undefined))
    .take(100);

  return [...needsChanges, ...rejected];
}

export const getAuditContext = internalQuery({
  args: {},
  handler: getAuditContextHandler,
});
