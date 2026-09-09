import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { convexToJson } from "convex/values";
import { internal } from "./_generated/api";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";
import type { Doc, Id } from "./_generated/dataModel";
import { practiceSubmissionEnvelopeSchema, type PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { checkServerOwnedQuadraticDiscriminant, gradeServerOwnedSubmission, IM3_QF_DRAFT_MAPPINGS, IM3_QF_NODE, IM3_QF_VARIANT_SCHEDULES, quadraticFormulaPublicProps, quadraticFormulaVariantKey } from "../lib/activities/server-grading";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import { IM3_GUIDED_PRACTICE_ACTIVITY_ID, IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from "../lib/practice/learning-evidence-pilot";
import { resolveLatestPublishedLessonVersion } from "../lib/progress/published-curriculum";
import { canonicalLesson16QuizRequest, gradeLesson16Quiz, isExactLesson16QuizProps, isLesson16QuizRequest, LESSON_1_6_QUIZ_PHASE, LESSON_1_6_QUIZ_SEQUENCE, LESSON_1_6_QUIZ_SLUG, validLesson16QuizRow } from "./lib/lesson_1_6_quiz";

/**
 * Internal query that returns the in-progress spreadsheet draft for a
 * (student, activity) pair. Returns `{ draftData: null, updatedAt: null }`
 * when no response row exists or the draft field is empty.
 * @returns {Promise<{ draftData: unknown; updatedAt: number | null } | { draftData: null; updatedAt: null }>} Draft payload, or the null sentinel
 */
export const getSpreadsheetDraft = internalQuery({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (!response?.draftData) {
      return { draftData: null, updatedAt: null };
    }

    return {
      draftData: response.draftData,
      updatedAt: response.updatedAt,
    };
  },
});

/**
 * Internal mutation that upserts an in-progress spreadsheet draft for a
 * (student, activity) pair. Patches an existing response row in place,
 * otherwise inserts a new row with `isCompleted: false` and `attempts: 0`.
 * @returns {Promise<{ success: true; updatedAt: number }>} Confirmation + the timestamp of the save
 */
export const saveSpreadsheetDraft = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    draftData: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        draftData: args.draftData,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_spreadsheet_responses", {
        studentId: args.userId,
        activityId: args.activityId,
        spreadsheetData: args.draftData,
        draftData: args.draftData,
        isCompleted: false,
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, updatedAt: now };
  },
});

/**
 * Internal query that returns the full spreadsheet response (data, draft,
 * completion, attempts, validation) for a (student, activity) pair.
 * @returns {Promise<{ studentId: Id<"profiles">; spreadsheetData: unknown; draftData: unknown; isCompleted: boolean; attempts: number; lastValidationResult: unknown; submittedAt: number | null; updatedAt: number } | null>} Full response payload, or null when missing
 */
export const getSpreadsheetResponse = internalQuery({
  args: {
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId)
      )
      .unique();

    if (!response) {
      return null;
    }

    return {
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: response.attempts,
      lastValidationResult: response.lastValidationResult,
      submittedAt: response.submittedAt,
      updatedAt: response.updatedAt,
    };
  },
});

/**
 * Internal query that returns the validation-relevant subset of an
 * activity (`componentKey`, `props`, `standardId`) for the practice
 * runtime to render the spreadsheet/practice UI.
 * @returns {Promise<{ componentKey: string; props: unknown; standardId: Id<"competency_standards"> | undefined } | null>} Activity fragment for the practice runtime, or null
 */
export const getActivityForValidation = internalQuery({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);

    if (!activity) {
      return null;
    }

    return {
      componentKey: activity.componentKey,
      props: activity.props,
      standardId: activity.standardId,
    };
  },
});

/**
 * Internal mutation that records a spreadsheet submission. Patches the
 * existing response (incrementing `attempts` and updating `submittedAt`
 * only when `isCompleted: true`) or inserts a new row. Does NOT update
 * competency — that's `submitActivity`'s job.
 * @returns {Promise<{ success: true }>} Confirmation
 */
export const submitSpreadsheet = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    spreadsheetData: v.any(),
    isCompleted: v.boolean(),
    validationResult: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
        attempts: existingResponse.attempts + 1,
        lastValidationResult: args.validationResult,
        submittedAt: args.isCompleted ? now : existingResponse.submittedAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_spreadsheet_responses", {
        studentId: args.userId,
        activityId: args.activityId,
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
        attempts: 1,
        lastValidationResult: args.validationResult,
        submittedAt: args.isCompleted ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Internal mutation that bumps a student's mastery for a competency
 * standard by `masteryIncrement` (clamped to 100). Patches the existing
 * `student_competency` row, or inserts a new one starting at the supplied
 * increment.
 * @returns {Promise<{ newLevel: number }>} The new mastery level (0..100)
 */
export const updateCompetency = internalMutation({
  args: {
    studentId: v.id("profiles"),
    standardId: v.id("competency_standards"),
    activityId: v.id("activities"),
    masteryIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingCompetency = await ctx.db
      .query("student_competency")
      .withIndex("by_student_and_standard", (q) =>
        q.eq("studentId", args.studentId).eq("standardId", args.standardId)
      )
      .unique();

    if (existingCompetency) {
      const newLevel = Math.min(existingCompetency.masteryLevel + args.masteryIncrement, 100);
      await ctx.db.patch(existingCompetency._id, {
        masteryLevel: newLevel,
        evidenceActivityId: args.activityId,
        lastUpdated: now,
        updatedBy: args.studentId,
      });
      return { newLevel };
    } else {
      await ctx.db.insert("student_competency", {
        studentId: args.studentId,
        standardId: args.standardId,
        masteryLevel: args.masteryIncrement,
        evidenceActivityId: args.activityId,
        lastUpdated: now,
        createdAt: now,
        updatedBy: args.studentId,
      });
      return { newLevel: args.masteryIncrement };
    }
  },
});

/**
 * Internal query that returns the minimal profile projection used by
 * teacher-facing session keys (`id`, `role`, `organizationId`).
 * @returns {Promise<{ id: Id<"profiles">; role: 'student'|'teacher'|'admin'|'parent'; organizationId: Id<"organizations"> } | null>} Minimal profile payload, or null
 */
export const getProfileByUserId = internalQuery({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  },
});

/**
 * Internal query that returns the full profile projection (`id`, `role`,
 * `organizationId`, `username`, `displayName`) keyed by username.
 * @returns {Promise<{ id: Id<"profiles">; role: 'student'|'teacher'|'admin'|'parent'; organizationId: Id<"organizations">; username: string; displayName: string | undefined } | null>} Full profile payload, or null
 */
export const getProfileByUsername = internalQuery({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});

