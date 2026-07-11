/**
 * Objective Proficiency Queries
 *
 * Aggregation pipeline from FSRS card states to objective proficiency views:
 *
 * 1. Fetch SRS cards for a student (filtered by objective/problem families if specified)
 * 2. Fetch review logs and activity submissions to derive per-review timing
 * 3. Fetch timing baselines for each problem family
 * 4. Build SrsCardState objects with stability, reps, lapses, and optional reviewDurationMs
 * 5. Call aggregateCardsToEvidence to compute per-family:
 *    - retentionStrength: minimum live FSRS retention across reviewed cards
 *    - practiceCoverage: proportion of cards with reps > 0
 *    - fluencyConfidence: high/medium/low based on timing vs baseline median
 * 6. Call computeObjectiveProficiency with policy-derived priority to produce the final result
 * 7. Wrap results in student/teacher views via buildStudentProficiencyView / buildTeacherProficiencyView
 *
 * Exported queries:
 * - getObjectiveProficiency(studentId, objectiveId?): single objective result
 * - getStudentProficiencySummary(studentId): array of StudentProficiencyView
 * - getTeacherClassProficiency(classId): array of TeacherProficiencyView
 */

import { internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  aggregateCardsToEvidence,
  computeObjectiveProficiency,
  buildStudentProficiencyView,
  buildTeacherProficiencyView,
  type ProficiencyCardInput as ProficiencyCardState,
  type TimingBaselines,
  type ObjectivePriority,
  type StudentProficiencyView,
  type TeacherProficiencyView,
} from "@math-platform/srs-engine";
import { resolveCanonicalVariantKey } from "../lib/srs/v3-runtime-contract";

const VALID_PRIORITIES = new Set<string>(['essential', 'supporting', 'extension', 'triaged']);

function withCanonicalVariants<T extends {
  variantKey?: string;
  legacyProblemFamilyId?: string;
  problemFamilyId?: string;
}>(cards: readonly T[]): Array<T & { variantKey: string }> {
  return cards.flatMap((card) => {
    try {
      return [{ ...card, variantKey: resolveCanonicalVariantKey(card).variantKey }];
    } catch {
      // Corrupt identity rows are migration data gaps; omit them from an
      // objective aggregate rather than leaking an arbitrary activity key.
      return [];
    }
  });
}

/**
 * Validates and normalizes an objective priority string.
 * @param {string} value - The priority string to validate
 * @returns {ObjectivePriority} A valid ObjectivePriority value, defaulting to 'essential'
 */
function validatePriority(value: string): ObjectivePriority {
  return VALID_PRIORITIES.has(value) ? (value as ObjectivePriority) : 'essential';
}

type PracticeVariantDoc = {
  _id: Id<"practice_variants">;
  variantKey: string;
  objectiveIds: string[];
  displayName: string;
  description: string;
  componentKey: string;
  difficulty: string;
  metadata?: unknown;
};

type CompetencyStandardDoc = {
  _id: Id<"competency_standards">;
  code: string;
  description: string;
  isActive: boolean;
};

type ObjectivePolicyDoc = {
  _id: Id<"objective_policies">;
  standardId: Id<"competency_standards">;
  policy: string;
  courseKey: string;
  priority: number;
};

type ActivitySubmissionDoc = {
  _id: Id<"activity_submissions">;
  userId: Id<"profiles">;
  activityId: Id<"activities">;
  submissionData: unknown;
  submittedAt: number;
};

type PreFetchedData = {
  familiesByObjective: Map<string, PracticeVariantDoc[]>;
  baselines: TimingBaselines;
  submissionsByStudent: Map<string, ActivitySubmissionDoc[]>;
  standardsByObjective: Map<string, CompetencyStandardDoc>;
  policiesByStandardId: Map<string, ObjectivePolicyDoc>;
};



/**
 * Fetches timing baselines for problem families from the database.
 * @param {QueryCtx} ctx - The query context
 * @param {Set<string>} familyIds - Set of problem family IDs to fetch baselines for
 * @returns {Promise<TimingBaselines>} Map of timing baselines keyed by problem family ID
 */
