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
 *    - retentionStrength: average stabilityToRetention (sigmoid normalized)
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
import { aggregateCardsToEvidence } from "../lib/practice/srs-proficiency";
import {
  computeObjectiveProficiency,
  buildStudentProficiencyView,
  buildTeacherProficiencyView,
  type ObjectivePriority,
  type StudentProficiencyView,
  type TeacherProficiencyView,
} from "../lib/practice/objective-proficiency";

const VALID_PRIORITIES = new Set<string>(['essential', 'supporting', 'extension', 'triaged']);

function validatePriority(value: string): ObjectivePriority {
  return VALID_PRIORITIES.has(value) ? (value as ObjectivePriority) : 'essential';
}

import type {
  SrsCardState as ProficiencyCardState,
  TimingBaselines,
} from "../lib/practice/srs-proficiency";

async function fetchTimingBaselines(
  ctx: QueryCtx,
  familyIds: Set<string>
): Promise<TimingBaselines> {
  const baselines: TimingBaselines = {};
  for (const pfId of familyIds) {
    const baseline = await ctx.db
      .query("timing_baselines")
      .withIndex("by_problem_family", (q) =>
        q.eq("problemFamilyId", pfId)
      )
      .first();
    if (baseline) {
      baselines[pfId] = {
        problemFamilyId: baseline.problemFamilyId,
        sampleCount: baseline.sampleCount,
        medianActiveMs: baseline.medianActiveMs,
        p25ActiveMs: baseline.p25ActiveMs,
        p75ActiveMs: baseline.p75ActiveMs,
        p90ActiveMs: baseline.p90ActiveMs,
        lastComputedAt: baseline.lastComputedAt,
        minSamplesMet: baseline.minSamplesMet,
      };
    }
  }
  return baselines;
}

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

  const submissionTimings = new Map<string, number>();
  for (const activityId of uniqueActivityIds) {
    const submissions = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity", (q) =>
        q
          .eq("userId", studentId)
          .eq("activityId", activityId as Id<"activities">)
      )
      .collect();
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
  }
  return submissionTimings;
}

export async function getObjectiveProficiencyHandler(
  ctx: QueryCtx,
  args: { studentId: string; objectiveId?: string }
) {
  // 1. Fetch all cards for the student
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .collect();

  // 2. Filter by objective's problem families if objectiveId provided
  let filteredCards = cards;
  if (args.objectiveId) {
    const families = await ctx.db
      .query("problem_families")
      .withIndex("by_objectiveId", (q) =>
        q.eq("objectiveIds", args.objectiveId! as unknown as string[])
      )
      .collect();
    const familyIds = new Set(families.map((f) => f.problemFamilyId));
    filteredCards = cards.filter((c) => familyIds.has(c.problemFamilyId));
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

  // 4. Fetch submission timings for review logs
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
    const submissions = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity", (q) =>
        q
          .eq("userId", args.studentId as Id<"profiles">)
          .eq("activityId", activityId as Id<"activities">)
      )
      .collect();
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
  }

  // 5. Fetch timing baselines for problem families
  const baselines: TimingBaselines = {};
  const familyIds = new Set(filteredCards.map((c) => c.problemFamilyId));
  for (const pfId of familyIds) {
    const baseline = await ctx.db
      .query("timing_baselines")
      .withIndex("by_problem_family", (q) =>
        q.eq("problemFamilyId", pfId)
      )
      .first();
    if (baseline) {
      baselines[pfId] = {
        problemFamilyId: baseline.problemFamilyId,
        sampleCount: baseline.sampleCount,
        medianActiveMs: baseline.medianActiveMs,
        p25ActiveMs: baseline.p25ActiveMs,
        p75ActiveMs: baseline.p75ActiveMs,
        p90ActiveMs: baseline.p90ActiveMs,
        lastComputedAt: baseline.lastComputedAt,
        minSamplesMet: baseline.minSamplesMet,
      };
    }
  }

  // 6. Build card states for aggregation
  const cardStates: ProficiencyCardState[] = [];
  for (const card of filteredCards) {
    const cardReviews = relevantReviews.filter((r) => r.cardId === card._id);
    if (cardReviews.length === 0) {
      cardStates.push({
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        problemFamilyId: card.problemFamilyId,
      });
    } else {
      for (const review of cardReviews) {
        const reviewDurationMs = review.submissionId
          ? submissionTimings.get(review.submissionId)
          : undefined;
        cardStates.push({
          stability: card.stability,
          difficulty: card.difficulty,
          reps: card.reps,
          lapses: card.lapses,
          problemFamilyId: card.problemFamilyId,
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
    problemFamilyEvidences: evidence,
  });
}

export const getObjectiveProficiency = internalQuery({
  args: {
    studentId: v.string(),
    objectiveId: v.optional(v.string()),
  },
  handler: getObjectiveProficiencyHandler,
});

async function computeProficiencyForObjective(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
  objectiveId: string,
  allCards: Array<{
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
  }>
) {
  const families = await ctx.db
    .query("problem_families")
    .withIndex("by_objectiveId", (q) =>
      q.eq("objectiveIds", objectiveId as unknown as string[])
    )
    .collect();
  const familyIds = new Set(families.map((f) => f.problemFamilyId));
  const filteredCards = allCards.filter((c) => familyIds.has(c.problemFamilyId));

  const cardDocIds = new Set(filteredCards.map((c) => c._id));
  const relevantReviews = allReviews.filter((r) => cardDocIds.has(r.cardId));

  const submissionTimings = await fetchSubmissionTimings(ctx, studentId, relevantReviews);
  const baselines = await fetchTimingBaselines(ctx, familyIds);

  const cardStates: ProficiencyCardState[] = [];
  for (const card of filteredCards) {
    const cardReviews = relevantReviews.filter((r) => r.cardId === card._id);
    if (cardReviews.length === 0) {
      cardStates.push({
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        problemFamilyId: card.problemFamilyId,
      });
    } else {
      for (const review of cardReviews) {
        const reviewDurationMs = review.submissionId
          ? submissionTimings.get(review.submissionId)
          : undefined;
        cardStates.push({
          stability: card.stability,
          difficulty: card.difficulty,
          reps: card.reps,
          lapses: card.lapses,
          problemFamilyId: card.problemFamilyId,
          lastReviewMs: review.reviewedAt,
          reviewDurationMs,
        });
      }
    }
  }

  let priority: ObjectivePriority = "essential";
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
    problemFamilyEvidences: evidence,
  });
}