/**
 * Internal query that returns the full profile projection (`id`, `role`,
 * `organizationId`, `username`, `displayName`) keyed by profile ID.
 * @returns {Promise<{ id: Id<"profiles">; role: 'student'|'teacher'|'admin'|'parent'; organizationId: Id<"organizations">; username: string; displayName: string | undefined } | null>} Full profile payload, or null
 */
export const getProfileById = internalQuery({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});

/**
 * Internal query that returns the full activity document for the practice
 * runtime to render (`componentKey`, `props`, `gradingConfig`, etc.).
 * @returns {Promise<{ id: Id<"activities">; componentKey: string; displayName: string; description: string | undefined; props: unknown; gradingConfig: unknown; standardId: Id<"competency_standards"> | undefined; createdAt: number; updatedAt: number } | null>} Activity payload, or null
 */
export const getActivityById = internalQuery({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) return null;

    return {
      id: activity._id,
      componentKey: activity.componentKey,
      displayName: activity.displayName,
      description: activity.description,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
      standardId: activity.standardId,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  },
});

async function hasQuadraticFormulaVariantLink(ctx: MutationCtx, activityId: Id<"activities">): Promise<boolean> {
  for await (const item of ctx.db.query("practice_items").withIndex("by_activityId", q => q.eq("activityId", activityId))) {
    const variants = await ctx.db.query("practice_variants").withIndex("by_variantKey", q => q.eq("variantKey", item.variantKey)).take(2);
    if (variants.length !== 1 || variants[0].componentKey === "quadratic-formula") return true;
  }
  return false;
}

/**
 * Internal mutation that records a graded assessment submission (no
 * competency or SRS side effects — see `submitActivity` for that path).
 * @returns {Promise<{ id: Id<"activity_submissions"> }>} The new submission row ID
 */
export const submitAssessment = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    const hasQfLink = activity ? await hasQuadraticFormulaVariantLink(ctx, activity._id) : false;
    if (activity && (activity.stableActivityId === IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId
      || activity.stableActivityId === IM3_QF_DRAFT_MAPPINGS.independent_practice.stableActivityId
      || (activity.masteryNodeId === IM3_QF_NODE && activity.componentKey === "quadratic-formula")
      || hasQfLink)) {
      throw new Error("Draft quadratic-formula submissions must use the server-owned create path");
    }
    const now = Date.now();

    const id = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData: args.submissionData,
      score: args.score,
      maxScore: args.maxScore,
      feedback: args.feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Internal mutation that records a practice submission, writes the
 * derived competency delta (when the activity has a `standardId`),
 * and schedules SRS processing. SRS scheduling failures are logged
 * but do not abort the submission.
 * @returns {Promise<{ id: Id<"activity_submissions">; score: number; maxScore: number }>} Submission row ID + aggregate score/maxScore from the part breakdown
 * @throws Error if the target activity ID does not resolve to an `activities` row
 */
export const submitActivity = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }
    const hasQfLink = await hasQuadraticFormulaVariantLink(ctx, activity._id);
    if (activity.stableActivityId === IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId
      || activity.stableActivityId === IM3_QF_DRAFT_MAPPINGS.independent_practice.stableActivityId
      || (activity.masteryNodeId === IM3_QF_NODE && activity.componentKey === "quadratic-formula")
      || hasQfLink) {
      throw new Error("Draft quadratic-formula submissions must use the server-owned create path");
    }

    const submissionScore = args.submissionData.parts.reduce((sum, part) => sum + (part.score ?? 0), 0);
    const maxScore = args.submissionData.parts.reduce((sum, part) => sum + (part.maxScore ?? 0), 0);

    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData: args.submissionData,
      score: submissionScore,
      maxScore,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    if (activity.standardId) {
      const existingCompetency = await ctx.db
        .query("student_competency")
        .withIndex("by_student_and_standard", (q) =>
          q.eq("studentId", args.userId).eq("standardId", activity.standardId!)
        )
        .unique();

      if (existingCompetency) {
        const percentage = maxScore > 0 ? (submissionScore / maxScore) * 100 : 0;
        const masteryIncrement = Math.round(percentage);

        const newLevel = Math.min(existingCompetency.masteryLevel + masteryIncrement, 100);
        await ctx.db.patch(existingCompetency._id, {
          masteryLevel: newLevel,
          evidenceActivityId: args.activityId,
          lastUpdated: now,
          updatedBy: args.userId,
        });
      } else {
        await ctx.db.insert("student_competency", {
          studentId: args.userId,
          standardId: activity.standardId,
          masteryLevel: 50,
          evidenceActivityId: args.activityId,
          lastUpdated: now,
          createdAt: now,
          updatedBy: args.userId,
        });
      }
    }

    try {
      await ctx.scheduler.runAfter(0, internal.srs.submissionSrs.processSubmissionSrs, {
        studentId: args.userId,
        activityId: args.activityId,
        submission: args.submissionData,
      });
    } catch (err) {
      console.error("Failed to schedule SRS processing:", err);
    }

    return { id: submissionId, score: submissionScore, maxScore };
  },
});

type Im3PilotPublication = {
  nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string }>;
  blueprints: ReadonlyArray<{ nodeId: string; reviewStatus?: string }>;
};
const currentIm3PilotPublication: Im3PilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};
export function isIm3GraphPilotPublished(
  publication: Im3PilotPublication = currentIm3PilotPublication,
): boolean {
  const node = publication.nodes.find((row) => row.id === IM3_PILOT_NODE);
  const blueprint = publication.blueprints.find(
    (row) => row.nodeId === IM3_PILOT_NODE,
  );
  return (
    node?.kind === "skill" &&
    node.reviewStatus === "approved" &&
    blueprint?.reviewStatus === "approved"
  );
}
type ServerOwnedSubmissionArgs = {
  userId: Id<"profiles">;
  activityId: Id<"activities">;
  submissionData: ReturnType<typeof practiceSubmissionEnvelopeSchema.parse>;
  idempotencyKey: string;
  pendingSubmissionId?: Id<"activity_submissions">;
};