async function fetchTimingBaselines(
  ctx: QueryCtx,
  familyIds: Set<string>
): Promise<TimingBaselines> {
  const familyIdArray = Array.from(familyIds);
  const allBaselines = await Promise.all(
    familyIdArray.map(pfId =>
      ctx.db
        .query("timing_baselines")
        .withIndex("by_variant", (q) =>
          q.eq("variantKey", pfId)
        )
        .first()
    )
  );
  const baselines: TimingBaselines = {};
  familyIdArray.forEach((pfId, i) => {
    const baseline = allBaselines[i];
    if (baseline) {
      baselines[pfId] = {
        variantKey: baseline.variantKey,
        sampleCount: baseline.sampleCount,
        medianActiveMs: baseline.medianActiveMs,
        p25ActiveMs: baseline.p25ActiveMs,
        p75ActiveMs: baseline.p75ActiveMs,
        p90ActiveMs: baseline.p90ActiveMs,
        lastComputedAt: baseline.lastComputedAt,
        minSamplesMet: baseline.minSamplesMet,
      };
    }
  });
  return baselines;
}

/**
 * Fetches submission timings from activity submissions for review logs.
 * @param {QueryCtx} ctx - The query context
 * @param {Id<"profiles">} studentId - The student's profile ID
 * @param {Array<{ submissionId?: string; cardId: Id<"srs_cards"> }>} relevantReviews - Array of reviews to extract timings from
 * @returns {Promise<Map<string, number>>} Map of submission ID to active time in milliseconds
 */
async function fetchSubmissionTimings(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
  relevantReviews: Array<{
    submissionId?: string;
    cardId: Id<"srs_cards">;
  }>
): Promise<Map<string, number>> {
  const uniqueActivityIds = new Set<string>();
  for (const review of relevantReviews) {
    if (review.submissionId) {
      const lastDash = review.submissionId.lastIndexOf("-");
      if (lastDash > 0) {
        uniqueActivityIds.add(review.submissionId.slice(0, lastDash));
      }
    }
  }

  const activityIdArray = Array.from(uniqueActivityIds);
  const allSubmissions = await Promise.all(
    activityIdArray.map(activityId =>
      ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_activity", (q) =>
          q
            .eq("userId", studentId)
            .eq("activityId", activityId as Id<"activities">)
        )
        .collect()
    )
  );

  const submissionTimings = new Map<string, number>();
  allSubmissions.forEach((submissions, i) => {
    const activityId = activityIdArray[i];
    for (const sub of submissions) {
      const submissionData = sub.submissionData as
        | {
            attemptNumber?: number;
            timing?: { activeMs?: number };
          }
        | undefined;
      const attemptNumber = submissionData?.attemptNumber ?? 1;
      const sid = `${activityId}-${attemptNumber}`;
      const activeMs = submissionData?.timing?.activeMs;
      if (activeMs !== undefined) {
        submissionTimings.set(sid, activeMs);
      }
    }
  });
  return submissionTimings;
}

/**
 * Derives submission timings from pre-fetched student submissions.
 * @param {Id<"profiles">} studentId - The student's profile ID
 * @param {Array<{ submissionId?: string; cardId: Id<"srs_cards"> }>} relevantReviews - Array of reviews to extract timings from
 * @param {PreFetchedData} preFetched - Pre-fetched data including submissions
 * @returns {Map<string, number>} Map of submission ID to active time in milliseconds
 */
function deriveSubmissionTimingsFromPreFetched(
  studentId: Id<"profiles">,
  relevantReviews: Array<{
    submissionId?: string;
    cardId: Id<"srs_cards">;
  }>,
  preFetched: PreFetchedData
): Map<string, number> {
  const submissions = preFetched.submissionsByStudent.get(studentId) ?? [];

  const uniqueActivityIds = new Set<string>();
  for (const review of relevantReviews) {
    if (review.submissionId) {
      const lastDash = review.submissionId.lastIndexOf("-");
      if (lastDash > 0) {
        uniqueActivityIds.add(review.submissionId.slice(0, lastDash));
      }
    }
  }

  const submissionTimings = new Map<string, number>();
  for (const activityId of uniqueActivityIds) {
    for (const sub of submissions) {
      if (String(sub.activityId) === activityId) {
        const submissionData = sub.submissionData as
          | { attemptNumber?: number; timing?: { activeMs?: number } }
          | undefined;
        const attemptNumber = submissionData?.attemptNumber ?? 1;
        const sid = `${activityId}-${attemptNumber}`;
        const activeMs = submissionData?.timing?.activeMs;
        if (activeMs !== undefined) {
          submissionTimings.set(sid, activeMs);
        }
      }
    }
  }
  return submissionTimings;
}

