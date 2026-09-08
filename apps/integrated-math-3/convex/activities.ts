import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { convexToJson } from "convex/values";
import { internal } from "./_generated/api";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";
import type { Doc, Id } from "./_generated/dataModel";
import { practiceSubmissionEnvelopeSchema, type PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { checkServerOwnedQuadraticDiscriminant, gradeServerOwnedSubmission, IM3_QF_DRAFT_MAPPINGS, IM3_QF_NODE } from "../lib/activities/server-grading";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import { IM3_GUIDED_PRACTICE_ACTIVITY_ID, IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from "../lib/practice/learning-evidence-pilot";

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
};
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
) {
  const qfMapping = IM3_QF_DRAFT_MAPPINGS[mode];
  if (activity.stableActivityId !== qfMapping.stableActivityId || activity.masteryNodeId !== IM3_QF_NODE
    || activity.componentKey !== "quadratic-formula" || activity.srsEligible !== false
    || activity.approval?.status !== "unreviewed"
    || (activity.props as { presentationMode?: unknown }).presentationMode !== qfMapping.presentationMode) {
    throw new Error("Invalid draft quadratic-formula activity authority");
  }
  const graphNodes = publication.nodes.filter(row => row.id === IM3_QF_NODE);
  const graphBlueprints = publication.blueprints.filter(row => row.nodeId === IM3_QF_NODE);
  if (graphNodes.length !== 1 || graphBlueprints.length !== 1
    || graphNodes[0].kind !== "skill" || graphNodes[0].reviewStatus !== "draft"
    || graphBlueprints[0].reviewStatus !== "draft") {
    throw new Error("Quadratic-formula server path requires the reviewed draft graph state");
  }
  const items = await ctx.db.query("practice_items").withIndex("by_activityId", (q) => q.eq("activityId", activity._id)).take(2);
  if (items.length !== 1) throw new Error("Invalid quadratic-formula practice item relation");
  if (items[0].variantKey !== qfMapping.stableActivityId) throw new Error("Invalid quadratic-formula practice item relation");
  const reverseItems = await ctx.db.query("practice_items").withIndex("by_variantKey", q => q.eq("variantKey", items[0].variantKey)).take(2);
  if (reverseItems.length !== 1 || reverseItems[0]._id !== items[0]._id) throw new Error("Invalid quadratic-formula reverse item relation");
  const variants = await ctx.db.query("practice_variants").withIndex("by_variantKey", (q) => q.eq("variantKey", items[0].variantKey)).take(2);
  if (variants.length !== 1) throw new Error("Invalid quadratic-formula private variant authority");
  const variant = variants[0];
  const metadata = variant?.metadata as Record<string, unknown> | undefined;
  if (!variant || variant.componentKey !== "quadratic-formula"
    || JSON.stringify(variant.objectiveIds) !== JSON.stringify([IM3_QF_NODE])
    || Object.keys(metadata ?? {}).sort().join("|") !== "generatorKey|mode|seed|stableActivityId"
    || metadata?.generatorKey !== "quadratic-formula" || metadata.seed !== qfMapping.seed
    || metadata.stableActivityId !== qfMapping.stableActivityId || metadata.mode !== mode) {
    throw new Error("Invalid quadratic-formula private variant authority");
  }
  return { generatorKey: "quadratic-formula" as const, seed: qfMapping.seed };
}

export async function checkQuadraticFormulaDiscriminantHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; activityId: Id<"activities">; fieldId: "discriminant"; rawAnswer: string },
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  if (args.fieldId !== "discriminant" || typeof args.rawAnswer !== "string" || args.rawAnswer.length > 160) {
    throw new Error("Invalid discriminant check");
  }
  await requireActiveSubmissionStudent(ctx, args.userId);
  const activity = await ctx.db.get(args.activityId);
  if (!activity) throw new Error("Activity not found");
  const privateGenerator = await loadQuadraticFormulaAuthority(ctx, activity, "guided_practice", publication);
  return { isCorrect: checkServerOwnedQuadraticDiscriminant({ ...activity, id: String(activity._id), props: activity.props as Record<string, unknown>, privateGenerator }, args.rawAnswer) };
}

export const checkQuadraticFormulaDiscriminant = internalQuery({
  args: { userId: v.id("profiles"), activityId: v.id("activities"), fieldId: v.literal("discriminant"), rawAnswer: v.string() },
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
  let qfPrivateGenerator: { generatorKey: "quadratic-formula"; seed: number } | undefined;
  if (isQf && activity && qfMapping) {
    validateQfEnvelope(args.submissionData);
    qfPrivateGenerator = await loadQuadraticFormulaAuthority(ctx, activity, args.submissionData.mode as keyof typeof IM3_QF_DRAFT_MAPPINGS, publication);
  } else if (isWorked) {
    if (!isSelectedWorkedAcknowledgement(args.submissionData))
      throw new Error("Invalid selected IM3 Worked acknowledgement");
  } else {
    validateSelectedEnvelope(args.submissionData);
  }
  const expectedStable =
    args.submissionData.mode === "guided_practice"
      ? IM3_GUIDED_PRACTICE_ACTIVITY_ID
      : IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  if (isQf) {
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
  if (existing) {
    if (
      (isQf ? canonicalQfPayload : isWorked ? canonicalWorkedPayload : canonicalPayload)(
        existing.submissionData as PracticeSubmissionEnvelope,
      ) !== (isQf ? canonicalQfPayload : isWorked ? canonicalWorkedPayload : canonicalPayload)(args.submissionData)
    )
      throw new Error("idempotency_conflict");
    if (existing.attemptOrdinal === undefined
      || (!isWorked && (existing.score === undefined || existing.maxScore === undefined)))
      throw new Error("Stored IM3 submission is incomplete");
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
  const graded = gradeServerOwnedSubmission(
    {
      id: String(activity!._id),
      stableActivityId: activity!.stableActivityId,
      masteryNodeId: activity!.masteryNodeId,
      componentKey: activity!.componentKey,
      srsEligible: activity!.srsEligible,
      props: activity!.props as Record<string, unknown>,
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
    attemptNumber: isQf ? args.submissionData.attemptNumber : attemptOrdinal,
  };
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
  },
  returns: selectedResult,
  handler: async (ctx, args) => createServerOwnedSubmissionHandler(ctx, {
    ...args,
    submissionData: practiceSubmissionEnvelopeSchema.parse(args.submissionData),
  }),
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