export async function loadLesson16QuizAuthority(ctx: QueryCtx, activityId: Id<"activities">) {
  const lesson = await ctx.db.query("lessons").withIndex("by_slug", q => q.eq("slug", LESSON_1_6_QUIZ_SLUG)).unique();
  if (!lesson) return null;
  const versions = await ctx.db.query("lesson_versions").withIndex("by_lesson", q => q.eq("lessonId", lesson._id)).collect();
  const selected = resolveLatestPublishedLessonVersion(versions);
  if (!selected) return null;
  const phase = await ctx.db.query("phase_versions").withIndex("by_lesson_version_and_phase", q => q.eq("lessonVersionId", selected._id).eq("phaseNumber", LESSON_1_6_QUIZ_PHASE)).unique();
  if (!phase) return null;
  const sections = await ctx.db.query("phase_sections").withIndex("by_phase_version", q => q.eq("phaseVersionId", phase._id)).collect();
  const sequenceSections = sections.filter(section => section.sequenceOrder === LESSON_1_6_QUIZ_SEQUENCE && section.sectionType === "activity");
  const matches = sequenceSections.filter(section => (section.content as { activityId?: unknown; componentKey?: unknown }).activityId === activityId && (section.content as { componentKey?: unknown }).componentKey === "comprehension-quiz");
  const activity = await ctx.db.get(activityId);
  const grading = activity?.gradingConfig as Record<string, unknown> | undefined;
  if (sequenceSections.length !== 1 || matches.length !== 1 || !activity || activity.componentKey !== "comprehension-quiz" || !isExactLesson16QuizProps(activity.props) || Object.keys(grading ?? {}).sort().join("|") !== "autoGrade|partialCredit" || grading?.autoGrade !== true || grading.partialCredit !== true || activity.stableActivityId !== undefined || activity.masteryNodeId !== undefined || activity.learningEvidenceMode !== undefined || activity.approval !== undefined || activity.srsEligible !== undefined) return null;
  return activity;
}
function canonicalPayload(value: PracticeSubmissionEnvelope): string {
  const parts = [...value.parts].sort((a, b) => a.partId.localeCompare(b.partId)).map(({ partId, rawAnswer, hintsUsed, revealStepsSeen, changedCount, firstInteractionAt, answeredAt, wallClockMs, activeMs }) => ({ partId, rawAnswer, hintsUsed, revealStepsSeen, changedCount, firstInteractionAt, answeredAt, wallClockMs, activeMs }));
  return JSON.stringify({ contractVersion: value.contractVersion, activityId: value.activityId, mode: value.mode, answers: value.answers, parts });
}
function canonicalWorkedPayload(value: PracticeSubmissionEnvelope): string {
  return JSON.stringify({
    contractVersion: value.contractVersion,
    activityId: value.activityId,
    mode: value.mode,
    status: value.status,
    submittedAt: value.submittedAt,
    answers: value.answers,
    parts: value.parts,
  });
}
function canonicalQfPayload(value: PracticeSubmissionEnvelope): string {
  const parts = [...value.parts]
    .sort((left, right) => left.partId.localeCompare(right.partId))
    .map(({ isCorrect: _isCorrect, score: _score, maxScore: _maxScore, ...part }) => part);
  return JSON.stringify(convexToJson({
    ...value,
    status: "submitted",
    parts,
  } as never));
}

function validateQfEnvelope(value: PracticeSubmissionEnvelope): void {
  const ids = ["discriminant", "x1", "x2"];
  if (value.status !== "submitted" || !["guided_practice", "independent_practice"].includes(value.mode)
    || Object.keys(value.answers).sort().join("|") !== ids.slice().sort().join("|")
    || value.parts.length !== 3 || new Set(value.parts.map((part) => part.partId)).size !== 3
    || value.parts.some((part) => !ids.includes(part.partId) || part.isCorrect !== undefined || part.score !== undefined || part.maxScore !== undefined
      || JSON.stringify(part.rawAnswer) !== JSON.stringify(value.answers[part.partId]))) {
    throw new Error("Invalid quadratic-formula response envelope");
  }
}

function validateSelectedEnvelope(value: PracticeSubmissionEnvelope): void {
  if (
    value.status !== "submitted" ||
    !["guided_practice", "independent_practice"].includes(value.mode)
  )
    throw new Error("Invalid selected IM3 submission mode");
  if (
    Object.keys(value.answers).sort().join("|") !==
      "placed_points|table_values" ||
    value.parts.length !== 2 ||
    new Set(value.parts.map((p) => p.partId)).size !== 2 ||
    value.parts
      .map((p) => p.partId)
      .sort()
      .join("|") !== "placed_points|table_values"
  )
    throw new Error("Invalid selected IM3 answer parts");
  for (const key of ["table_values", "placed_points"] as const) {
    const answer = value.answers[key];
    const part = value.parts.find((p) => p.partId === key);
    if (
      !Array.isArray(answer) ||
      answer.length !== 5 ||
      answer.some(
        (point) =>
          typeof point !== "object" ||
          point === null ||
          Array.isArray(point) ||
          Object.keys(point).sort().join("|") !== "x|y" ||
          !Number.isFinite((point as { x: number }).x) ||
          !Number.isFinite((point as { y: number }).y),
      ) ||
      JSON.stringify(answer) !== JSON.stringify(part?.rawAnswer)
    )
      throw new Error("Invalid selected IM3 point response");
  }
}

function isSelectedWorkedAcknowledgement(value: PracticeSubmissionEnvelope): boolean {
  const keys = Object.keys(value);
  return keys.length === 8
    && keys.every((key) => ["contractVersion", "activityId", "mode", "status", "attemptNumber", "submittedAt", "answers", "parts"].includes(key))
    && value.mode === "worked_example"
    && value.status === "submitted"
    && Number.isInteger(value.attemptNumber)
    && value.attemptNumber > 0
    && !Number.isNaN(Date.parse(value.submittedAt))
    && new Date(value.submittedAt).toISOString() === value.submittedAt
    && Object.keys(value.answers).length === 0
    && value.parts.length === 0;
}

export function isSelectedWorkedActivity(activity: Doc<"activities">): boolean {
  const props = activity.props as Record<string, unknown>;
  const grading = activity.gradingConfig as Record<string, unknown> | undefined;
  return activity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
    && activity.masteryNodeId === IM3_PILOT_NODE
    && activity.componentKey === "graphing-explorer"
    && activity.learningEvidenceMode === "worked_example"
    && activity.srsEligible === false
    && activity.approval?.status === "approved"
    && Object.keys(props).sort().join("|") === "equation|variant"
    && props.variant === "plot_from_equation"
    && props.equation === "f(x) = x^2"
    && Object.keys(grading ?? {}).sort().join("|") === "autoGrade|partialCredit"
    && grading?.autoGrade === false
    && grading.partialCredit === false;
}
async function requireActiveSubmissionStudent(ctx: QueryCtx, userId: Id<"profiles">) {
  const profile = await ctx.db.get(userId);
  const credential = profile ? await ctx.db.query("auth_credentials").withIndex("by_username", (q) => q.eq("username", profile.username)).unique() : null;
  if (!profile || profile.role !== "student" || !credential || !credential.isActive || credential.profileId !== profile._id || credential.username !== profile.username || credential.role !== profile.role || credential.organizationId !== profile.organizationId) throw new Error("Inactive student identity");
}

