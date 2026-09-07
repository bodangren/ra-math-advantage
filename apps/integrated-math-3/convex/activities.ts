import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";
import type { Id } from "./_generated/dataModel";
import { practiceSubmissionEnvelopeSchema, type PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { gradeServerOwnedSubmission } from "../lib/activities/server-grading";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import { IM3_GUIDED_PRACTICE_ACTIVITY_ID, IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, IM3_PILOT_NODE } from "../lib/practice/learning-evidence-pilot";

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
export async function createServerOwnedSubmissionHandler(
  ctx: MutationCtx,
  args: ServerOwnedSubmissionArgs,
  publication: Im3PilotPublication = currentIm3PilotPublication,
) {
  const key = args.idempotencyKey.trim();
  if (!key || key.length > 80) throw new Error("Invalid idempotency key");
  if (args.submissionData.contractVersion !== "practice.v1") throw new Error("Invalid practice contract");
  const profile = await ctx.db.get(args.userId);
  const credential = profile ? await ctx.db.query("auth_credentials").withIndex("by_username", (q) => q.eq("username", profile.username)).unique() : null;
  if (!profile || profile.role !== "student" || !credential || !credential.isActive || credential.profileId !== profile._id || credential.username !== profile.username || credential.role !== profile.role || credential.organizationId !== profile.organizationId) throw new Error("Inactive student identity");
  if (String(args.activityId) !== args.submissionData.activityId)
    throw new Error(
      "Submission activityId must match the server activity document",
    );
  validateSelectedEnvelope(args.submissionData);
  const activity = await ctx.db.get(args.activityId);
  const expectedStable =
    args.submissionData.mode === "guided_practice"
      ? IM3_GUIDED_PRACTICE_ACTIVITY_ID
      : IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  if (
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
      canonicalPayload(
        existing.submissionData as PracticeSubmissionEnvelope,
      ) !== canonicalPayload(args.submissionData)
    )
      throw new Error("idempotency_conflict");
    if (
      existing.attemptOrdinal === undefined
      || existing.score === undefined
      || existing.maxScore === undefined
    )
      throw new Error("Stored IM3 submission is incomplete");
    return {
      id: existing._id,
      submissionId: existing._id,
      score: existing.score,
      maxScore: existing.maxScore,
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
  const graded = gradeServerOwnedSubmission(
    {
      id: String(activity._id),
      stableActivityId: activity.stableActivityId,
      masteryNodeId: activity.masteryNodeId,
      componentKey: activity.componentKey,
      srsEligible: activity.srsEligible,
      props: activity.props as Record<string, unknown>,
      gradingConfig: activity.gradingConfig,
    },
    args.submissionData,
  );
  if (graded.score === undefined || graded.maxScore === undefined)
    throw new Error("IM3 pilot did not produce a server grade");
  const now = Date.now();
  const submissionData = {
    ...graded.submissionData,
    attemptNumber: attemptOrdinal,
  };
  const submissionId = await ctx.db.insert("activity_submissions", {
    userId: args.userId,
    activityId: args.activityId,
    submissionData,
    attemptOrdinal,
    idempotencyKey: key,
    score: graded.score,
    maxScore: graded.maxScore,
    gradedAt: now,
    masteryContractVersion: graded.masteryContractVersion,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return {
    id: submissionId,
    submissionId,
    score: graded.score,
    maxScore: graded.maxScore,
  };
}
const selectedResult = v.object({
  id: v.id("activity_submissions"),
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
});
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
