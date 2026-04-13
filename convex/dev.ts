import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { computeComponentContentHash } from "../lib/activities/content-hash";

type ReviewQueueItem =
  | {
      componentKind: "activity";
      componentId: Id<"activities">;
      componentKey: string;
      displayName: string;
      currentHash: string;
      storedHash?: string;
      isStale: boolean;
      approval?: Doc<"activities">["approval"];
    }
  | {
      componentKind: "example" | "practice";
      componentId: string;
      componentKey?: string;
      approval: Doc<"component_approvals">;
    };

export const listReviewQueue = internalQuery({
  args: {
    componentKind: v.optional(v.union(v.literal("example"), v.literal("activity"), v.literal("practice"))),
    status: v.optional(v.union(v.literal("unreviewed"), v.literal("approved"), v.literal("needs_changes"), v.literal("rejected"))),
    onlyStale: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<ReviewQueueItem[]> => {
    const items: ReviewQueueItem[] = [];
    const MAX_ITEMS = 500;

    const activities = await ctx.db.query("activities").take(MAX_ITEMS);
    for (const activity of activities) {
      const currentHash = await computeComponentContentHash({
        componentKind: "activity",
        componentKey: activity.componentKey,
        props: activity.props,
        gradingConfig: activity.gradingConfig,
      });
      const storedHash = activity.approval?.contentHash;
      const isStale = storedHash ? storedHash !== currentHash : false;

      if (args.componentKind && args.componentKind !== "activity" && args.componentKind !== "practice") continue;
      if (args.status && activity.approval?.status !== args.status) continue;
      if (args.onlyStale && !isStale) continue;

      items.push({
        componentKind: "activity",
        componentId: activity._id,
        componentKey: activity.componentKey,
        displayName: activity.displayName,
        currentHash,
        storedHash,
        isStale,
        approval: activity.approval,
      });
    }

    const componentApprovals = await ctx.db.query("component_approvals").take(MAX_ITEMS);
    for (const approval of componentApprovals) {
      if (approval.componentKind === "activity") continue;
      if (args.componentKind && args.componentKind !== approval.componentKind) continue;
      if (args.status && approval.status !== args.status) continue;

      items.push({
        componentKind: approval.componentKind,
        componentId: approval.componentId,
        componentKey: approval.componentKey,
        approval,
      });
    }

    return items;
  },
});

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
  handler: async (ctx, args) => {
    if ((args.status === "needs_changes" || args.status === "rejected") && !args.comment) {
      throw new Error("Comment is required for needs_changes or rejected status");
    }

    let componentContentHash = "";
    if (args.componentKind === "activity") {
      const activity = await ctx.db.get(args.componentId as Id<"activities">);
      if (!activity) throw new Error("Activity not found");
      componentContentHash = await computeComponentContentHash({
        componentKind: "activity",
        componentKey: activity.componentKey,
        props: activity.props,
        gradingConfig: activity.gradingConfig,
      });
    } else {
      componentContentHash = "todo-hash-for-example-practice";
    }

    const reviewId = await ctx.db.insert("component_reviews", {
      componentKind: args.componentKind,
      componentId: args.componentId,
      componentKey: args.componentKey,
      componentContentHash,
      status: args.status,
      comment: args.comment,
      issueTags: args.issueTags,
      priority: args.priority,
      placement: args.placement,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    const approvalSummary = {
      status: args.status,
      contentHash: componentContentHash,
      reviewedAt: Date.now(),
      reviewedBy: args.createdBy,
      reviewId,
    };

    if (args.componentKind === "activity") {
      await ctx.db.patch(args.componentId as Id<"activities">, {
        approval: approvalSummary,
      });
    } else {
      const existingApproval = await ctx.db
        .query("component_approvals")
        .withIndex("by_component", (q) => q.eq("componentKind", args.componentKind).eq("componentId", args.componentId))
        .unique();
      if (existingApproval) {
        await ctx.db.patch(existingApproval._id, {
          ...approvalSummary,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("component_approvals", {
          componentKind: args.componentKind,
          componentId: args.componentId,
          componentKey: args.componentKey,
          ...approvalSummary,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return { reviewId };
  },
});

export const getAuditContext = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"component_reviews">[]> => {
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
  },
});