/**
 * Pre-fetches all data needed for teacher class proficiency computation.
 * @param {QueryCtx} ctx - The query context
 * @param {Id<"profiles">[]} studentIds - Array of student profile IDs
 * @param {Map<string, Array<{ objectiveId: string; variantKey: string }>>} allStudentCards - Map of student ID to their SRS cards
 * @returns {Promise<PreFetchedData>} Pre-fetched data bundle for proficiency computation
 */
async function preFetchTeacherClassData(
  ctx: QueryCtx,
  studentIds: Id<"profiles">[],
  allStudentCards: Map<string, Array<{ objectiveId: string; variantKey: string }>>
): Promise<PreFetchedData> {
  const allObjectiveIds = new Set<string>();
  for (const cards of allStudentCards.values()) {
    for (const card of cards) {
      if (card.objectiveId) {
        allObjectiveIds.add(card.objectiveId);
      }
    }
  }
  const objectiveIdArray = Array.from(allObjectiveIds);

  const [allFamilies, allStandards, allPolicies] = await Promise.all([
    ctx.db.query("practice_variants").collect(),
    ctx.db.query("competency_standards").collect(),
    ctx.db.query("objective_policies").collect(),
  ]);

  const standardsByCode = new Map<string, CompetencyStandardDoc>();
  for (const standard of allStandards) {
    standardsByCode.set(standard.code, standard);
  }

  const familiesByObjective = new Map<string, PracticeVariantDoc[]>();
  for (const family of allFamilies) {
    for (const objId of family.objectiveIds) {
      const existing = familiesByObjective.get(objId) ?? [];
      existing.push(family);
      familiesByObjective.set(objId, existing);
    }
  }

  const allFamilyIds = new Set<string>();
  for (const family of allFamilies) {
    allFamilyIds.add(family.variantKey);
  }
  const baselines = await fetchTimingBaselines(ctx, allFamilyIds);

  const studentIdSet = new Set(studentIds);
  const submissionsByStudent = new Map<string, ActivitySubmissionDoc[]>();
  const submissionsArrays = await Promise.all(
    studentIds.map((sid) =>
      ctx.db.query("activity_submissions").withIndex("by_user", (q) => q.eq("userId", sid)).collect()
    )
  );
  for (const subs of submissionsArrays) {
    for (const sub of subs) {
      if (studentIdSet.has(sub.userId)) {
        const existing = submissionsByStudent.get(sub.userId) ?? [];
        existing.push(sub);
        submissionsByStudent.set(sub.userId, existing);
      }
    }
  }

  const standardsByObjective = new Map<string, CompetencyStandardDoc>();
  for (const objectiveId of objectiveIdArray) {
    const standard = standardsByCode.get(objectiveId);
    if (standard) {
      standardsByObjective.set(objectiveId, standard);
    }
  }

  const policiesByStandardId = new Map<string, ObjectivePolicyDoc>();
  for (const policy of allPolicies) {
    policiesByStandardId.set(String(policy.standardId), policy);
  }

  return {
    familiesByObjective,
    baselines,
    submissionsByStudent,
    standardsByObjective,
    policiesByStandardId,
  };
}

/**
 * Retrieves a single objective's proficiency for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string; objectiveId?: string }} args - The student ID and optional objective ID
 * @returns {Promise<object>} Objective proficiency result with evidence and retention metrics
 */