async function loadQuadraticFormulaAuthority(
  ctx: QueryCtx,
  activity: Doc<"activities">,
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  publication: Im3PilotPublication,
  selectedVariantKey: string = quadraticFormulaVariantKey(mode, 0),
) {
  const qfMapping = IM3_QF_DRAFT_MAPPINGS[mode];
  if (
    JSON.stringify(convexToJson(activity.props as never)) !==
    JSON.stringify(
      convexToJson(quadraticFormulaPublicProps(mode, qfMapping.seed) as never),
    )
  ) {
    throw new Error("Invalid draft quadratic-formula activity authority");
  }
  if (
    activity.stableActivityId !== qfMapping.stableActivityId ||
    activity.masteryNodeId !== IM3_QF_NODE ||
    activity.componentKey !== "quadratic-formula" ||
    activity.srsEligible !== false ||
    activity.approval?.status !== "unreviewed" ||
    (activity.props as { presentationMode?: unknown }).presentationMode !==
      qfMapping.presentationMode
  ) {
    throw new Error("Invalid draft quadratic-formula activity authority");
  }
  const graphNodes = publication.nodes.filter(row => row.id === IM3_QF_NODE);
  const graphBlueprints = publication.blueprints.filter(row => row.nodeId === IM3_QF_NODE);
  if (graphNodes.length !== 1 || graphBlueprints.length !== 1
    || graphNodes[0].kind !== "skill" || graphNodes[0].reviewStatus !== "draft"
    || graphBlueprints[0].reviewStatus !== "draft") {
    throw new Error("Quadratic-formula server path requires the reviewed draft graph state");
  }
  const index = Array.from(
    { length: IM3_QF_VARIANT_SCHEDULES[mode].length },
    (_, candidate) => quadraticFormulaVariantKey(mode, candidate),
  ).indexOf(selectedVariantKey);
  if (index < 0) throw new Error("Invalid quadratic-formula selected relation");
  const items = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", selectedVariantKey))
    .take(2);
  if (items.length !== 1 || items[0].activityId !== activity._id)
    throw new Error("Invalid quadratic-formula practice item relation");
  const variants = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", selectedVariantKey))
    .take(2);
  if (variants.length !== 1)
    throw new Error("Invalid quadratic-formula private variant authority");
  const variant = variants[0];
  const metadata = variant?.metadata as Record<string, unknown> | undefined;
  if (
    !variant ||
    variant.componentKey !== "quadratic-formula" ||
    JSON.stringify(variant.objectiveIds) !== JSON.stringify([IM3_QF_NODE]) ||
    Object.keys(metadata ?? {})
      .sort()
      .join("|") !== "generatorKey|mode|seed|stableActivityId" ||
    metadata?.generatorKey !== "quadratic-formula" ||
    metadata.seed !== IM3_QF_VARIANT_SCHEDULES[mode][index] ||
    metadata.stableActivityId !== qfMapping.stableActivityId ||
    metadata.mode !== mode
  ) {
    throw new Error("Invalid quadratic-formula private variant authority");
  }
  return {
    generatorKey: "quadratic-formula" as const,
    seed: IM3_QF_VARIANT_SCHEDULES[mode][index],
  };
}

type QfMode = keyof typeof IM3_QF_DRAFT_MAPPINGS;
const publicPart = (part: PracticeSubmissionEnvelope["parts"][number]) => ({
  partId: part.partId,
  rawAnswer: part.rawAnswer as string | number,
  isCorrect: part.isCorrect,
  score: part.score,
  maxScore: part.maxScore,
});
function qfPublicState(
  activity: Doc<"activities">,
  row: Doc<"activity_submissions">,
  mode: QfMode,
  seed: number,
) {
  const props = quadraticFormulaPublicProps(mode, seed) as {
    prompt: string;
    equation: string;
    presentationMode: "guided" | "independent";
    fieldHelp?: { discriminant: string; x1: string; x2: string };
  };
  if (row.submissionData.status === "draft")
    return {
      state: "pending" as const,
      pendingSubmissionId: row._id,
      activityId: activity._id,
      mode,
      attemptOrdinal: row.attemptOrdinal!,
      idempotencyKey: row.idempotencyKey!,
      props,
    };
  return {
    state: "final" as const,
    activityId: activity._id,
    mode,
    attemptOrdinal: row.attemptOrdinal!,
    props,
    submissionId: row._id,
    score: row.score!,
    maxScore: row.maxScore!,
    answers: {
      discriminant: row.submissionData.answers.discriminant,
      x1: row.submissionData.answers.x1,
      x2: row.submissionData.answers.x2,
    },
    parts: row.submissionData.parts.map(publicPart),
  };
}

async function qfRows(
  ctx: QueryCtx,
  userId: Id<"profiles">,
  activityId: Id<"activities">,
) {
  return await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_attempt_ordinal", (q) =>
      q.eq("userId", userId).eq("activityId", activityId),
    )
    .order("desc")
    .take(6);
}

function validPendingQfRow(
  row: Doc<"activity_submissions">,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; mode: QfMode },
): boolean {
  const envelope = row.submissionData;
  return (
    row.userId === args.userId &&
    row.activityId === args.activityId &&
    Number.isSafeInteger(row.attemptOrdinal) &&
    (row.attemptOrdinal ?? 0) > 0 &&
    envelope.contractVersion === "practice.v1" &&
    Object.keys(envelope).sort().join("|") === "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt" &&
    envelope.activityId === String(args.activityId) &&
    envelope.mode === args.mode &&
    envelope.status === "draft" &&
    envelope.attemptNumber === row.attemptOrdinal &&
    Object.keys(envelope.answers).length === 0 &&
    envelope.parts.length === 0 &&
    row.score === undefined &&
    row.maxScore === undefined &&
    row.gradedAt === undefined &&
    row.feedback === undefined &&
    row.gradedBy === undefined &&
    row.masteryContractVersion === undefined &&
    row.allocatedVariantKey !== undefined &&
    row.idempotencyKey === `qf:${String(row._id)}`
  );
}

