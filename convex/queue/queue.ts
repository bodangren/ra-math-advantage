import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { buildDailyQueue, type QueueItem } from "../../lib/srs/queue";
import type { ObjectivePracticePolicy, SrsCardState } from "../../lib/srs/contract";

export type ResolvedQueueItem = QueueItem & {
  componentKey: string;
  props: Record<string, unknown>;
};

function mapDbCardToContract(
  card: {
    _id: Id<"srs_cards">;
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
    lastReview?: string;
    createdAt: number;
    updatedAt: number;
  }
): SrsCardState {
  return {
    cardId: card._id,
    studentId: card.studentId,
    objectiveId: card.objectiveId,
    problemFamilyId: card.problemFamilyId,
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    dueDate: card.dueDate,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview ?? null,
    createdAt: new Date(card.createdAt).toISOString(),
    updatedAt: new Date(card.updatedAt).toISOString(),
  };
}

async function resolveQueueItem(
  ctx: QueueDbContext,
  item: QueueItem
): Promise<ResolvedQueueItem | null> {
  const practiceItems = await ctx.db
    .query("practice_items")
    .withIndex("by_problemFamilyId", (q) =>
      q.eq("problemFamilyId", item.card.problemFamilyId)
    )
    .first();

  if (!practiceItems) {
    return null;
  }

  const activity = await ctx.db.get(practiceItems.activityId);
  if (!activity) {
    return null;
  }

  return {
    ...item,
    componentKey: activity.componentKey,
    props: activity.props as Record<string, unknown>,
  };
}

export interface QueueDbContext {
  db: Pick<QueryCtx["db"], "query" | "get">;
}

export async function resolveDailyPracticeQueue(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string }
): Promise<ResolvedQueueItem[]> {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .collect();

  const policyRecords = await ctx.db
    .query("objective_policies")
    .withIndex("by_courseKey", (q) => q.eq("courseKey", "integrated-math-3"))
    .collect();

  const policies = new Map<string, ObjectivePracticePolicy>();
  for (const record of policyRecords) {
    const standard = await ctx.db.get(record.standardId);
    if (!standard) continue;
    policies.set(standard.code, {
      objectiveId: standard.code,
      priority: record.policy as ObjectivePracticePolicy["priority"],
    });
  }

  const config = {
    newCardsPerDay: 5,
    maxReviewsPerDay: 20,
    prioritizeOverdue: true,
  };

  const now = args.asOfDate ?? new Date().toISOString();
  const cardStates = cards.map(mapDbCardToContract);

  const queueItems = buildDailyQueue(cardStates, policies, config, now);

  const resolvedItems: ResolvedQueueItem[] = [];
  for (const item of queueItems) {
    const resolved = await resolveQueueItem(ctx, item);
    if (resolved !== null) {
      resolvedItems.push(resolved);
    }
  }

  return resolvedItems;
}

export async function getDailyPracticeQueueHandler(
  ctx: QueryCtx,
  args: { studentId: string; asOfDate?: string }
): Promise<ResolvedQueueItem[]> {
  return resolveDailyPracticeQueue(ctx, args);
}

export const getDailyPracticeQueue = internalQuery({
  args: {
    studentId: v.string(),
    asOfDate: v.optional(v.string()),
  },
  handler: getDailyPracticeQueueHandler,
});
