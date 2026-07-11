import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { buildDailyQueueResult, type QueueItem } from "@math-platform/srs-engine";
import type { ObjectivePracticePolicy, SrsCardState } from "@math-platform/srs-engine";
import { assessReviewLoadV3_2, type ReviewLoadAssessmentV3_2 } from "@math-platform/knowledge-space-practice";
import { resolveCanonicalVariantKey } from "../../lib/srs/v3-runtime-contract";

const VALID_PRIORITIES = new Set<string>(['essential', 'supporting', 'extension', 'triaged']);
const MAX_CARDS_PER_DAILY_QUEUE = 100;
const MAX_OBJECTIVE_POLICIES = 100;

export type ResolvedQueueItem = QueueItem & {
  componentKey: string;
  props: Record<string, unknown>;
};

export interface ResolvedDailyPracticeQueue {
  readonly items: ResolvedQueueItem[];
  readonly backlog: boolean;
  readonly dueReviewCount: number;
  readonly deferredReviewCount: number;
  readonly newCardsSuppressed: boolean;
  readonly reviewLoad: ReviewLoadAssessmentV3_2;
}

/**
 * Maps a database SRS card to the contract format used by the queue builder.
 * @param {{ _id: Id<"srs_cards">; studentId: Id<"profiles">; objectiveId: string; variantKey?: string; legacyProblemFamilyId?: string; problemFamilyId?: string; stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; dueDate: string; elapsedDays: number; scheduledDays: number; reps: number; lapses: number; lastReview?: string; createdAt: number; updatedAt: number }} card - The raw database card object
 * @returns {SrsCardState} The card in SrsCardState contract format
 */