function validateQfRowSequence(
  rows: Doc<"activity_submissions">[],
  mode: QfMode,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; mode: QfMode },
): void {
  const ordinals = rows.map((row) => row.attemptOrdinal);
  if (
    ordinals.some(
      (value) => !Number.isSafeInteger(value) || (value ?? 0) < 1,
    ) ||
    new Set(ordinals).size !== ordinals.length ||
    ordinals.some((ordinal, index) => index > 0 && ordinal! >= ordinals[index - 1]!) ||
    rows.filter((row) => row.submissionData.status === "draft").length > 1
  )
    throw new Error("Invalid quadratic-formula attempt sequence");
  const transition = rows.findIndex(row => !row.allocatedVariantKey);
  const allocatedDescending = rows.slice(0, transition < 0 ? rows.length : transition);
  const legacy = rows.slice(allocatedDescending.length);
  if (allocatedDescending.length > 4 || legacy.some(row => row.allocatedVariantKey)
    || allocatedDescending.some((row, index) => index > 0 && row.attemptOrdinal !== allocatedDescending[index - 1].attemptOrdinal! - 1))
    throw new Error("Invalid quadratic-formula allocated sequence");
  const allocated = [...allocatedDescending].reverse();
  if (legacy[0] && !validFinalQfRow(legacy[0], args))
    throw new Error("Invalid quadratic-formula legacy anchor");
  const latestOrdinal = Math.max(0, ...rows.map(row => row.attemptOrdinal ?? 0));
  for (const row of allocated) {
    if (row.submissionData.status === "draft") {
      if (row.attemptOrdinal !== latestOrdinal || !validPendingQfRow(row, args)) throw new Error("Invalid quadratic-formula attempt sequence");
    } else if (!validFinalQfRow(row, args)) throw new Error("Invalid quadratic-formula attempt sequence");
  }
  const firstIndex =
    allocated[0]?.allocatedVariantKey === quadraticFormulaVariantKey(mode, 0)
      ? 0
      : 1;
  if ((firstIndex === 0 && (legacy.length > 0 || allocated[0]?.attemptOrdinal !== 1))
    || (firstIndex === 1 && allocated.length > 0 && (legacy.length === 0 || allocated[0].attemptOrdinal !== legacy[0].attemptOrdinal! + 1)))
    throw new Error("Invalid quadratic-formula allocated sequence");
  for (let index = 0; index < allocated.length; index++) {
    if (
      firstIndex + index >= IM3_QF_VARIANT_SCHEDULES[mode].length ||
      allocated[index].allocatedVariantKey !==
        quadraticFormulaVariantKey(mode, firstIndex + index)
    )
      throw new Error("Invalid quadratic-formula allocated sequence");
  }
}
function validFinalQfRow(
  row: Doc<"activity_submissions">,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; mode: QfMode },
): boolean {
  const envelope = row.submissionData;
  const answerKeys = ["discriminant", "x1", "x2"];
  return (
    row.userId === args.userId &&
    row.activityId === args.activityId &&
    Number.isSafeInteger(row.attemptOrdinal) &&
    (row.attemptOrdinal ?? 0) > 0 &&
    envelope.contractVersion === "practice.v1" &&
    envelope.activityId === String(args.activityId) &&
    envelope.mode === args.mode &&
    envelope.status === "graded" &&
    (!row.allocatedVariantKey ||
      envelope.attemptNumber === row.attemptOrdinal) &&
    Object.keys(envelope.answers).sort().join("|") ===
      answerKeys.slice().sort().join("|") &&
    answerKeys.every(
      (key) =>
        typeof envelope.answers[key] === "string" ||
        (typeof envelope.answers[key] === "number" &&
          Number.isFinite(envelope.answers[key])),
    ) &&
    envelope.parts.length === 3 &&
    new Set(envelope.parts.map((part) => part.partId)).size === 3 &&
    envelope.parts.every(
      (part) =>
        answerKeys.includes(part.partId) &&
        (typeof part.rawAnswer === "string" ||
          (typeof part.rawAnswer === "number" &&
            Number.isFinite(part.rawAnswer))) &&
        typeof part.isCorrect === "boolean" &&
        Number.isFinite(part.score) &&
        Number.isFinite(part.maxScore) && (part.score ?? -1) >= 0 && (part.maxScore ?? -1) >= 0 && (part.score ?? 1) <= (part.maxScore ?? 0),
    ) &&
    Number.isFinite(row.score) &&
    Number.isFinite(row.maxScore) &&
    (row.score ?? -1) >= 0 && (row.maxScore ?? -1) > 0 && (row.score ?? 1) <= (row.maxScore ?? 0) &&
    row.score === envelope.parts.reduce((sum, part) => sum + (part.score ?? 0), 0) &&
    row.maxScore === envelope.parts.reduce((sum, part) => sum + (part.maxScore ?? 0), 0) &&
    Number.isFinite(row.gradedAt) &&
    row.feedback === undefined && row.gradedBy === undefined &&
    row.masteryContractVersion === undefined &&
    (!row.allocatedVariantKey || row.idempotencyKey === `qf:${String(row._id)}`)
  );
}

async function ensureQuadraticFormulaRelation(
  ctx: MutationCtx,
  activity: Doc<"activities">,
  mode: QfMode,
  index: number,
) {
  const key = quadraticFormulaVariantKey(mode, index);
  const variants = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", key))
    .take(2);
  const items = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", key))
    .take(2);
  if (variants.length || items.length) {
    if (variants.length !== 1 || items.length !== 1)
      throw new Error("Invalid quadratic-formula selected relation");
    return;
  }
  const seed = IM3_QF_VARIANT_SCHEDULES[mode][index];
  await ctx.db.insert("practice_variants", {
    variantKey: key,
    componentKey: "quadratic-formula",
    displayName:
      mode === "guided_practice"
        ? "Guided quadratic-formula practice"
        : "Independent quadratic-formula practice",
    description: "A draft generated quadratic-formula variant.",
    objectiveIds: [IM3_QF_NODE],
    difficulty: "standard",
    metadata: {
      generatorKey: "quadratic-formula",
      seed,
      stableActivityId: IM3_QF_DRAFT_MAPPINGS[mode].stableActivityId,
      mode,
    },
  });
  await ctx.db.insert("practice_items", {
    practiceItemId: `${key}:seed-${seed}`,
    activityId: activity._id,
    variantKey: key,
    variantLabel: `Seed ${seed}`,
  });
}

export async function getQuadraticFormulaAttemptHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; mode: QfMode },
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  await requireActiveSubmissionStudent(ctx, args.userId);
  const activity = await ctx.db.get(args.activityId);
  if (!activity) throw new Error("Activity not found");
  const rows = await qfRows(ctx, args.userId, args.activityId);
  validateQfRowSequence(rows, args.mode, args);
  const latest = rows.sort(
    (a, b) => (b.attemptOrdinal ?? 0) - (a.attemptOrdinal ?? 0),
  )[0];
  if (!latest) {
    await loadQuadraticFormulaAuthority(ctx, activity, args.mode, publication);
    return { state: "no_attempt" as const };
  }
  const key =
    latest.allocatedVariantKey ?? quadraticFormulaVariantKey(args.mode, 0);
  const authority = await loadQuadraticFormulaAuthority(
    ctx,
    activity,
    args.mode,
    publication,
    key,
  );
  if (!latest.attemptOrdinal || latest.submissionData.mode !== args.mode)
    throw new Error("Invalid quadratic-formula attempt state");
  if (
    latest.submissionData.status === "draft" &&
    !validPendingQfRow(latest, args)
  )
    throw new Error("Invalid quadratic-formula pending state");
  if (
    latest.submissionData.status !== "draft" &&
    !validFinalQfRow(latest, args)
  )
    throw new Error("Invalid quadratic-formula final state");
  return qfPublicState(activity, latest, args.mode, authority.seed);
}

