import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { buildDailyQueueResult, type QueueItem } from "@math-platform/srs-engine";
import type { ObjectivePracticePolicy, SrsCardState } from "@math-platform/srs-engine";
import { assessReviewLoadV3_2, type ReviewLoadAssessmentV3_2 } from "@math-platform/knowledge-space-practice";
import { resolveCanonicalVariantKey } from "../../lib/srs/v3-runtime-contract";
import { isIm3GraphPilotPublished } from "../activities";
import { hasCurrentSelectedActivityIdentity } from "../learningEvidence";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
} from "../../lib/practice/learning-evidence-pilot";

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
export async function resolveQueueItems(
  ctx: QueueDbContext,
  items: QueueItem[],
  studentId?: string,
  publication?: Parameters<typeof isIm3GraphPilotPublished>[0],
): Promise<ResolvedQueueItem[]> {
  const uniqueVariantKeys = [...new Set(items.map((item) => item.card.variantKey))].sort();

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

    const originalSelectedIds = [
      IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    ];
    const laterGraphIds = [
      IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
    ];
    const isConsistentLaterGraph = laterGraphIds.some((stableId) => (
      item.card.variantKey === stableId
      && practiceItem.variantKey === stableId
      && activity.stableActivityId === stableId
    ))
      && item.card.objectiveId === IM3_PILOT_NODE
      && activity.masteryNodeId === IM3_PILOT_NODE
      && activity.componentKey === "graphing-explorer";
    const claimsOriginalSelected = originalSelectedIds.includes(item.card.variantKey as typeof originalSelectedIds[number])
      || originalSelectedIds.includes(practiceItem.variantKey as typeof originalSelectedIds[number])
      || originalSelectedIds.includes(activity.stableActivityId as typeof originalSelectedIds[number])
      || (
        (item.card.objectiveId === IM3_PILOT_NODE || activity.masteryNodeId === IM3_PILOT_NODE)
        && !isConsistentLaterGraph
      );
    const originalSelectedMode = activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
      ? "guided"
      : "independent";
    if (claimsOriginalSelected && (
      !isIm3GraphPilotPublished(publication)
      || activity.approval?.status !== "approved"
      || activity.masteryNodeId !== IM3_PILOT_NODE
      || activity.componentKey !== "graphing-explorer"
      || activity.srsEligible !== true
      || !originalSelectedIds.includes(activity.stableActivityId as typeof originalSelectedIds[number])
      || item.card.objectiveId !== IM3_PILOT_NODE
      || item.card.variantKey !== practiceItem.variantKey
      || practiceItem.variantKey !== activity.stableActivityId
      || !hasCurrentSelectedActivityIdentity(
        { activityId: String(activity._id), activity },
        originalSelectedMode,
      )
    )) continue;

    const matchedNodeId = activity.masteryNodeId;
    const isPilotActivity = (
      (
        (
          activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
          || activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
          || activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
          || activity.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
        )
          && activity.masteryNodeId === IM3_PILOT_NODE
          && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID
        )
          && activity.masteryNodeId === IM3_MAXIMUM_READING_NODE
          && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID
        )
        && activity.masteryNodeId === IM3_SYMMETRY_NODE
        && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID
        )
        && activity.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE
        && activity.componentKey === "graphing-explorer"
      )
      || (
        activity.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
        && activity.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
        && activity.componentKey === "graphing-explorer"
      )
      || (
        activity.stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
        && activity.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
        && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
        )
        && activity.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE
        && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID
        )
          && activity.masteryNodeId === IM3_EQUATION_RATE_NODE
          && activity.componentKey === "rate-of-change-calculator"
      )
      || (
        (
          activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID
          || activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
          || activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID
        )
          && activity.masteryNodeId === IM3_DOMAIN_RANGE_NODE
          && activity.componentKey === "graphing-explorer"
      )
      || (
        (
          activity.stableActivityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
        )
        && activity.masteryNodeId === IM3_PROFIT_MODEL_NODE
        && activity.componentKey === "fill-in-the-blank"
      )
      || (
        (
          activity.stableActivityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
          || activity.stableActivityId === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
        )
        && activity.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE
        && activity.componentKey === "fill-in-the-blank"
      )
    )
      && activity.srsEligible === true;
    if (isPilotActivity && studentId && matchedNodeId) {
      const exposure = await ctx.db
        .query("learning_evidence")
        .withIndex("by_learner_node_origin", (q) => (
          q
            .eq("learnerId", studentId as Id<"profiles">)
            .eq("nodeId", matchedNodeId)
            .eq("origin", "teacher_led")
        ))
        .take(1);
      if (exposure.length === 0) continue;
    }

    resolvedItems.push({
      ...item,
      componentKey: activity.componentKey,
      props: {
        ...(activity.props as Record<string, unknown>),
        activityId: String(activity._id),
        ...(isPilotActivity
          ? {
              stableActivityId: activity.stableActivityId,
              masteryNodeId: activity.masteryNodeId,
              srsEligible: activity.srsEligible,
              ...(claimsOriginalSelected
                ? {
                    practiceMode: activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
                      ? "guided_practice"
                      : "independent_practice",
                  }
                : {}),
            }
          : {}),
      },
    });
  }

  return resolvedItems;
}