export async function getObjectiveProficiencyHandler(
  ctx: QueryCtx,
  args: { studentId: string; objectiveId?: string }
) {
  // 1. Fetch all cards for the student
  const rawCards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .take(500);
  const cards = withCanonicalVariants(rawCards);

  // 2. Filter by objective's problem families if objectiveId provided
  let filteredCards = cards;
  if (args.objectiveId) {
    const families = await ctx.db
      .query("practice_variants")
      .withIndex("by_objectiveId", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex multi-entry array index expects element, not array
        (q as any).eq("objectiveIds", args.objectiveId!)
      )
      .collect();
    const familyIds = new Set(families.map((f) => f.variantKey));
    filteredCards = cards.filter((c) => familyIds.has(c.variantKey));
  }

  // 3. Fetch review logs for the student's cards
  const cardDocIds = new Set(filteredCards.map((c) => c._id));
  const allReviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .collect();
  const relevantReviews = allReviews.filter((r) => cardDocIds.has(r.cardId));

  // 4. Fetch submission timings for review logs (batched)
  const uniqueActivityIds = new Set<string>();
  for (const review of relevantReviews) {
    if (review.submissionId) {
      const lastDash = review.submissionId.lastIndexOf("-");
      if (lastDash > 0) {
        uniqueActivityIds.add(review.submissionId.slice(0, lastDash));
      }
    }
  }

  const activityIdArray = Array.from(uniqueActivityIds);
  const allSubmissions = await Promise.all(
    activityIdArray.map(activityId =>
      ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_activity", (q) =>
          q
            .eq("userId", args.studentId as Id<"profiles">)
            .eq("activityId", activityId as Id<"activities">)
        )
        .collect()
    )
  );

  const submissionTimings = new Map<string, number>();
  allSubmissions.forEach((submissions, i) => {
    const activityId = activityIdArray[i];
    for (const sub of submissions) {
      const submissionData = sub.submissionData as
        | {
            attemptNumber?: number;
            timing?: { activeMs?: number };
          }
        | undefined;
      const attemptNumber = submissionData?.attemptNumber ?? 1;
      const sid = `${activityId}-${attemptNumber}`;
      const activeMs = submissionData?.timing?.activeMs;
      if (activeMs !== undefined) {
        submissionTimings.set(sid, activeMs);
      }
    }
  });

  // 5. Fetch timing baselines for problem families (batched)
  const baselines: TimingBaselines = {};
  const familyIds = new Set(filteredCards.map((c) => c.variantKey));
  const familyIdArray = Array.from(familyIds);
  const allBaselines = await Promise.all(
    familyIdArray.map(pfId =>
      ctx.db
        .query("timing_baselines")
        .withIndex("by_variant", (q) =>
          q.eq("variantKey", pfId)
        )
        .first()
    )
  );
  familyIdArray.forEach((pfId, i) => {
    const baseline = allBaselines[i];
    if (baseline) {
      baselines[pfId] = {
        variantKey: baseline.variantKey,
        sampleCount: baseline.sampleCount,
        medianActiveMs: baseline.medianActiveMs,
        p25ActiveMs: baseline.p25ActiveMs,
        p75ActiveMs: baseline.p75ActiveMs,
        p90ActiveMs: baseline.p90ActiveMs,
        lastComputedAt: baseline.lastComputedAt,
        minSamplesMet: baseline.minSamplesMet,
      };
    }
  });

  // 6. Build card states for aggregation
  const cardStates: ProficiencyCardState[] = [];
  for (const card of filteredCards) {
    const cardReviews = relevantReviews.filter((r) => r.cardId === card._id);
    if (cardReviews.length === 0) {
      cardStates.push({
        stability: card.stability,
        elapsedDays: card.elapsedDays,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        variantKey: card.variantKey,
      });
    } else {
      for (const review of cardReviews) {
        const reviewDurationMs = review.submissionId
          ? submissionTimings.get(review.submissionId)
          : undefined;
        cardStates.push({
          stability: card.stability,
          elapsedDays: card.elapsedDays,
          difficulty: card.difficulty,
          reps: card.reps,
          lapses: card.lapses,
          variantKey: card.variantKey,
          lastReviewMs: review.reviewedAt,
          reviewDurationMs,
        });
      }
    }
  }

  // 7. Determine priority
  let priority: ObjectivePriority = "essential";
  if (args.objectiveId) {
    const standard = await ctx.db
      .query("competency_standards")
      .withIndex("by_code", (q) => q.eq("code", args.objectiveId!))
      .first();
    if (standard) {
      const policy = await ctx.db
        .query("objective_policies")
        .withIndex("by_standardId", (q) => q.eq("standardId", standard._id))
        .first();
      if (policy) {
        priority = validatePriority(policy.policy);
      }
    }
  }

  // 8. Aggregate and compute
  const evidence = aggregateCardsToEvidence(cardStates, baselines);
  return computeObjectiveProficiency({
    objectiveId: args.objectiveId ?? "",
    priority,
    variantEvidences: evidence,
  });
}

/**
 * Retrieves a single objective's proficiency for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string; objectiveId?: string }} args - The student ID and optional objective ID
 * @returns {Promise<object>} Objective proficiency result with evidence and retention metrics
 */