export async function startQuadraticFormulaAttemptHandler(
  ctx: MutationCtx,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; mode: QfMode },
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  const current = await getQuadraticFormulaAttemptHandler(
    ctx,
    args,
    publication,
  );
  if (current.state === "pending") return current;
  const rows = await qfRows(ctx, args.userId, args.activityId);
  const allocated = rows
    .filter((row) => row.allocatedVariantKey)
    .sort((a, b) => (a.attemptOrdinal ?? 0) - (b.attemptOrdinal ?? 0));
  const firstIndex =
    allocated[0]?.allocatedVariantKey ===
    quadraticFormulaVariantKey(args.mode, 0)
      ? 0
      : 1;
  const nextIndex =
    rows.length === 0
      ? 0
      : allocated.length === 0
        ? 1
        : firstIndex + allocated.length;
  if (nextIndex >= IM3_QF_VARIANT_SCHEDULES[args.mode].length)
    return { state: "exhausted" as const };
  const activity = await ctx.db.get(args.activityId);
  if (!activity) throw new Error("Activity not found");
  const latestOrdinal = Math.max(
    0,
    ...rows.map((row) => row.attemptOrdinal ?? 0),
  );
  if (latestOrdinal >= Number.MAX_SAFE_INTEGER)
    throw new Error("Quadratic-formula attempt ordinal is exhausted");
  const variantKey = quadraticFormulaVariantKey(args.mode, nextIndex);
  await ensureQuadraticFormulaRelation(ctx, activity, args.mode, nextIndex);
  const authority = await loadQuadraticFormulaAuthority(
    ctx,
    activity,
    args.mode,
    publication,
    variantKey,
  );
  const attemptOrdinal = latestOrdinal + 1;
  const now = Date.now();
  const id = await ctx.db.insert("activity_submissions", {
    userId: args.userId,
    activityId: args.activityId,
    allocatedVariantKey: variantKey,
    submissionData: {
      contractVersion: "practice.v1",
      activityId: String(args.activityId),
      mode: args.mode,
      status: "draft",
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers: {},
      parts: [],
    },
    attemptOrdinal,
    idempotencyKey: "qf:pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const retryKey = `qf:${String(id)}`;
  await ctx.db.patch(id, { idempotencyKey: retryKey });
  return qfPublicState(
    activity,
    {
      ...(await ctx.db.get(id))!,
      idempotencyKey: retryKey,
    } as Doc<"activity_submissions">,
    args.mode,
    authority.seed,
  );
}

export async function checkQuadraticFormulaDiscriminantHandler(
  ctx: QueryCtx,
  args: {
    userId: Id<"profiles">;
    activityId: Id<"activities">;
    pendingSubmissionId?: Id<"activity_submissions">;
    fieldId: "discriminant";
    rawAnswer: string;
  },
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  if (args.fieldId !== "discriminant" || typeof args.rawAnswer !== "string" || args.rawAnswer.length > 160) {
    throw new Error("Invalid discriminant check");
  }
  await requireActiveSubmissionStudent(ctx, args.userId);
  const activity = await ctx.db.get(args.activityId);
  if (!activity) throw new Error("Activity not found");
  const pending = args.pendingSubmissionId
    ? await ctx.db.get(args.pendingSubmissionId)
    : null;
  if (
    !pending ||
    !validPendingQfRow(pending, { userId: args.userId, activityId: args.activityId, mode: "guided_practice" })
  )
    throw new Error("Invalid pending quadratic-formula attempt");
  const privateGenerator = await loadQuadraticFormulaAuthority(
    ctx,
    activity,
    "guided_practice",
    publication,
    pending.allocatedVariantKey,
  );
  return {
    isCorrect: checkServerOwnedQuadraticDiscriminant(
      {
        ...activity,
        id: String(activity._id),
        props: quadraticFormulaPublicProps(
          "guided_practice",
          privateGenerator.seed,
        ),
        privateGenerator,
      },
      args.rawAnswer,
    ),
  };
}

export const checkQuadraticFormulaDiscriminant = internalQuery({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    pendingSubmissionId: v.optional(v.id("activity_submissions")),
    fieldId: v.literal("discriminant"),
    rawAnswer: v.string(),
  },
  returns: v.object({ isCorrect: v.boolean() }),
  handler: checkQuadraticFormulaDiscriminantHandler,
});