export interface QueueDbContext {
  db: Pick<QueryCtx["db"], "query" | "get">;
}

function buildPilotCandidate(
  studentId: string,
  now: string,
  variantKey: string,
  objectiveId: string = IM3_PILOT_NODE,
): QueueItem {
  return {
    card: {
      cardId: `candidate:${variantKey}`,
      studentId,
      objectiveId,
      variantKey,
      stability: 0,
      difficulty: 0,
      state: "new",
      dueDate: now,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      lastReview: null,
      createdAt: now,
      updatedAt: now,
    },
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
  };
}

/**
 * Builds and resolves the daily practice queue for a student.
 * @param {QueueDbContext} ctx - The database query context
 * @param {{ studentId: string; asOfDate?: string }} args - The student ID and optional date
 * @returns {Promise<ResolvedQueueItem[]>} Array of resolved queue items with component data
 */
export async function resolveDailyPracticeQueue(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string },
  publication?: Parameters<typeof isIm3GraphPilotPublished>[0],
): Promise<ResolvedQueueItem[]> {
  return (await resolveDailyPracticeQueueResult(ctx, args, publication)).items;
}

/** Builds an observable v3.2 queue, including review-load guidance. */
export async function resolveDailyPracticeQueueResult(
  ctx: QueueDbContext,
  args: { studentId: string; asOfDate?: string },
  publication?: Parameters<typeof isIm3GraphPilotPublished>[0],
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

  let queueItems = queueResult.items;
  const hasGraphGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_GUIDED_VARIANT_KEY
    && card.objectiveId === IM3_PILOT_NODE
  ));
  const hasGraphGuidedSeed2Card = cardStates.some((card) => (
    card.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY
    && card.objectiveId === IM3_PILOT_NODE
  ));
  const hasGraphIndependentSeed2Card = cardStates.some((card) => (
    card.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY
    && card.objectiveId === IM3_PILOT_NODE
  ));
  const hasGraphIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_PILOT_VARIANT_KEY
    && card.objectiveId === IM3_PILOT_NODE
  ));
  const hasEquationGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_EQUATION_RATE_NODE
  ));
  const hasEquationIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_EQUATION_RATE_NODE
  ));
  const hasDomainRangeGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_DOMAIN_RANGE_NODE
  ));
  const hasDomainRangeGuidedSeed2Card = cardStates.some((card) => (
    card.variantKey === IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY
    && card.objectiveId === IM3_DOMAIN_RANGE_NODE
  ));
  const hasDomainRangeIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_DOMAIN_RANGE_NODE
  ));
  const hasDomainRangeIndependentSeed2Card = cardStates.some((card) => (
    card.variantKey === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY
    && card.objectiveId === IM3_DOMAIN_RANGE_NODE
  ));
  const hasProfitModelGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_PROFIT_MODEL_NODE
  ));
  const hasProfitModelIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_PROFIT_MODEL_NODE
  ));
  const hasMaximumGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_PROFIT_MAXIMUM_NODE
  ));
  const hasMaximumIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_PROFIT_MAXIMUM_NODE
  ));
  const hasMaximumReadingGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_MAXIMUM_READING_NODE
  ));
  const hasMaximumReadingIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_MAXIMUM_READING_NODE
  ));
  const hasSymmetryGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_SYMMETRY_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_SYMMETRY_NODE
  ));
  const hasSymmetryIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_SYMMETRY_NODE
  ));
  const hasCompareMaximumGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_COMPARE_MAXIMUM_NODE
  ));
  const hasCompareMaximumIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_COMPARE_MAXIMUM_NODE
  ));
  const hasOneRealSolutionGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_ONE_REAL_SOLUTION_NODE
  ));
  const hasOneRealSolutionIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_ONE_REAL_SOLUTION_NODE
  ));
  const hasTwoRealSolutionsGuidedCard = cardStates.some((card) => (
    card.variantKey === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
    && card.objectiveId === IM3_TWO_REAL_SOLUTIONS_NODE
  ));
  const hasTwoRealSolutionsIndependentCard = cardStates.some((card) => (
    card.variantKey === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
    && card.objectiveId === IM3_TWO_REAL_SOLUTIONS_NODE
  ));
  const hasNewCardCapacity = queueItems.length < config.maxReviewsPerDay
    && queueItems.filter((item) => item.card.state === "new").length < config.newCardsPerDay;
  const graphPilotPublished = isIm3GraphPilotPublished(publication);
  const nextPilot = graphPilotPublished && !hasGraphGuidedCard
    ? {
        activityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
        variantKey: IM3_GUIDED_VARIANT_KEY,
        nodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
      }
    : graphPilotPublished && !hasGraphGuidedSeed2Card
      ? {
          activityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
          variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
          nodeId: IM3_PILOT_NODE,
          componentKey: "graphing-explorer",
        }
    : graphPilotPublished && !hasGraphIndependentCard
      ? {
          activityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
          variantKey: IM3_PILOT_VARIANT_KEY,
          nodeId: IM3_PILOT_NODE,
          componentKey: "graphing-explorer",
        }
    : graphPilotPublished && !hasGraphIndependentSeed2Card
      ? {
          activityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
          variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
          nodeId: IM3_PILOT_NODE,
          componentKey: "graphing-explorer",
        }
    : !hasEquationGuidedCard
        ? {
            activityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
            variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
            nodeId: IM3_EQUATION_RATE_NODE,
            componentKey: "rate-of-change-calculator",
          }
        : !hasEquationIndependentCard
          ? {
              activityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
              variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
              nodeId: IM3_EQUATION_RATE_NODE,
              componentKey: "rate-of-change-calculator",
            }
          : !hasDomainRangeGuidedCard
            ? {
                activityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
                variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
                nodeId: IM3_DOMAIN_RANGE_NODE,
                componentKey: "graphing-explorer",
              }
            : !hasDomainRangeGuidedSeed2Card
              ? {
                  activityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
                  variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
                  nodeId: IM3_DOMAIN_RANGE_NODE,
                  componentKey: "graphing-explorer",
                }
            : !hasDomainRangeIndependentCard
              ? {
                  activityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
                  variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
                  nodeId: IM3_DOMAIN_RANGE_NODE,
                  componentKey: "graphing-explorer",
                }
            : !hasDomainRangeIndependentSeed2Card
              ? {
                  activityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
                  variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
                  nodeId: IM3_DOMAIN_RANGE_NODE,
                  componentKey: "graphing-explorer",
                }
              : !hasProfitModelGuidedCard
                ? {
                    activityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
                    variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
                    nodeId: IM3_PROFIT_MODEL_NODE,
                    componentKey: "fill-in-the-blank",
                  }
                : !hasProfitModelIndependentCard
                  ? {
                      activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
                      variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
                      nodeId: IM3_PROFIT_MODEL_NODE,
                      componentKey: "fill-in-the-blank",
                    }
                  : !hasMaximumGuidedCard
                    ? {
                        activityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
                        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
                        nodeId: IM3_PROFIT_MAXIMUM_NODE,
                        componentKey: "fill-in-the-blank",
                      }
                  : !hasMaximumIndependentCard
                      ? {
                          activityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
                          variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
                          nodeId: IM3_PROFIT_MAXIMUM_NODE,
                          componentKey: "fill-in-the-blank",
                        }
                      : !hasMaximumReadingGuidedCard
                        ? {
                            activityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
                            variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
                            nodeId: IM3_MAXIMUM_READING_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasMaximumReadingIndependentCard
                        ? {
                            activityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
                            variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
                            nodeId: IM3_MAXIMUM_READING_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasSymmetryGuidedCard
                        ? {
                            activityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
                            variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
                            nodeId: IM3_SYMMETRY_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasSymmetryIndependentCard
                        ? {
                            activityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
                            variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
                            nodeId: IM3_SYMMETRY_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasCompareMaximumGuidedCard
                        ? {
                            activityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
                            variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
                            nodeId: IM3_COMPARE_MAXIMUM_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasCompareMaximumIndependentCard
                        ? {
                            activityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
                            variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
                            nodeId: IM3_COMPARE_MAXIMUM_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasOneRealSolutionGuidedCard
                        ? {
                            activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
                            variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
                            nodeId: IM3_ONE_REAL_SOLUTION_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasOneRealSolutionIndependentCard
                        ? {
                            activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
                            variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
                            nodeId: IM3_ONE_REAL_SOLUTION_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasTwoRealSolutionsGuidedCard
                        ? {
                            activityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
                            variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
                            nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : !hasTwoRealSolutionsIndependentCard
                        ? {
                            activityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
                            variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
                            nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
                            componentKey: "graphing-explorer",
                          }
                      : null;
  if (!queueResult.backlog && queueItems.length === 0 && hasNewCardCapacity && nextPilot) {
    const pilotPracticeItem = await ctx.db
      .query("practice_items")
      .withIndex("by_variantKey", (q) => q.eq("variantKey", nextPilot.variantKey))
      .first();
    const pilotActivity = pilotPracticeItem
      ? await ctx.db.get(pilotPracticeItem.activityId)
      : null;
    const exposure = await ctx.db
      .query("learning_evidence")
      .withIndex("by_learner_node_origin", (q) => (
        q
          .eq("learnerId", args.studentId as Id<"profiles">)
          .eq("nodeId", nextPilot.nodeId)
          .eq("origin", "teacher_led")
      ))
      .take(1);
    if (
      pilotPracticeItem
      && pilotActivity
      && pilotActivity.stableActivityId === nextPilot.activityId
      && pilotActivity.masteryNodeId === nextPilot.nodeId
      && pilotActivity.componentKey === nextPilot.componentKey
      && pilotActivity.srsEligible === true
      && exposure.length > 0
    ) {
      queueItems = [
        ...queueItems,
        buildPilotCandidate(args.studentId, now, nextPilot.variantKey, nextPilot.nodeId),
      ];
    }
  }

  const reviewLoad = assessReviewLoadV3_2({
    asOf: now,
    maxReviewsPerDay: config.maxReviewsPerDay,
    cards: cardStates.map((card) => ({ cardId: card.cardId, dueDate: card.dueDate })),
  });
  const resolvedItems = await resolveQueueItems(ctx, queueItems, args.studentId, publication);
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