async function getStudentObjectiveIds(
  ctx: QueryCtx,
  studentId: Id<"profiles">
): Promise<string[]> {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect();

  const objectiveIds = new Set<string>();
  for (const card of cards) {
    if (card.objectiveId) {
      objectiveIds.add(card.objectiveId);
    }
  }
  return Array.from(objectiveIds);
}

export async function getStudentProficiencySummaryHandler(
  ctx: QueryCtx,
  args: { studentId: string }
): Promise<StudentProficiencyView[]> {
  const sid = args.studentId as Id<"profiles">;

  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) => q.eq("studentId", sid))
    .collect();

  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) => q.eq("studentId", sid))
    .collect();

  const objectiveIds = await getStudentObjectiveIds(ctx, sid);

  const views: StudentProficiencyView[] = [];
  for (const objectiveId of objectiveIds) {
    const result = await computeProficiencyForObjective(
      ctx,
      sid,
      objectiveId,
      cards,
      reviews
    );
    views.push(buildStudentProficiencyView(result));
  }

  return views;
}

export const getStudentProficiencySummary = internalQuery({
  args: { studentId: v.string() },
  handler: getStudentProficiencySummaryHandler,
});

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

  for (const studentId of studentIds) {
    const cards = await ctx.db
      .query("srs_cards")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    allStudentCards.set(studentId, cards);

    const reviews = await ctx.db
      .query("srs_review_log")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    allStudentReviews.set(studentId, reviews);
  }

  const allObjectiveIds = new Set<string>();
  for (const cards of allStudentCards.values()) {
    for (const card of cards) {
      if (card.objectiveId) {
        allObjectiveIds.add(card.objectiveId);
      }
    }
  }

  const teacherViews: TeacherProficiencyView[] = [];

  for (const objectiveId of allObjectiveIds) {
    const studentProficiencies: Array<{
      studentId: string;
      result: ReturnType<typeof computeObjectiveProficiency>;
    }> = [];

    for (const studentId of studentIds) {
      const cards = allStudentCards.get(studentId) ?? [];
      const reviews = allStudentReviews.get(studentId) ?? [];

      const result = await computeProficiencyForObjective(
        ctx,
        studentId,
        objectiveId,
        cards,
        reviews
      );
      studentProficiencies.push({ studentId, result });
    }

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
    const standard = await ctx.db
      .query("competency_standards")
      .withIndex("by_code", (q) => q.eq("code", objectiveId))
      .first();
    if (standard) {
      standardCode = standard.code;
      standardDescription = standard.description;
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

export const getTeacherClassProficiency = internalQuery({
  args: { classId: v.string() },
  handler: getTeacherClassProficiencyHandler,
});