export const getObjectiveProficiency = internalQuery({
  args: {
    studentId: v.string(),
    objectiveId: v.optional(v.string()),
  },
  handler: getObjectiveProficiencyHandler,
});

/**
 * Computes proficiency for a single objective from SRS card data.
 * @param {QueryCtx} ctx - The query context
 * @param {Id<"profiles">} studentId - The student's profile ID
 * @param {string} objectiveId - The objective to compute proficiency for
 * @param {Array<{ _id: Id<"srs_cards">; studentId: Id<"profiles">; objectiveId: string; variantKey: string; stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; dueDate: string; elapsedDays: number; scheduledDays: number; reps: number; lapses: number; lastReview?: string; createdAt: number; updatedAt: number }>} allCards - Pre-fetched SRS cards for the student
 * @param {Array<{ _id: Id<"srs_review_log">; cardId: Id<"srs_cards">; studentId: Id<"profiles">; rating: string; submissionId?: string; reviewId?: string; evidence: unknown; stateBefore: unknown; stateAfter: unknown; reviewedAt: number }>} allReviews - Pre-fetched review logs for the student
 * @param {PreFetchedData | undefined} preFetched - Optional pre-fetched data bundle for batch queries
 * @returns {Promise<object>} Objective proficiency result with evidence and retention metrics
 */
async function computeProficiencyForObjective(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
  objectiveId: string,
  allCards: Array<{
    _id: Id<"srs_cards">;
    studentId: Id<"profiles">;
    objectiveId: string;
    variantKey: string;
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
  }>,
  allReviews: Array<{
    _id: Id<"srs_review_log">;
    cardId: Id<"srs_cards">;
    studentId: Id<"profiles">;
    rating: string;
    submissionId?: string;
    reviewId?: string;
    evidence: unknown;
    stateBefore: unknown;
    stateAfter: unknown;
    reviewedAt: number;
  }>,
  preFetched?: PreFetchedData
) {
  let families: PracticeVariantDoc[];
  let baselines: TimingBaselines;
  let submissionTimings: Map<string, number>;
  let priority: ObjectivePriority;

  if (preFetched) {
    families = preFetched.familiesByObjective.get(objectiveId) ?? [];
    const familyIds = new Set(families.map((f) => f.variantKey));
    const filteredCards = allCards.filter((c) => familyIds.has(c.variantKey));
    const cardDocIds = new Set(filteredCards.map((c) => c._id));
    const relevantReviews = allReviews.filter((r) => cardDocIds.has(r.cardId));

    baselines = preFetched.baselines;
    submissionTimings = deriveSubmissionTimingsFromPreFetched(studentId, relevantReviews, preFetched);

    let p: ObjectivePriority = "essential";
    const standard = preFetched.standardsByObjective.get(objectiveId);
    if (standard) {
      const policy = preFetched.policiesByStandardId.get(String(standard._id));
      if (policy) {
        p = validatePriority(policy.policy);
      }
    }
    priority = p;

    const cardStates: ProficiencyCardState[] = [];
    for (const card of filteredCards) {
      const cardReviews = relevantReviews.filter((r) => r.cardId === card._id);
      if (cardReviews.length === 0) {
        cardStates.push({
          stability: card.stability,
          elapsedDays: card.elapsedDays,
          difficulty: card.difficulty,
          reps: card.reps,
          lapses: card.lapses,
          variantKey: card.variantKey,
        });
      } else {
        for (const review of cardReviews) {
          const reviewDurationMs = review.submissionId
            ? submissionTimings.get(review.submissionId)
            : undefined;
          cardStates.push({
            stability: card.stability,
            elapsedDays: card.elapsedDays,
            difficulty: card.difficulty,
            reps: card.reps,
            lapses: card.lapses,
            variantKey: card.variantKey,
            lastReviewMs: review.reviewedAt,
            reviewDurationMs,
          });
        }
      }
    }

    const evidence = aggregateCardsToEvidence(cardStates, baselines);
    return computeObjectiveProficiency({
      objectiveId,
      priority,
      variantEvidences: evidence,
    });
  }

  families = await ctx.db
    .query("practice_variants")
      .withIndex("by_objectiveId", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex multi-entry array index expects element, not array
        (q as any).eq("objectiveIds", objectiveId)
      )
    .collect();
  const familyIds = new Set(families.map((f) => f.variantKey));
  const filteredCards = allCards.filter((c) => familyIds.has(c.variantKey));

  const cardDocIds = new Set(filteredCards.map((c) => c._id));
  const relevantReviews = allReviews.filter((r) => cardDocIds.has(r.cardId));

  submissionTimings = await fetchSubmissionTimings(ctx, studentId, relevantReviews);
  baselines = await fetchTimingBaselines(ctx, familyIds);

  const cardStates: ProficiencyCardState[] = [];
  for (const card of filteredCards) {
    const cardReviews = relevantReviews.filter((r) => r.cardId === card._id);
    if (cardReviews.length === 0) {
      cardStates.push({
        stability: card.stability,
        elapsedDays: card.elapsedDays,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        variantKey: card.variantKey,
      });
    } else {
      for (const review of cardReviews) {
        const reviewDurationMs = review.submissionId
          ? submissionTimings.get(review.submissionId)
          : undefined;
        cardStates.push({
          stability: card.stability,
          elapsedDays: card.elapsedDays,
          difficulty: card.difficulty,
          reps: card.reps,
          lapses: card.lapses,
          variantKey: card.variantKey,
          lastReviewMs: review.reviewedAt,
          reviewDurationMs,
        });
      }
    }
  }

  priority = "essential";
  const standard = await ctx.db
    .query("competency_standards")
    .withIndex("by_code", (q) => q.eq("code", objectiveId))
    .first();
  if (standard) {
    const policy = await ctx.db
      .query("objective_policies")
      .withIndex("by_standardId", (q) => q.eq("standardId", standard._id))
      .first();
    if (policy) {
      priority = validatePriority(policy.policy);
    }
  }

  const evidence = aggregateCardsToEvidence(cardStates, baselines);
  return computeObjectiveProficiency({
    objectiveId,
    priority,
    variantEvidences: evidence,
  });
}