export async function createServerOwnedSubmissionHandler(
  ctx: MutationCtx,
  args: ServerOwnedSubmissionArgs,
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  const key = args.idempotencyKey.trim();
  if (!key || key.length > 80) throw new Error("Invalid idempotency key");
  if (args.submissionData.contractVersion !== "practice.v1") throw new Error("Invalid practice contract");
  await requireActiveSubmissionStudent(ctx, args.userId);
  if (String(args.activityId) !== args.submissionData.activityId)
    throw new Error(
      "Submission activityId must match the server activity document",
    );
  const activity = await ctx.db.get(args.activityId);
  const qfMapping = IM3_QF_DRAFT_MAPPINGS[args.submissionData.mode as keyof typeof IM3_QF_DRAFT_MAPPINGS];
  const isQf = Boolean(activity && qfMapping && (activity.stableActivityId === qfMapping.stableActivityId
    || (activity.masteryNodeId === IM3_QF_NODE && activity.componentKey === "quadratic-formula")));
  const isWorked = args.submissionData.mode === "worked_example";
  const isQuiz = activity?.componentKey === "comprehension-quiz";
  let qfPrivateGenerator: { generatorKey: "quadratic-formula"; seed: number } | undefined;
  if (isQf && activity && qfMapping) {
    validateQfEnvelope(args.submissionData);
    qfPrivateGenerator = await loadQuadraticFormulaAuthority(ctx, activity, args.submissionData.mode as keyof typeof IM3_QF_DRAFT_MAPPINGS, publication);
  } else if (isQuiz) {
    if (args.pendingSubmissionId || !isLesson16QuizRequest(args.submissionData) || !(await loadLesson16QuizAuthority(ctx, args.activityId))) throw new Error("Invalid Lesson 1.6 quiz submission");
  } else if (isWorked) {
    if (!isSelectedWorkedAcknowledgement(args.submissionData))
      throw new Error("Invalid selected IM3 Worked acknowledgement");
  } else {
    if (args.pendingSubmissionId)
      throw new Error(
        "Pending handle is only valid for quadratic-formula submissions",
      );
    validateSelectedEnvelope(args.submissionData);
  }
  const expectedStable =
    args.submissionData.mode === "guided_practice"
      ? IM3_GUIDED_PRACTICE_ACTIVITY_ID
      : IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  if (isQf || isQuiz) {
    // The draft authority was validated above. It does not use the approved pilot gate.
  } else if (isWorked) {
    if (!activity || !isIm3GraphPilotPublished(publication) || !isSelectedWorkedActivity(activity))
      throw new Error("IM3 pilot activity metadata does not match the approved server-owned create mapping");
  } else if (
    !activity ||
    !isIm3GraphPilotPublished(publication) ||
    activity.masteryNodeId !== IM3_PILOT_NODE ||
    activity.componentKey !== "graphing-explorer" ||
    activity.srsEligible !== true ||
    activity.approval?.status !== "approved" ||
    activity.stableActivityId !== expectedStable
  )
    throw new Error(
      "IM3 pilot activity metadata does not match the approved server-owned create mapping",
    );
  const existing = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_idempotency_key", (q) =>
      q
        .eq("userId", args.userId)
        .eq("activityId", args.activityId)
        .eq("idempotencyKey", key),
    )
    .unique();
  if (
    existing &&
    isQf &&
    existing.allocatedVariantKey &&
    existing._id !== args.pendingSubmissionId
  ) {
    throw new Error("Invalid pending quadratic-formula attempt");
  }
  if (
    existing &&
    isQf &&
    !existing.allocatedVariantKey &&
    args.pendingSubmissionId
  ) {
    throw new Error("Invalid pending quadratic-formula attempt");
  }
  if (
    existing &&
    !(
      isQf &&
      existing.allocatedVariantKey &&
      existing.submissionData.status === "draft"
    )
  ) {
    if (isQf && existing.allocatedVariantKey) {
      await loadQuadraticFormulaAuthority(
        ctx,
        activity!,
        args.submissionData.mode as QfMode,
        publication,
        existing.allocatedVariantKey,
      );
    }
    if (
      (isQf ? canonicalQfPayload : isQuiz ? canonicalLesson16QuizRequest : isWorked ? canonicalWorkedPayload : canonicalPayload)(
        existing.submissionData as PracticeSubmissionEnvelope,
      ) !== (isQf ? canonicalQfPayload : isQuiz ? canonicalLesson16QuizRequest : isWorked ? canonicalWorkedPayload : canonicalPayload)(args.submissionData)
    )
      throw new Error("idempotency_conflict");
    if (existing.attemptOrdinal === undefined
      || (!isWorked && (existing.score === undefined || existing.maxScore === undefined)))
      throw new Error("Stored IM3 submission is incomplete");
    if (isQuiz && !validLesson16QuizRow(existing, String(args.userId), String(args.activityId))) throw new Error("Stored Lesson 1.6 quiz submission is incomplete");
    if (isWorked) {
      if (existing.score !== undefined || existing.maxScore !== undefined || existing.gradedAt !== undefined)
        throw new Error("Stored IM3 Worked acknowledgement is graded");
      return {
        id: existing._id,
        submissionId: existing._id,
        acknowledged: true as const,
      };
    }
    const score = existing.score;
    const maxScore = existing.maxScore;
    if (score === undefined || maxScore === undefined)
      throw new Error("Stored IM3 submission is incomplete");
    return {
      id: existing._id,
      submissionId: existing._id,
      score,
      maxScore,
    };
  }
  const prior = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_attempt_ordinal", (q) =>
      q.eq("userId", args.userId).eq("activityId", args.activityId),
    )
    .order("desc")
    .first();
  const attemptOrdinal = (prior?.attemptOrdinal ?? 0) + 1;
  if (isWorked) {
    const now = Date.now();
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData: { ...args.submissionData, attemptNumber: attemptOrdinal },
      attemptOrdinal,
      idempotencyKey: key,
      masteryContractVersion: "learning-evidence.v1",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { id: submissionId, submissionId, acknowledged: true as const };
  }
  let pending: Doc<"activity_submissions"> | null = null;
  if (isQf) {
    if (!args.pendingSubmissionId)
      throw new Error("A pending quadratic-formula attempt is required");
    pending = await ctx.db.get(args.pendingSubmissionId);
    if (
      !pending ||
      !validPendingQfRow(pending, {
        userId: args.userId,
        activityId: args.activityId,
        mode: args.submissionData.mode as QfMode,
      }) ||
      pending.idempotencyKey !== key ||
      args.submissionData.attemptNumber !== pending.attemptOrdinal
    ) {
      throw new Error("Invalid pending quadratic-formula attempt");
    }
    qfPrivateGenerator = await loadQuadraticFormulaAuthority(
      ctx,
      activity!,
      args.submissionData.mode as QfMode,
      publication,
      pending.allocatedVariantKey,
    );
  } else if (args.pendingSubmissionId) {
    throw new Error(
      "Pending handle is only valid for quadratic-formula submissions",
    );
  }
  const graded = isQuiz ? (() => { const submissionData = gradeLesson16Quiz(args.submissionData); return { submissionData, score: submissionData.parts.reduce((sum, part) => sum + (part.score ?? 0), 0), maxScore: 2, masteryContractVersion: undefined }; })() : gradeServerOwnedSubmission(
    {
      id: String(activity!._id),
      stableActivityId: activity!.stableActivityId,
      masteryNodeId: activity!.masteryNodeId,
      componentKey: activity!.componentKey,
      srsEligible: activity!.srsEligible,
      props: qfPrivateGenerator
        ? quadraticFormulaPublicProps(
            args.submissionData.mode as QfMode,
            qfPrivateGenerator.seed,
          )
        : (activity!.props as Record<string, unknown>),
      gradingConfig: activity!.gradingConfig,
      ...(qfPrivateGenerator ? { privateGenerator: qfPrivateGenerator } : {}),
    },
    args.submissionData,
  );
  if (graded.score === undefined || graded.maxScore === undefined)
    throw new Error("IM3 pilot did not produce a server grade");
  const score = graded.score;
  const maxScore = graded.maxScore;
  const now = Date.now();
  const submissionData = {
    ...graded.submissionData,
    attemptNumber: isQf ? pending!.attemptOrdinal! : attemptOrdinal,
  };
  if (pending) {
    await ctx.db.patch(pending._id, {
      submissionData,
      score,
      maxScore,
      gradedAt: now,
      submittedAt: now,
      updatedAt: now,
    });
    return { id: pending._id, submissionId: pending._id, score, maxScore };
  }
  const submissionId = await ctx.db.insert("activity_submissions", {
    userId: args.userId,
    activityId: args.activityId,
    submissionData,
    attemptOrdinal,
    idempotencyKey: key,
    score,
    maxScore,
    gradedAt: now,
    ...(graded.masteryContractVersion ? { masteryContractVersion: graded.masteryContractVersion } : {}),
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return {
    id: submissionId,
    submissionId,
    score,
    maxScore,
  };
}
const selectedResult = v.union(v.object({
  id: v.id("activity_submissions"),
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
}), v.object({
  id: v.id("activity_submissions"),
  submissionId: v.id("activity_submissions"),
  acknowledged: v.literal(true),
}));
export const createServerOwnedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
    idempotencyKey: v.string(),
    pendingSubmissionId: v.optional(v.id("activity_submissions")),
  },
  returns: selectedResult,
  handler: async (ctx, args) => createServerOwnedSubmissionHandler(ctx, {
    ...args,
    submissionData: practiceSubmissionEnvelopeSchema.parse(args.submissionData),
  }),
});