function mapDbCardToContract(
  card: {
    _id: Id<"srs_cards">;
    studentId: Id<"profiles">;
    objectiveId: string;
    variantKey?: string;
    legacyProblemFamilyId?: string;
    problemFamilyId?: string;
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
  const { variantKey } = resolveCanonicalVariantKey(card);
  return {
    cardId: card._id as string,
    studentId: card.studentId as string,
    objectiveId: card.objectiveId,
    variantKey,
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

/**
 * Resolves queue items by enriching them with activity component data.
 * @param {QueueDbContext} ctx - The database query context
 * @param {QueueItem[]} items - The raw queue items from the SRS engine
 * @returns {Promise<ResolvedQueueItem[]>} Resolved queue items with componentKey and props
 */
async function resolveQueueItems(
  ctx: QueueDbContext,
  items: QueueItem[]
): Promise<ResolvedQueueItem[]> {
  const uniqueVariantKeys = [...new Set(items.map((item) => item.card.variantKey))];

  const practiceItemResults = await Promise.all(
    uniqueVariantKeys.map(async (variantKey) => {
      const practiceItem = await ctx.db
        .query("practice_items")
        .withIndex("by_variantKey", (q) =>
          q.eq("variantKey", variantKey)
        )
        .first();
      return { variantKey, practiceItem };
    })
  );

  const practiceItemMap = new Map(
    practiceItemResults
      .filter((r): r is { variantKey: string; practiceItem: NonNullable<typeof r.practiceItem> } => r.practiceItem !== null)
      .map((r) => [r.variantKey, r.practiceItem])
  );

  const activityIds = [...new Set(
    practiceItemResults
      .filter((r) => r.practiceItem !== null)
      .map((r) => r.practiceItem!.activityId)
  )];

  const activityResults = await Promise.all(
    activityIds.map(async (activityId) => {
      const activity = await ctx.db.get(activityId);
      return { activityId, activity };
    })
  );

  const activityMap = new Map(
    activityResults
      .filter((r): r is { activityId: Id<"activities">; activity: NonNullable<typeof r.activity> } => r.activity !== null)
      .map((r) => [r.activityId, r.activity])
  );

  const resolvedItems: ResolvedQueueItem[] = [];
  for (const item of items) {
    const practiceItem = practiceItemMap.get(item.card.variantKey);
    if (!practiceItem) continue;

    const activity = activityMap.get(practiceItem.activityId);
    if (!activity) continue;

    resolvedItems.push({
      ...item,
      componentKey: activity.componentKey,
      props: activity.props as Record<string, unknown>,
    });
  }

  return resolvedItems;
}

export interface QueueDbContext {
  db: Pick<QueryCtx["db"], "query" | "get">;
}

/**
 * Builds and resolves the daily practice queue for a student.
 * @param {QueueDbContext} ctx - The database query context
 * @param {{ studentId: string; asOfDate?: string }} args - The student ID and optional date
 * @returns {Promise<ResolvedQueueItem[]>} Array of resolved queue items with component data
 */
export async function resolveDailyPracticeQueue(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string }
): Promise<ResolvedQueueItem[]> {
  return (await resolveDailyPracticeQueueResult(ctx, args)).items;
}

/** Builds an observable v3.2 queue, including review-load guidance. */
export async function resolveDailyPracticeQueueResult(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string },
): Promise<ResolvedDailyPracticeQueue> {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .take(MAX_CARDS_PER_DAILY_QUEUE);

  const policyRecords = await ctx.db
    .query("objective_policies")
    .withIndex("by_courseKey", (q) => q.eq("courseKey", "integrated-math-3"))
    .take(MAX_OBJECTIVE_POLICIES);

  const uniqueStandardIds = [...new Set(policyRecords.map((r) => r.standardId))];
  const standardResults = await Promise.all(
    uniqueStandardIds.map(async (standardId) => {
      const standard = await ctx.db.get(standardId);
      return { standardId, standard };
    })
  );

  const standardMap = new Map(
    standardResults
      .filter((r): r is { standardId: Id<"competency_standards">; standard: NonNullable<typeof r.standard> } => r.standard !== null)
      .map((r) => [r.standardId, r.standard])
  );

  const policies = new Map<string, ObjectivePracticePolicy>();
  for (const record of policyRecords) {
    const standard = standardMap.get(record.standardId);
    if (!standard) continue;
    policies.set(standard.code, {
      objectiveId: standard.code,
      priority: VALID_PRIORITIES.has(record.policy)
        ? (record.policy as ObjectivePracticePolicy["priority"])
        : 'essential',
    });
  }

  const config = {
    newCardsPerDay: 5,
    maxReviewsPerDay: 20,
    prioritizeOverdue: true,
  };

  const now = args.asOfDate ?? new Date().toISOString();
  // A malformed historic identity is a migration data gap. It is excluded from
  // live practice instead of making the whole student's queue unavailable;
  // the comparison telemetry records it before cutover approval.
  const cardStates = cards.flatMap((card) => {
    try {
      return [mapDbCardToContract(card)];
    } catch {
      return [];
    }
  });

  const queueResult = buildDailyQueueResult(cardStates, policies, config, now);

  const reviewLoad = assessReviewLoadV3_2({
    asOf: now,
    maxReviewsPerDay: config.maxReviewsPerDay,
    cards: cardStates.map((card) => ({ cardId: card.cardId, dueDate: card.dueDate })),
  });
  const resolvedItems = await resolveQueueItems(ctx, queueResult.items);
  return {
    items: resolvedItems,
    backlog: queueResult.backlog,
    dueReviewCount: queueResult.dueReviewCount,
    deferredReviewCount: queueResult.deferredReviewCount,
    newCardsSuppressed: queueResult.newCardsSuppressed,
    reviewLoad,
  };
}

/**
 * Retrieves the daily practice queue for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string; asOfDate?: string }} args - The student ID and optional date
 * @returns {Promise<ResolvedQueueItem[]>} Array of resolved queue items with component data
 */
export async function getDailyPracticeQueueHandler(
  ctx: QueryCtx,
  args: { studentId: string; asOfDate?: string }
): Promise<ResolvedQueueItem[]> {
  return resolveDailyPracticeQueue(ctx, args);
}

/**
 * Retrieves the daily practice queue for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string; asOfDate?: string }} args - The student ID and optional date
 * @returns {Promise<ResolvedQueueItem[]>} Array of resolved queue items with component data
 */
export const getDailyPracticeQueue = internalQuery({
  args: {
    studentId: v.string(),
    asOfDate: v.optional(v.string()),
  },
  handler: getDailyPracticeQueueHandler,
});