/**
 * Retrieves the set of objective IDs a student has SRS cards for.
 * @param {QueryCtx} ctx - The query context
 * @param {Id<"profiles">} studentId - The student's profile ID
 * @returns {Promise<string[]>} Array of objective ID strings
 */
async function getStudentObjectiveIds(
  ctx: QueryCtx,
  studentId: Id<"profiles">
): Promise<string[]> {
  const rawCards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .take(500);
  const cards = withCanonicalVariants(rawCards);

  const objectiveIds = new Set<string>();
  for (const card of cards) {
    if (card.objectiveId) {
      objectiveIds.add(card.objectiveId);
    }
  }
  return Array.from(objectiveIds);
}

/**
 * Retrieves proficiency summary across all objectives for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string }} args - The student ID
 * @returns {Promise<StudentProficiencyView[]>} Array of student proficiency views
 */
export async function getStudentProficiencySummaryHandler(
  ctx: QueryCtx,
  args: { studentId: string }
): Promise<StudentProficiencyView[]> {
  const sid = args.studentId as Id<"profiles">;

  const rawCards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) => q.eq("studentId", sid))
    .take(500);
  const cards = withCanonicalVariants(rawCards);

  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) => q.eq("studentId", sid))
    .collect();

  const objectiveIds = await getStudentObjectiveIds(ctx, sid);

  const views: StudentProficiencyView[] = [];
  const results = await Promise.all(
    objectiveIds.map(objectiveId =>
      computeProficiencyForObjective(ctx, sid, objectiveId, cards, reviews)
    )
  );
  for (const result of results) {
    views.push(buildStudentProficiencyView(result));
  }

  return views;
}

/**
 * Retrieves proficiency summary across all objectives for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string }} args - The student ID
 * @returns {Promise<StudentProficiencyView[]>} Array of student proficiency views
 */
export const getStudentProficiencySummary = internalQuery({
  args: { studentId: v.string() },
  handler: getStudentProficiencySummaryHandler,
});

/**
 * Retrieves teacher-facing proficiency data for all students in a class.
 * @param {QueryCtx} ctx - The query context
 * @param {{ classId: string }} args - The class ID
 * @returns {Promise<TeacherProficiencyView[]>} Array of teacher proficiency views with per-objective aggregates
 */
