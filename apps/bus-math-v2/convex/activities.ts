import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";
import { accountingEquationFamily } from "../lib/practice/engine/families/accounting-equation";
import {
  BM2_PILOT_PROBLEM_FAMILY_ID,
  BM2_PILOT_SOURCE_ACTIVITY_ID,
  isBm2PilotPublished,
} from "../lib/learning-evidence/bm2-pilot";
import { spreadsheetDataValidator, validationResultValidator } from "./spreadsheet_validators";
import {
  getBm2AccountingEquationEventActivity,
  isBm2AccountingEquationEventPublished,
  isBm2AccountingEquationEventStoredActivity,
} from "../lib/practice/accounting-equation-event-activities";
import { gradeAccountingEquationEventSubmission } from "../lib/practice/grading/accounting-equation-event";
import { normalizePracticeValue } from "../lib/practice/contract";

export const getSpreadsheetDraft = internalQuery({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId),
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

export const saveSpreadsheetDraft = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    draftData: spreadsheetDataValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId),
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
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, updatedAt: now };
  },
});

export const getSpreadsheetResponse = internalQuery({
  args: {
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId),
      )
      .unique();

    if (!response) {
      return null;
    }

    // Get attempt count from the attempts table
    const attempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId),
      )
      .collect();

    return {
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: attempts.length,
      maxAttempts: response.maxAttempts,
      lastValidationResult: response.lastValidationResult,
      submittedAt: response.submittedAt,
      updatedAt: response.updatedAt,
    };
  },
});

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

