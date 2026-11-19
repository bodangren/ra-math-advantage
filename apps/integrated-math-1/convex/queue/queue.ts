import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { buildDailyQueue, type QueueItem } from "@math-platform/srs-engine";
import type { ObjectivePracticePolicy, SrsCardState } from "@math-platform/srs-engine";

const VALID_PRIORITIES = new Set<string>(["essential", "supporting", "extension", "triaged"]);
import { IM1_TRANSLATION_NODE_ID, isTranslationPilotReady } from "../activities";
import { projectIM1VerbalToNumerical } from "@math-platform/math-content/knowledge-space";

export type ResolvedQueueItem = QueueItem & {
  activityId?: string;
  stableActivityId?: string;
  masteryNodeId?: string;
  mode?: "guided_practice" | "independent_practice";
  componentKey: string;
  props: Record<string, unknown>;
};

function mapDbCardToContract(card: {
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
}): SrsCardState {
  return {
    cardId: card._id as string,
    studentId: card.studentId as string,
    objectiveId: card.objectiveId,
    variantKey: card.problemFamilyId,
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

interface QueueDbContext {
  db: Pick<QueryCtx["db"], "query" | "get">;
}

async function resolveQueueItems(
  ctx: QueueDbContext,
  items: QueueItem[],
): Promise<ResolvedQueueItem[]> {
  const uniqueVariantKeys = [...new Set(items.map((item) => item.card.variantKey))];

  const practiceItemResults = await Promise.all(
    uniqueVariantKeys.map(async (variantKey) => {
      const practiceItem = await ctx.db
        .query("practice_items")
        .withIndex("by_problemFamilyId", (q) => q.eq("problemFamilyId", variantKey))
        .first();
      return { variantKey, practiceItem };
    }),
  );

  const practiceItemMap = new Map(
    practiceItemResults
      .filter(
        (r): r is { variantKey: string; practiceItem: NonNullable<typeof r.practiceItem> } =>
          r.practiceItem !== null,
      )
      .map((r) => [r.variantKey, r.practiceItem]),
  );

  const activityIds = [
    ...new Set(
      practiceItemResults
        .filter((r) => r.practiceItem !== null)
        .map((r) => r.practiceItem!.activityId),
    ),
  ];

  const activityResults = await Promise.all(
    activityIds.map(async (activityId) => {
      const activity = await ctx.db.get(activityId);
      return { activityId, activity };
    }),
  );

  const activityMap = new Map(
    activityResults
      .filter(
        (r): r is { activityId: Id<"activities">; activity: NonNullable<typeof r.activity> } =>
          r.activity !== null,
      )
      .map((r) => [r.activityId, r.activity]),
  );

  const resolvedItems: ResolvedQueueItem[] = [];
  for (const item of items) {
    const practiceItem = practiceItemMap.get(item.card.variantKey);
    if (!practiceItem) continue;

    const activity = activityMap.get(practiceItem.activityId);
    if (!activity) continue;
    const isIdentityAware =
      activity.stableActivityId !== undefined || activity.masteryNodeId !== undefined;
    if (
      isIdentityAware &&
      (!isTranslationPilotReady() ||
        activity.componentKey !== "fill-in-the-blank" ||
        activity.generatorSeed === undefined ||
        activity.generatorDifficulty === undefined ||
        activity.approval?.status !== "approved" ||
        activity.srsEligible !== true ||
        activity.masteryNodeId !== item.card.objectiveId ||
        activity.masteryNodeId !== IM1_TRANSLATION_NODE_ID ||
        activity.stableActivityId !==
          `${IM1_TRANSLATION_NODE_ID}.${activity.learningEvidenceMode}` ||
        !activity.stableActivityId ||
        (activity.learningEvidenceMode !== "guided_practice" &&
          activity.learningEvidenceMode !== "independent_practice"))
    )
      continue;

    resolvedItems.push({
      ...item,
      activityId: String(activity._id),
      ...(isIdentityAware
        ? {
            stableActivityId: activity.stableActivityId!,
            masteryNodeId: activity.masteryNodeId!,
            mode: activity.learningEvidenceMode as "guided_practice" | "independent_practice",
          }
        : {}),
      componentKey: activity.componentKey,
      props: isIdentityAware
        ? projectIM1VerbalToNumerical(
            {
              nodeId: IM1_TRANSLATION_NODE_ID,
              seed: activity.generatorSeed!,
              difficulty: activity.generatorDifficulty!,
            },
            activity.learningEvidenceMode!,
            activity.stableActivityId!,
          ).props
        : (activity.props as Record<string, unknown>),
    });
  }

  return resolvedItems;
}

export async function resolveDailyPracticeQueue(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string },
): Promise<ResolvedQueueItem[]> {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) => q.eq("studentId", args.studentId as Id<"profiles">))
    .take(100);

  const policyRecords = await ctx.db
    .query("objective_policies")
    .withIndex("by_courseKey", (q) => q.eq("courseKey", "integrated-math-1"))
    .collect();

  const uniqueStandardIds = [...new Set(policyRecords.map((r) => r.standardId))];
  const standardResults = await Promise.all(
    uniqueStandardIds.map(async (standardId) => {
      const standard = await ctx.db.get(standardId);
      return { standardId, standard };
    }),
  );

  const standardMap = new Map(
    standardResults
      .filter(
        (
          r,
        ): r is {
          standardId: Id<"competency_standards">;
          standard: NonNullable<typeof r.standard>;
        } => r.standard !== null,
      )
      .map((r) => [r.standardId, r.standard]),
  );

  const policies = new Map<string, ObjectivePracticePolicy>();
  for (const record of policyRecords) {
    const standard = standardMap.get(record.standardId);
    if (!standard) continue;
    policies.set(standard.code, {
      objectiveId: standard.code,
      priority: VALID_PRIORITIES.has(record.policy)
        ? (record.policy as ObjectivePracticePolicy["priority"])
        : "essential",
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

  return resolveQueueItems(ctx, queueItems);
}

export async function getDailyPracticeQueueHandler(
  ctx: QueryCtx,
  args: { studentId: string; asOfDate?: string },
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