export async function getTeacherClassProficiencyHandler(
  ctx: QueryCtx,
  args: { classId: string }
): Promise<TeacherProficiencyView[]> {
  const classDocId = args.classId as Id<"classes">;

  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === "active");
  const studentIds = activeStudents.map((e) => e.studentId);

  if (studentIds.length === 0) {
    return [];
  }

  type SrsCard = {
    _id: Id<"srs_cards">;
    studentId: Id<"profiles">;
    objectiveId: string;
    variantKey: string;
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
  };

  type SrsReview = {
    _id: Id<"srs_review_log">;
    cardId: Id<"srs_cards">;
    studentId: Id<"profiles">;
    rating: string;
    submissionId?: string;
    reviewId?: string;
    evidence: unknown;
    stateBefore: unknown;
    stateAfter: unknown;
    reviewedAt: number;
  };

  const allStudentCards = new Map<string, SrsCard[]>();
  const allStudentReviews = new Map<string, SrsReview[]>();

  const [allCardsArrays, allReviewsArrays] = await Promise.all([
    Promise.all(
      studentIds.map((sid) =>
        ctx.db.query("srs_cards").withIndex("by_student", (q) => q.eq("studentId", sid)).take(500)
      )
    ),
    Promise.all(
      studentIds.map((sid) =>
        ctx.db.query("srs_review_log").withIndex("by_student", (q) => q.eq("studentId", sid)).collect()
      )
    ),
  ]);
  for (const rawCards of allCardsArrays) {
    const cards = withCanonicalVariants(rawCards);
    for (const card of cards) {
      const existing = allStudentCards.get(card.studentId) ?? [];
      existing.push(card);
      allStudentCards.set(card.studentId, existing);
    }
  }
  for (const reviews of allReviewsArrays) {
    for (const review of reviews) {
      const existing = allStudentReviews.get(review.studentId) ?? [];
      existing.push(review);
      allStudentReviews.set(review.studentId, existing);
    }
  }

  const allObjectiveIds = new Set<string>();
  for (const cards of allStudentCards.values()) {
    for (const card of cards) {
      if (card.objectiveId) {
        allObjectiveIds.add(card.objectiveId);
      }
    }
  }

  const preFetched = await preFetchTeacherClassData(ctx, studentIds, allStudentCards);

  const teacherViews: TeacherProficiencyView[] = [];

  for (const objectiveId of allObjectiveIds) {
    const studentProficiencies: Array<{
      studentId: string;
      result: ReturnType<typeof computeObjectiveProficiency>;
    }> = [];

    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        const cards = allStudentCards.get(studentId) ?? [];
        const reviews = allStudentReviews.get(studentId) ?? [];
        const result = await computeProficiencyForObjective(
          ctx,
          studentId,
          objectiveId,
          cards,
          reviews,
          preFetched
        );
        return { studentId, result };
      })
    );
    studentProficiencies.push(...results);

    const proficientCount = studentProficiencies.filter((sp) => sp.result.isProficient).length;
    const avgRetention =
      studentProficiencies.length > 0
        ? studentProficiencies.reduce((sum, sp) => sum + sp.result.retentionStrength, 0) /
          studentProficiencies.length
        : 0;

    const strugglingStudents = studentProficiencies
      .filter((sp) => !sp.result.isProficient && sp.result.evidenceConfidence !== 'none')
      .map((sp) => sp.studentId);

    const firstStudentResult = studentProficiencies[0]?.result;
    if (!firstStudentResult) continue;

    let standardCode = objectiveId;
    let standardDescription = "";
    const standardInfo = preFetched.standardsByObjective.get(objectiveId);
    if (standardInfo) {
      standardCode = standardInfo.code;
      standardDescription = standardInfo.description;
    }

    const teacherResult = buildTeacherProficiencyView(
      firstStudentResult,
      standardCode,
      standardDescription,
      proficientCount,
      avgRetention,
      strugglingStudents
    );

    teacherViews.push(teacherResult);
  }

  return teacherViews;
}

/**
 * Retrieves teacher-facing proficiency data for all students in a class.
 * @param {QueryCtx} ctx - The query context
 * @param {{ classId: string }} args - The class ID
 * @returns {Promise<TeacherProficiencyView[]>} Array of teacher proficiency views with per-objective aggregates
 */
export const getTeacherClassProficiency = internalQuery({
  args: { classId: v.string() },
  handler: getTeacherClassProficiencyHandler,
});