export const submitSpreadsheet = internalMutation({
  args: {
    userId: v.id("profiles"),
    idempotencyKey: v.optional(v.string()),
    submissionData: v.optional(practiceSubmissionEnvelopeValidator),
    activityId: v.id("activities"),
    spreadsheetData: spreadsheetDataValidator,
    isCompleted: v.boolean(),
    validationResult: validationResultValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId),
      )
      .unique();

    const maxAttempts = existingResponse?.maxAttempts ?? 3;

    const existingAttempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId),
      )
      .collect();

    const replay = args.idempotencyKey
      ? existingAttempts.find((attempt) => attempt.idempotencyKey === args.idempotencyKey)
      : undefined;
    if (replay) {
      if (JSON.stringify(replay.spreadsheetData) !== JSON.stringify(args.spreadsheetData))
        throw new Error("idempotency_conflict");
      return { success: true, attemptId: replay._id, attemptNumber: replay.attemptNumber };
    }
    if (existingAttempts.length >= maxAttempts) {
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this activity.`);
    }

    const attemptNumber = existingAttempts.length + 1;

    const attemptId = await ctx.db.insert("spreadsheet_submission_attempts", {
      studentId: args.userId,
      activityId: args.activityId,
      idempotencyKey: args.idempotencyKey,
      attemptNumber,
      spreadsheetData: args.spreadsheetData,
      validationResult: args.validationResult,
      submittedAt: now,
      createdAt: now,
    });

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
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
        lastValidationResult: args.validationResult,
        maxAttempts: 3,
        submittedAt: args.isCompleted ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (args.submissionData) {
      await ctx.db.insert("activity_submissions", {
        userId: args.userId,
        activityId: args.activityId,
        idempotencyKey: args.idempotencyKey,
        attemptOrdinal: attemptNumber,
        submissionData: {
          ...args.submissionData,
          attemptNumber,
          status: "graded",
          submittedAt: new Date(now).toISOString(),
        },
        score: args.validationResult.correctCells,
        maxScore: args.validationResult.totalCells,
        submittedAt: now,
        gradedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      const activity = await ctx.db.get(args.activityId);
      if (args.isCompleted && activity?.standardId) {
        const existing = await ctx.db
          .query("student_competency")
          .withIndex("by_student_and_standard", (q) =>
            q.eq("studentId", args.userId).eq("standardId", activity.standardId!),
          )
          .unique();
        if (existing)
          await ctx.db.patch(existing._id, {
            masteryLevel: Math.min(existing.masteryLevel + 10, 100),
            evidenceActivityId: args.activityId,
            lastUpdated: now,
          });
        else
          await ctx.db.insert("student_competency", {
            studentId: args.userId,
            standardId: activity.standardId,
            masteryLevel: 10,
            evidenceActivityId: args.activityId,
            lastUpdated: now,
            createdAt: now,
          });
      }
    }
    return { success: true, attemptId, attemptNumber };
  },
});

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
        q.eq("studentId", args.studentId).eq("standardId", args.standardId),
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

export const getActivityById = internalQuery({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) return null;

    return {
      id: activity._id,
      stableActivityId: activity.stableActivityId,
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

export const getSpreadsheetAttempts = internalQuery({
  args: {
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId),
      )
      .order("asc")
      .collect();

    return attempts;
  },
});

export const updateAttemptWithAiFeedback = internalMutation({
  args: {
    attemptId: v.id("spreadsheet_submission_attempts"),
    aiFeedback: v.object({
      preliminaryScore: v.number(),
      strengths: v.array(v.string()),
      improvements: v.array(v.string()),
      nextSteps: v.array(v.string()),
      rawAiResponse: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attemptId, {
      aiFeedback: args.aiFeedback,
    });

    return { success: true };
  },
});

export const updateAttemptWithTeacherOverride = internalMutation({
  args: {
    attemptId: v.id("spreadsheet_submission_attempts"),
    teacherScoreOverride: v.optional(v.number()),
    teacherFeedbackOverride: v.optional(v.string()),
    gradedBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.attemptId, {
      teacherScoreOverride: args.teacherScoreOverride,
      teacherFeedbackOverride: args.teacherFeedbackOverride,
      gradedBy: args.gradedBy,
      gradedAt: now,
    });

    return { success: true };
  },
});

export const submitAssessment = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
    idempotencyKey: v.optional(v.string()),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (
      activity?.componentKey === "reflection-journal" &&
      args.submissionData.status !== "draft" &&
      Array.isArray(activity.props.prompts) &&
      activity.props.prompts.some(
        (prompt: { id: string }) =>
          typeof args.submissionData.answers[prompt.id] !== "string" ||
          !String(args.submissionData.answers[prompt.id]).trim(),
      )
    ) {
      throw new Error("required_answers_missing");
    }
    const stableActivityId = activity?.stableActivityId;
    const idempotencyKey = args.idempotencyKey;

    if (idempotencyKey !== undefined) {
      const existing = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_idempotency_key", (query) =>
          query.eq("userId", args.userId).eq("idempotencyKey", idempotencyKey),
        )
        .unique();
      if (existing) {
        const existingSubmissionData = existing.submissionData;
        const sameCanonicalSubmission =
          existing.activityId === args.activityId &&
          existingSubmissionData.mode === args.submissionData.mode &&
          JSON.stringify(existingSubmissionData.answers) ===
            JSON.stringify(args.submissionData.answers) &&
          JSON.stringify(existingSubmissionData.artifact ?? null) ===
            JSON.stringify(args.submissionData.artifact ?? null);
        if (!sameCanonicalSubmission) {
          throw new Error("idempotency_conflict");
        }
        return {
          id: existing._id,
          attemptOrdinal: existing.attemptOrdinal,
          score: existing.score,
          maxScore: existing.maxScore,
          feedback: existing.feedback,
        };
      }
    }

    if (stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID) {
      const now = Date.now();
      const latestQuery = ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_activity_and_attempt_ordinal", (query) =>
          query.eq("userId", args.userId).eq("activityId", args.activityId),
        );
      const latest = await latestQuery.order("desc").first();
      const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
      const submittedAt = new Date(now).toISOString();
      const storedParts = args.submissionData.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...(part.normalizedAnswer !== undefined ? { normalizedAnswer: part.normalizedAnswer } : {}),
      }));
      const storedSubmissionData = {
        ...args.submissionData,
        activityId: String(args.activityId),
        status: "graded" as const,
        attemptNumber: attemptOrdinal,
        submittedAt,
        parts: storedParts,
      };

      const id = await ctx.db.insert("activity_submissions", {
        userId: args.userId,
        activityId: args.activityId,
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        submissionData: storedSubmissionData,
        masteryContractVersion: "learning-evidence.v1",
        ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
        score: args.score,
        maxScore: args.maxScore,
        feedback: args.feedback,
        attemptOrdinal,
        submittedAt: now,
        gradedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id,
        attemptOrdinal,
        score: args.score,
        maxScore: args.maxScore,
        feedback: args.feedback,
      };
    }

    const now = Date.now();
    if (!activity) throw new Error("activity_unavailable");
    const prior = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity", (q) =>
        q.eq("userId", args.userId).eq("activityId", args.activityId),
      )
      .collect();
    const limit = activity.props.maxAttempts ?? activity.gradingConfig?.maxAttempts;
    if (
      args.submissionData.status !== "draft" &&
      typeof limit === "number" &&
      prior.filter((row) => row.submissionData?.status !== "draft").length >= limit
    )
      throw new Error("attempt_limit_reached");
    const attemptOrdinal = prior.length + 1;
    const submissionData = {
      ...args.submissionData,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      status:
        args.submissionData.status === "draft"
          ? ("draft" as const)
          : args.maxScore
            ? ("graded" as const)
            : ("submitted" as const),
      parts: args.submissionData.parts.map(({ partId, rawAnswer }) => ({ partId, rawAnswer })),
    };
    const id = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData,
      ...(idempotencyKey ? { idempotencyKey } : {}),
      attemptOrdinal,
      score: args.score,
      maxScore: args.maxScore,
      feedback: args.feedback,
      submittedAt: now,
      ...(args.maxScore ? { gradedAt: now } : {}),
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      attemptOrdinal,
      score: args.score,
      maxScore: args.maxScore,
      feedback: args.feedback,
    };
  },
});

const accountingEquationEventSubmissionResultValidator = v.union(
  v.object({
    submissionId: v.id("activity_submissions"),
    acknowledged: v.literal(true),
    attemptOrdinal: v.number(),
  }),
  v.object({
    submissionId: v.id("activity_submissions"),
    score: v.number(),
    maxScore: v.number(),
    hintsUsed: v.number(),
    manualReviewRequired: v.literal(true),
    attemptOrdinal: v.number(),
  }),
);

function sameEventSubmission(
  existing: { stableActivityId?: string; submissionData: unknown },
  stableActivityId: string,
  submissionData: unknown,
): boolean {
  if (
    existing.stableActivityId !== stableActivityId ||
    typeof existing.submissionData !== "object" ||
    existing.submissionData === null ||
    typeof submissionData !== "object" ||
    submissionData === null
  )
    return false;
  const stored = existing.submissionData as Record<string, unknown>;
  const incoming = submissionData as Record<string, unknown>;
  const canonicalParts = (value: unknown) =>
    Array.isArray(value)
      ? value.map((part) => {
          if (typeof part !== "object" || part === null) return part;
          const candidate = part as Record<string, unknown>;
          return {
            partId: candidate.partId,
            rawAnswer: candidate.rawAnswer,
            ...(candidate.hintsUsed === undefined ? {} : { hintsUsed: candidate.hintsUsed }),
            ...(candidate.revealStepsSeen === undefined
              ? {}
              : { revealStepsSeen: candidate.revealStepsSeen }),
            ...(candidate.changedCount === undefined
              ? {}
              : { changedCount: candidate.changedCount }),
          };
        })
      : value;
  return (
    stored.mode === incoming.mode &&
    normalizePracticeValue(stored.answers) === normalizePracticeValue(incoming.answers) &&
    normalizePracticeValue(canonicalParts(stored.parts)) ===
      normalizePracticeValue(canonicalParts(incoming.parts)) &&
    normalizePracticeValue(stored.artifact ?? null) ===
      normalizePracticeValue(incoming.artifact ?? null)
  );
}

/** Store one exact BM2 event response without creating learning evidence. */
export const createAccountingEquationEventSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    submissionData: practiceSubmissionEnvelopeValidator,
    idempotencyKey: v.string(),
  },
  returns: accountingEquationEventSubmissionResultValidator,
  handler: async (ctx, args) => {
    const learner = await ctx.db.get(args.userId);
    const credential = await ctx.db
      .query("auth_credentials")
      .withIndex("by_profile", (query) => query.eq("profileId", args.userId))
      .unique();
    if (learner?.role !== "student" || credential?.isActive !== true) {
      throw new Error("An active student profile is required");
    }
    if (!isBm2AccountingEquationEventPublished()) {
      throw new Error("BM2 accounting equation event is not published");
    }

    const mappedActivity = getBm2AccountingEquationEventActivity(args.activityId);
    if (
      !mappedActivity ||
      args.idempotencyKey.trim().length === 0 ||
      args.submissionData.activityId !== args.activityId ||
      args.submissionData.mode !== mappedActivity.mode ||
      args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid BM2 accounting equation event submission");
    }
    const storedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq("stableActivityId", mappedActivity.stableActivityId),
      )
      .unique();
    if (
      !storedActivity ||
      !isBm2AccountingEquationEventStoredActivity(mappedActivity, storedActivity)
    ) {
      throw new Error("BM2 accounting equation event activity metadata is invalid");
    }

    const isWorked = mappedActivity.mode === "worked_example";
    if (isWorked) {
      const artifact = args.submissionData.artifact;
      if (
        Object.keys(args.submissionData.answers).length !== 0 ||
        args.submissionData.parts.length !== 0 ||
        !artifact ||
        Object.keys(artifact).length !== 1 ||
        artifact.kind !== "accounting-equation-event-acknowledgement"
      ) {
        throw new Error("Invalid BM2 Worked acknowledgement");
      }
    }

    const grade = isWorked ? null : gradeAccountingEquationEventSubmission(args.submissionData);
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_idempotency_key", (query) =>
        query.eq("userId", args.userId).eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) {
      if (!sameEventSubmission(existing, args.activityId, args.submissionData)) {
        throw new Error("idempotency_conflict");
      }
      if (isWorked) {
        return {
          submissionId: existing._id,
          acknowledged: true as const,
          attemptOrdinal: existing.attemptOrdinal ?? 1,
        };
      }
      if (!grade || existing.score === undefined || existing.maxScore === undefined) {
        throw new Error("Stored BM2 event submission is incomplete");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        hintsUsed: grade.hintsUsed,
        manualReviewRequired: true as const,
        attemptOrdinal: existing.attemptOrdinal ?? 1,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) =>
        query.eq("userId", args.userId).eq("activityId", storedActivity._id),
      )
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    if (isWorked) {
      const submissionId = await ctx.db.insert("activity_submissions", {
        userId: args.userId,
        activityId: storedActivity._id,
        stableActivityId: args.activityId,
        idempotencyKey: args.idempotencyKey,
        attemptOrdinal,
        submissionData: {
          ...args.submissionData,
          attemptNumber: attemptOrdinal,
          submittedAt: new Date(now).toISOString(),
        },
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      return { submissionId, acknowledged: true as const, attemptOrdinal };
    }

    if (!grade) throw new Error("BM2 event grade is unavailable");
    const submittedParts = new Map(args.submissionData.parts.map((part) => [part.partId, part]));
    const gradedParts: typeof args.submissionData.parts = grade.parts.map((part) => {
      const submitted = submittedParts.get(part.partId);
      return {
        ...part,
        ...(submitted?.hintsUsed === undefined ? {} : { hintsUsed: submitted.hintsUsed }),
        ...(submitted?.revealStepsSeen === undefined
          ? {}
          : { revealStepsSeen: submitted.revealStepsSeen }),
        ...(submitted?.changedCount === undefined ? {} : { changedCount: submitted.changedCount }),
      };
    });
    const submittedExplanation = submittedParts.get(grade.manualReview.partId);
    gradedParts.push({
      partId: grade.manualReview.partId,
      rawAnswer: grade.manualReview.rawAnswer,
      ...(submittedExplanation?.hintsUsed === undefined
        ? {}
        : { hintsUsed: submittedExplanation.hintsUsed }),
      ...(submittedExplanation?.revealStepsSeen === undefined
        ? {}
        : { revealStepsSeen: submittedExplanation.revealStepsSeen }),
      ...(submittedExplanation?.changedCount === undefined
        ? {}
        : { changedCount: submittedExplanation.changedCount }),
    });
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: storedActivity._id,
      stableActivityId: args.activityId,
      idempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      ...(mappedActivity.canCreateApplicationEvidence
        ? { masteryContractVersion: "learning-evidence.v1" }
        : {}),
      submissionData: {
        ...args.submissionData,
        status: "graded" as const,
        attemptNumber: attemptOrdinal,
        submittedAt: new Date(now).toISOString(),
        parts: gradedParts,
      },
      score: grade.automaticScore,
      maxScore: grade.automaticMaxScore,
      feedback: "Your work is saved for teacher review.",
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: grade.automaticScore,
      maxScore: grade.automaticMaxScore,
      hintsUsed: grade.hintsUsed,
      manualReviewRequired: true as const,
      attemptOrdinal,
    };
  },
});

const GENERATED_ACCOUNTING_VARIANT = /^accounting-equation-(\d+)-(assets|liabilities|equity)$/;

const bm2ServerOwnedSubmissionResultValidator = v.object({
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
  feedback: v.string(),
  attemptOrdinal: v.number(),
});

type AccountingEquationTermId = "assets" | "liabilities" | "equity";

function parseGeneratedAccountingVariant(activityId: string): {
  seed: number;
  hiddenTermId: AccountingEquationTermId;
} | null {
  const match = GENERATED_ACCOUNTING_VARIANT.exec(activityId);
  if (!match) return null;

  const seed = Number(match[1]);
  const hiddenTermId = match[2];
  if (hiddenTermId !== "assets" && hiddenTermId !== "liabilities" && hiddenTermId !== "equity") {
    return null;
  }
  if (!Number.isSafeInteger(seed) || seed < 0) return null;
  return { seed, hiddenTermId };
}

/**
 * Creates a server-owned BM2 submission for a generated accounting variant.
 * The server reconstructs the problem from the opaque activity identity and
 * grades the raw answer. Client grade fields never enter the stored result.
 */
export const createServerOwnedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    submissionData: practiceSubmissionEnvelopeValidator,
    idempotencyKey: v.string(),
  },
  returns: bm2ServerOwnedSubmissionResultValidator,
  handler: async (ctx, args) => {
    if (!isBm2PilotPublished()) {
      throw new Error("BM2 accounting-equation pilot is not published");
    }
    const variant = parseGeneratedAccountingVariant(args.activityId);
    if (!variant || args.submissionData.activityId !== args.activityId) {
      throw new Error("Invalid generated BM2 accounting-equation activity");
    }
    if (
      args.submissionData.mode !== "independent_practice" ||
      args.submissionData.status !== "submitted"
    ) {
      throw new Error(
        "Generated BM2 submissions require independent_practice and submitted status",
      );
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = args.submissionData.answers;
    if (Object.keys(answers).length !== 1) {
      throw new Error("Generated BM2 submissions require one hidden-term answer");
    }
    if (!Object.prototype.hasOwnProperty.call(answers, variant.hiddenTermId)) {
      throw new Error("Generated BM2 submission answer does not match the activity variant");
    }
    if (args.submissionData.parts.length !== 1) {
      throw new Error("Generated BM2 submissions require one submitted part");
    }
    const submittedPart = args.submissionData.parts[0];
    if (
      submittedPart.partId !== variant.hiddenTermId ||
      submittedPart.rawAnswer !== answers[variant.hiddenTermId]
    ) {
      throw new Error("Generated BM2 submission part does not match the answer");
    }

    const sourceActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq("stableActivityId", BM2_PILOT_SOURCE_ACTIVITY_ID),
      )
      .unique();
    if (!sourceActivity) {
      throw new Error("BM2 pilot source activity is not provisioned");
    }
    if (sourceActivity.componentKey !== "notebook-organizer") {
      throw new Error("BM2 pilot source activity metadata is invalid");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_idempotency_key", (query) =>
        query.eq("userId", args.userId).eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) {
      const existingAnswers = existing.submissionData.answers;
      if (
        existing.stableActivityId !== args.activityId ||
        existing.submissionData.mode !== "independent_practice" ||
        existingAnswers[variant.hiddenTermId] !== answers[variant.hiddenTermId]
      ) {
        throw new Error("idempotency_conflict");
      }
      if (
        existing.score === undefined ||
        existing.maxScore === undefined ||
        existing.feedback === undefined ||
        existing.attemptOrdinal === undefined
      ) {
        throw new Error("Stored BM2 submission is incomplete");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        feedback: existing.feedback,
        attemptOrdinal: existing.attemptOrdinal,
      };
    }

    const definition = accountingEquationFamily.generate(variant.seed, {
      mode: "independent_practice",
      hiddenTermId: variant.hiddenTermId,
    });
    if (definition.activityId !== args.activityId) {
      throw new Error("Generated BM2 activity identity does not reconstruct");
    }
    const grade = accountingEquationFamily.grade(definition, {
      [variant.hiddenTermId]: answers[variant.hiddenTermId],
    });
    const feedback =
      grade.feedback ??
      (grade.score === grade.maxScore
        ? "Correct equation balance."
        : "Recheck the accounting equation.");
    const storedParts = grade.parts.map((part) => {
      const rawAnswer = answers[part.partId];
      if (rawAnswer === undefined) {
        throw new Error("Generated BM2 grade is missing a submitted raw answer");
      }
      return {
        ...part,
        rawAnswer,
      };
    });

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) =>
        query.eq("userId", args.userId).eq("activityId", sourceActivity._id),
      )
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const storedSubmissionData: typeof args.submissionData = {
      ...args.submissionData,
      activityId: BM2_PILOT_PROBLEM_FAMILY_ID,
      mode: "independent_practice",
      status: "graded",
      attemptNumber: attemptOrdinal,
      parts: storedParts,
    };

    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: sourceActivity._id,
      stableActivityId: args.activityId,
      submissionData: storedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      idempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: grade.score,
      maxScore: grade.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return {
      submissionId,
      score: grade.score,
      maxScore: grade.maxScore,
      feedback,
      attemptOrdinal,
    };
  },
});