const qfModeValidator = v.union(
  v.literal("guided_practice"),
  v.literal("independent_practice"),
);
const qfPropsValidator = v.object({
  prompt: v.string(),
  equation: v.string(),
  presentationMode: v.union(v.literal("guided"), v.literal("independent")),
  fieldHelp: v.optional(
    v.object({ discriminant: v.string(), x1: v.string(), x2: v.string() }),
  ),
});
const qfAnswerValidator = v.union(v.string(), v.number());
const qfPartValidator = v.object({
  partId: v.string(),
  rawAnswer: qfAnswerValidator,
  isCorrect: v.optional(v.boolean()),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
});
const qfAttemptResult = v.union(
  v.object({ state: v.literal("no_attempt") }),
  v.object({ state: v.literal("exhausted") }),
  v.object({
    state: v.literal("pending"),
    pendingSubmissionId: v.id("activity_submissions"),
    activityId: v.id("activities"),
    mode: qfModeValidator,
    attemptOrdinal: v.number(),
    idempotencyKey: v.string(),
    props: qfPropsValidator,
  }),
  v.object({
    state: v.literal("final"),
    activityId: v.id("activities"),
    mode: qfModeValidator,
    attemptOrdinal: v.number(),
    props: qfPropsValidator,
    submissionId: v.id("activity_submissions"),
    score: v.number(),
    maxScore: v.number(),
    answers: v.object({
      discriminant: qfAnswerValidator,
      x1: qfAnswerValidator,
      x2: qfAnswerValidator,
    }),
    parts: v.array(qfPartValidator),
  }),
);
export const getQuadraticFormulaAttempt = internalQuery({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    mode: qfModeValidator,
  },
  returns: qfAttemptResult,
  handler: getQuadraticFormulaAttemptHandler,
});
export const startQuadraticFormulaAttempt = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    mode: qfModeValidator,
  },
  returns: qfAttemptResult,
  handler: startQuadraticFormulaAttemptHandler,
});

export async function getSelectedWorkedAcknowledgementHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; activityId: Id<"activities"> },
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  const profile = await ctx.db.get(args.userId);
  const credential = profile
    ? await ctx.db.query("auth_credentials")
      .withIndex("by_username", (query) => query.eq("username", profile.username))
      .unique()
    : null;
  const activity = await ctx.db.get(args.activityId);
  if (
    !profile || profile.role !== "student" || !credential || !credential.isActive
    || credential.profileId !== profile._id || credential.username !== profile.username
    || credential.role !== profile.role || credential.organizationId !== profile.organizationId
    || !activity || !isIm3GraphPilotPublished(publication) || !isSelectedWorkedActivity(activity)
  ) return null;
  const submission = await ctx.db.query("activity_submissions")
    .withIndex("by_user_activity_idempotency_key", (query) => query
      .eq("userId", args.userId)
      .eq("activityId", args.activityId)
      .eq("idempotencyKey", `worked-example:${String(args.activityId)}`))
    .unique();
  if (
    !submission || submission.masteryContractVersion !== "learning-evidence.v1"
    || !Number.isInteger(submission.attemptOrdinal) || (submission.attemptOrdinal ?? 0) < 1
    || !Number.isFinite(submission.submittedAt)
    || submission.submissionData.activityId !== String(args.activityId)
    || submission.submissionData.attemptNumber !== submission.attemptOrdinal
    || submission.score !== undefined || submission.maxScore !== undefined || submission.gradedAt !== undefined
    || !isSelectedWorkedAcknowledgement(submission.submissionData as PracticeSubmissionEnvelope)
  ) return null;
  return { submissionId: submission._id, acknowledged: true as const };
}

export const getSelectedWorkedAcknowledgement = internalQuery({
  args: { userId: v.id("profiles"), activityId: v.id("activities") },
  returns: v.union(v.null(), v.object({
    submissionId: v.id("activity_submissions"),
    acknowledged: v.literal(true),
  })),
  handler: getSelectedWorkedAcknowledgementHandler,
});

export async function getLesson16QuizReceiptHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; activityId: Id<"activities"> },
) {
  try { await requireActiveSubmissionStudent(ctx, args.userId); } catch { return null; }
  if (!(await loadLesson16QuizAuthority(ctx, args.activityId))) return null;
  const row = await ctx.db.query("activity_submissions")
    .withIndex("by_user_and_activity", query => query.eq("userId", args.userId).eq("activityId", args.activityId))
    .order("desc").first();
  if (!row || !validLesson16QuizRow(row, String(args.userId), String(args.activityId))) return null;
  return {
    submissionId: row._id,
    score: row.score!,
    maxScore: 2 as const,
    answers: {
      "discriminant-purpose": row.submissionData.answers["discriminant-purpose"] as string,
      "zero-discriminant-real-solution-count": row.submissionData.answers["zero-discriminant-real-solution-count"] as string,
    },
  };
}

export const getLesson16QuizReceipt = internalQuery({
  args: { userId: v.id("profiles"), activityId: v.id("activities") },
  returns: v.union(v.null(), v.object({ submissionId: v.id("activity_submissions"), score: v.number(), maxScore: v.literal(2), answers: v.object({ "discriminant-purpose": v.string(), "zero-discriminant-real-solution-count": v.string() }) })),
  handler: getLesson16QuizReceiptHandler,
});
