import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  gradeIM1VerbalToNumerical,
  projectIM1VerbalToNumerical,
} from "@math-platform/math-content/knowledge-space";
import {
  LEARNING_EVIDENCE_CONTRACT_VERSION,
  learningEvidenceV1Schema,
  evaluateLearningEvidenceV1,
  toConvexActivityId,
} from "@math-platform/practice-core";
import { processReview } from "@math-platform/srs-engine";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";

export const IM1_TRANSLATION_NODE_ID =
  "math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express";

type PilotPublication = {
  nodes: ReadonlyArray<{
    id: string;
    kind?: string;
    reviewStatus?: string;
    independentPracticeReady?: boolean;
  }>;
  blueprints: ReadonlyArray<{ nodeId: string; reviewStatus?: string }>;
};

const currentPilotPublication: PilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};

export function isTranslationPilotPublished(
  publication: PilotPublication = currentPilotPublication,
) {
  const node = publication.nodes.find((row) => row.id === IM1_TRANSLATION_NODE_ID);
  const blueprint = publication.blueprints.find((row) => row.nodeId === IM1_TRANSLATION_NODE_ID);
  return (
    node?.kind === "skill" &&
    node.reviewStatus === "approved" &&
    blueprint?.reviewStatus === "approved"
  );
}

export function isTranslationPilotReady(publication: PilotPublication = currentPilotPublication) {
  return (
    isTranslationPilotPublished(publication) &&
    publication.nodes.find((node) => node.id === IM1_TRANSLATION_NODE_ID)
      ?.independentPracticeReady === true
  );
}

export const getProfileByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    return profile;
  },
});

export const getApprovedTranslationPilot = internalQuery({
  returns: v.array(
    v.object({
      activityId: v.string(),
      stableActivityId: v.string(),
      masteryNodeId: v.string(),
      mode: v.union(
        v.literal("worked_example"),
        v.literal("guided_practice"),
        v.literal("independent_practice"),
      ),
      componentKey: v.string(),
      props: v.any(),
    }),
  ),
  args: { studentId: v.id("profiles") },
  handler: (ctx, args) => getApprovedTranslationPilotHandler(ctx, args),
});

export async function getApprovedTranslationPilotHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles"> },
  publication: PilotPublication = currentPilotPublication,
) {
  if (!isTranslationPilotPublished(publication)) return [];
  const [profile, credential] = await Promise.all([
    ctx.db.get(args.studentId),
    ctx.db
      .query("auth_credentials")
      .withIndex("by_profile", (q) => q.eq("profileId", args.studentId))
      .unique(),
  ]);
  if (!profile || profile.role !== "student" || !credential?.isActive) return [];
  const rows = await Promise.all(
    ["worked_example", "guided_practice", "independent_practice"].map((mode) =>
      ctx.db
        .query("activities")
        .withIndex("by_stable_activity_id", (q) =>
          q.eq("stableActivityId", `${IM1_TRANSLATION_NODE_ID}.${mode}`),
        )
        .unique(),
    ),
  );
  if (
    rows.some(
      (row, index) =>
        !row ||
        row.approval?.status !== "approved" ||
        row.masteryNodeId !== IM1_TRANSLATION_NODE_ID ||
        row.learningEvidenceMode !==
          ["worked_example", "guided_practice", "independent_practice"][index] ||
        row.componentKey !== "fill-in-the-blank" ||
        row.generatorSeed === undefined ||
        row.generatorDifficulty === undefined,
    )
  )
    return [];
  const independent = rows[2]!;
  const submissions = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_and_activity", (q) =>
      q.eq("userId", args.studentId).eq("activityId", independent._id),
    )
    .collect();
  const completed = submissions.some(
    (submission) =>
      submission.score !== undefined &&
      submission.score === submission.maxScore &&
      (submission.submissionData as { seed?: unknown; mode?: unknown })?.seed ===
        independent.generatorSeed &&
      (submission.submissionData as { seed?: unknown; mode?: unknown })?.mode ===
        "independent_practice",
  );
  if (completed) return [];
  return rows.map((row) => {
    const projection = projectIM1VerbalToNumerical(
      {
        nodeId: IM1_TRANSLATION_NODE_ID,
        seed: row!.generatorSeed!,
        difficulty: row!.generatorDifficulty!,
      },
      row!.learningEvidenceMode!,
      row!.stableActivityId!,
    );
    return {
      activityId: String(row!._id),
      stableActivityId: row!.stableActivityId!,
      masteryNodeId: row!.masteryNodeId!,
      mode: row!.learningEvidenceMode!,
      componentKey: projection.componentKey,
      props: projection.props,
    };
  });
}

type PilotSubmissionArgs = {
  userId: Id<"profiles">;
  activityId: Id<"activities">;
  idempotencyKey: string;
  rawResponse: string;
  hintsUsed: number;
  revealStepsSeen: number;
};

export async function recordTeacherTranslationExposureHandler(
  ctx: MutationCtx,
  args: {
    teacherId: Id<"profiles">;
    studentId: Id<"profiles">;
    classId: Id<"classes">;
    submissionId: Id<"activity_submissions">;
    idempotencyKey: string;
  },
  publication: PilotPublication = currentPilotPublication,
) {
  const key = args.idempotencyKey.trim();
  if (!key) throw new Error("invalid_exposure");
  const [teacher, student, classRow, enrollment, submission] = await Promise.all([
    ctx.db.get(args.teacherId),
    ctx.db.get(args.studentId),
    ctx.db.get(args.classId),
    ctx.db
      .query("class_enrollments")
      .withIndex("by_class_and_student", (q) =>
        q.eq("classId", args.classId).eq("studentId", args.studentId),
      )
      .unique(),
    ctx.db.get(args.submissionId),
  ]);
  if (!isTranslationPilotPublished(publication)) throw new Error("unpublished_curriculum");
  if (
    !teacher ||
    teacher.role !== "teacher" ||
    !student ||
    student.role !== "student" ||
    !classRow ||
    classRow.teacherId !== args.teacherId ||
    classRow.archived ||
    enrollment?.status !== "active"
  )
    throw new Error("unauthorized_exposure");
  if (!submission || submission.userId !== args.studentId)
    throw new Error("invalid_source_submission");
  const activity = await ctx.db.get(submission.activityId);
  if (
    !activity ||
    activity.masteryNodeId !== IM1_TRANSLATION_NODE_ID ||
    activity.approval?.status !== "approved" ||
    activity.learningEvidenceMode !== "guided_practice" ||
    activity.stableActivityId !== `${IM1_TRANSLATION_NODE_ID}.guided_practice` ||
    submission.gradedAt === undefined
  )
    throw new Error("invalid_source_submission");
  const lesson = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (q) => q.eq("slug", "module-1-lesson-1"))
    .unique();
  const assignment = lesson
    ? await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) =>
          q.eq("classId", args.classId).eq("lessonId", lesson._id),
        )
        .unique()
    : null;
  if (
    !assignment ||
    submission.submittedAt < Math.max(enrollment.enrolledAt, assignment.assignedAt)
  )
    throw new Error("invalid_source_assignment");
  const sourceEvidence = await ctx.db
    .query("learning_evidence")
    .withIndex("by_learner_and_submission_id", (q) =>
      q.eq("learnerId", args.studentId).eq("submissionId", args.submissionId),
    )
    .collect();
  const sameSource = sourceEvidence.find((row) => row.origin === "teacher_led");
  if (sameSource) {
    if (sameSource.origin !== "teacher_led") throw new Error("source_already_used");
    return { evidenceId: sameSource._id, replay: true };
  }
  const existing = await ctx.db
    .query("learning_evidence")
    .withIndex("by_learner_and_idempotency_key", (q) =>
      q.eq("learnerId", args.studentId).eq("idempotencyKey", key),
    )
    .unique();
  if (existing) {
    if (existing.submissionId !== args.submissionId || existing.origin !== "teacher_led")
      throw new Error("idempotency_conflict");
    return { evidenceId: existing._id, replay: true };
  }
  const occurredAt = new Date().toISOString();
  const evidenceId = await ctx.db.insert("learning_evidence", {
    learnerId: args.studentId,
    nodeId: IM1_TRANSLATION_NODE_ID,
    submissionId: args.submissionId,
    activityId: activity.stableActivityId,
    attemptOrdinal: submission.attemptOrdinal ?? 1,
    origin: "teacher_led",
    mode: "guided_practice",
    occurredAt,
    idempotencyKey: key,
    masteryBearing: false,
    createdAt: Date.parse(occurredAt),
  });
  return { evidenceId, replay: false };
}

export const recordTeacherTranslationExposure = internalMutation({
  args: {
    teacherId: v.id("profiles"),
    studentId: v.id("profiles"),
    classId: v.id("classes"),
    submissionId: v.id("activity_submissions"),
    idempotencyKey: v.string(),
  },
  returns: v.object({ evidenceId: v.id("learning_evidence"), replay: v.boolean() }),
  handler: recordTeacherTranslationExposureHandler,
});

export const getTeacherTranslationExposureCandidates = internalQuery({
  args: { teacherId: v.id("profiles") },
  returns: v.array(
    v.object({
      classId: v.id("classes"),
      studentId: v.id("profiles"),
      submissionId: v.id("activity_submissions"),
      className: v.string(),
      studentName: v.string(),
      lessonTitle: v.string(),
      answer: v.string(),
      score: v.number(),
      maxScore: v.number(),
      submittedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    if (!isTranslationPilotPublished()) return [];
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.role !== "teacher") return [];
    const classes = (
      await ctx.db
        .query("classes")
        .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
        .collect()
    ).filter((row) => !row.archived);
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", "module-1-lesson-1"))
      .unique();
    if (!lesson) return [];
    const guided = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (q) =>
        q.eq("stableActivityId", `${IM1_TRANSLATION_NODE_ID}.guided_practice`),
      )
      .unique();
    if (
      !guided ||
      guided.approval?.status !== "approved" ||
      guided.masteryNodeId !== IM1_TRANSLATION_NODE_ID ||
      guided.learningEvidenceMode !== "guided_practice" ||
      guided.componentKey !== "fill-in-the-blank"
    )
      return [];
    const result = [];
    for (const classroom of classes) {
      const assignment = await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) =>
          q.eq("classId", classroom._id).eq("lessonId", lesson._id),
        )
        .unique();
      if (!assignment) continue;
      const enrollments = (
        await ctx.db
          .query("class_enrollments")
          .withIndex("by_class", (q) => q.eq("classId", classroom._id))
          .collect()
      ).filter((row) => row.status === "active");
      for (const enrollment of enrollments) {
        const student = await ctx.db.get(enrollment.studentId);
        if (!student) continue;
        const submissions = await ctx.db
          .query("activity_submissions")
          .withIndex("by_user_and_activity", (q) =>
            q.eq("userId", enrollment.studentId).eq("activityId", guided._id),
          )
          .collect();
        for (const submission of submissions.filter(
          (row) =>
            row.gradedAt !== undefined &&
            row.submittedAt >= Math.max(enrollment.enrolledAt, assignment.assignedAt),
        )) {
          const evidence = await ctx.db
            .query("learning_evidence")
            .withIndex("by_learner_and_submission_id", (q) =>
              q.eq("learnerId", enrollment.studentId).eq("submissionId", submission._id),
            )
            .collect();
          if (evidence.some((row) => row.origin === "teacher_led")) continue;
          const data = submission.submissionData as { rawResponse?: unknown };
          result.push({
            classId: classroom._id,
            studentId: enrollment.studentId,
            submissionId: submission._id,
            className: classroom.name,
            studentName: student.displayName ?? student.username,
            lessonTitle: lesson.title,
            answer: typeof data.rawResponse === "string" ? data.rawResponse : "",
            score: submission.score ?? 0,
            maxScore: submission.maxScore ?? 1,
            submittedAt: submission.submittedAt,
          });
        }
      }
    }
    return result;
  },
});

export async function submitTranslationPilotHandler(
  ctx: MutationCtx,
  args: PilotSubmissionArgs,
  publication: PilotPublication = currentPilotPublication,
) {
  const idempotencyKey = args.idempotencyKey.trim();
  if (!idempotencyKey) throw new Error("invalid_submission");
  const [profile, activity, credential] = await Promise.all([
    ctx.db.get(args.userId),
    ctx.db.get(args.activityId),
    ctx.db
      .query("auth_credentials")
      .withIndex("by_profile", (q) => q.eq("profileId", args.userId))
      .unique(),
  ]);
  if (!profile || profile.role !== "student" || !credential?.isActive)
    throw new Error("inactive_student");
  if (!isTranslationPilotPublished(publication)) throw new Error("unpublished_curriculum");
  if (
    !activity ||
    activity.masteryNodeId !== IM1_TRANSLATION_NODE_ID ||
    activity.stableActivityId !== `${IM1_TRANSLATION_NODE_ID}.${activity.learningEvidenceMode}` ||
    activity.componentKey !== "fill-in-the-blank" ||
    activity.generatorSeed === undefined ||
    activity.generatorDifficulty === undefined ||
    !activity.learningEvidenceMode
  )
    throw new Error("unsupported_activity");
  if (activity.approval?.status !== "approved") throw new Error("unapproved_activity");
  if (activity.learningEvidenceMode === "worked_example" && activity.srsEligible !== false)
    throw new Error("invalid_mode_policy");
  const existing = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_idempotency_key", (q) =>
      q
        .eq("userId", args.userId)
        .eq("activityId", args.activityId)
        .eq("idempotencyKey", idempotencyKey),
    )
    .unique();
  if (existing) {
    const stored = existing.submissionData as {
      rawResponse?: unknown;
      hintsUsed?: unknown;
      revealStepsSeen?: unknown;
    };
    if (
      stored.rawResponse !== args.rawResponse ||
      stored.hintsUsed !== args.hintsUsed ||
      stored.revealStepsSeen !== args.revealStepsSeen
    )
      throw new Error("idempotency_conflict");
    if ((existing.submissionData as { mode?: unknown }).mode === "worked_example")
      return {
        kind: "acknowledged" as const,
        submissionId: existing._id,
        evidencePersisted: false as const,
      };
    const evidenceRows = await ctx.db
      .query("learning_evidence")
      .withIndex("by_learner_and_submission_id", (q) =>
        q.eq("learnerId", args.userId).eq("submissionId", existing._id),
      )
      .collect();
    const evidence = evidenceRows.find((row) => row.origin === "mastery_advantage");
    return {
      kind: "graded" as const,
      submissionId: existing._id,
      score: existing.score!,
      maxScore: existing.maxScore!,
      evidencePersisted: evidence !== null,
      masteryBearing: evidence?.masteryBearing === true,
    };
  }
  const latest = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_attempt_ordinal", (q) =>
      q.eq("userId", args.userId).eq("activityId", args.activityId),
    )
    .order("desc")
    .first();
  const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
  const now = Date.now(),
    occurredAt = new Date(now).toISOString();
  const submissionData = {
    rawResponse: args.rawResponse,
    hintsUsed: args.hintsUsed,
    revealStepsSeen: args.revealStepsSeen,
    seed: activity.generatorSeed,
    mode: activity.learningEvidenceMode,
  };
  if (activity.learningEvidenceMode === "worked_example") {
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      attemptOrdinal,
      idempotencyKey,
    });
    return { kind: "acknowledged" as const, submissionId, evidencePersisted: false as const };
  }
  const grade = gradeIM1VerbalToNumerical(
    {
      nodeId: IM1_TRANSLATION_NODE_ID,
      seed: activity.generatorSeed,
      difficulty: activity.generatorDifficulty,
    },
    { expression: args.rawResponse },
  );
  const submissionId = await ctx.db.insert("activity_submissions", {
    userId: args.userId,
    activityId: args.activityId,
    submissionData,
    score: grade.score,
    maxScore: grade.maxScore,
    submittedAt: now,
    gradedAt: now,
    createdAt: now,
    updatedAt: now,
    attemptOrdinal,
    idempotencyKey,
    masteryContractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION,
  });
  const evidence = learningEvidenceV1Schema.parse({
    contractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION,
    nodeId: activity.masteryNodeId,
    activityId: activity.stableActivityId,
    attemptOrdinal,
    origin: "mastery_advantage",
    mode: activity.learningEvidenceMode,
    occurredAt,
    gradedEvidence: {
      isCorrect: grade.score === grade.maxScore,
      score: grade.score,
      maxScore: grade.maxScore,
    },
    idempotencyKey,
  });
  const history = await ctx.db
    .query("learning_evidence")
    .withIndex("by_learner_and_node", (q) =>
      q.eq("learnerId", args.userId).eq("nodeId", activity.masteryNodeId!),
    )
    .collect();
  const acceptedEvidence = history.map((row) =>
    learningEvidenceV1Schema.parse({
      contractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION,
      nodeId: row.nodeId,
      activityId: row.activityId,
      attemptOrdinal: row.attemptOrdinal,
      origin: row.origin,
      mode: row.mode,
      occurredAt: row.occurredAt,
      gradedEvidence: row.gradedEvidence,
      idempotencyKey: row.idempotencyKey,
    }),
  );
  const decision = evaluateLearningEvidenceV1({
    evidence,
    acceptedEvidence,
    enabledNodeIds:
      isTranslationPilotReady(publication) && activity.srsEligible === true
        ? [IM1_TRANSLATION_NODE_ID]
        : [],
  });
  const masteryBearing =
    decision.masteryBearing &&
    activity.learningEvidenceMode === "independent_practice" &&
    args.hintsUsed === 0 &&
    args.revealStepsSeen === 0;
  await ctx.db.insert("learning_evidence", {
    learnerId: args.userId,
    nodeId: evidence.nodeId,
    submissionId,
    activityId: evidence.activityId,
    attemptOrdinal,
    origin: evidence.origin,
    mode: evidence.mode,
    occurredAt,
    gradedEvidence: evidence.gradedEvidence,
    idempotencyKey,
    masteryBearing,
    createdAt: now,
  });
  if (masteryBearing) {
    const existingCard = await ctx.db
      .query("srs_cards")
      .withIndex("by_student_and_objective", (q) =>
        q.eq("studentId", args.userId).eq("objectiveId", IM1_TRANSLATION_NODE_ID),
      )
      .unique();
    const createdAt = existingCard ? new Date(existingCard.createdAt).toISOString() : occurredAt;
    const card = {
      cardId: existingCard ? String(existingCard._id) : `pending:${submissionId}`,
      studentId: String(args.userId),
      objectiveId: IM1_TRANSLATION_NODE_ID,
      variantKey: "im1-verbal-to-numerical",
      stability: existingCard?.stability ?? 0,
      difficulty: existingCard?.difficulty ?? 0,
      state: existingCard?.state ?? ("new" as const),
      dueDate: existingCard?.dueDate ?? occurredAt,
      elapsedDays: existingCard?.elapsedDays ?? 0,
      scheduledDays: existingCard?.scheduledDays ?? 0,
      reps: existingCard?.reps ?? 0,
      lapses: existingCard?.lapses ?? 0,
      lastReview: existingCard?.lastReview ?? null,
      createdAt,
      updatedAt: existingCard ? new Date(existingCard.updatedAt).toISOString() : occurredAt,
    };
    const review = processReview({
      card,
      submission: {
        contractVersion: "practice.v1",
        activityId: toConvexActivityId(activity.stableActivityId),
        mode: activity.learningEvidenceMode,
        status: "graded",
        submittedAt: occurredAt,
        attemptNumber: attemptOrdinal,
        answers: { expression: args.rawResponse },
        parts: [
          {
            partId: "expression",
            rawAnswer: args.rawResponse,
            isCorrect: grade.score === grade.maxScore,
            score: grade.score,
            maxScore: grade.maxScore,
            hintsUsed: args.hintsUsed,
            revealStepsSeen: args.revealStepsSeen,
          },
        ],
      },
      now: occurredAt,
    });
    const next = review.updatedCard;
    const cardId =
      existingCard?._id ??
      (await ctx.db.insert("srs_cards", {
        studentId: args.userId,
        objectiveId: IM1_TRANSLATION_NODE_ID,
        problemFamilyId: next.variantKey,
        stability: next.stability,
        difficulty: next.difficulty,
        state: next.state,
        dueDate: next.dueDate,
        elapsedDays: next.elapsedDays,
        scheduledDays: next.scheduledDays,
        reps: next.reps,
        lapses: next.lapses,
        lastReview: next.lastReview ?? undefined,
        createdAt: now,
        updatedAt: now,
      }));
    if (existingCard)
      await ctx.db.patch(existingCard._id, {
        stability: next.stability,
        difficulty: next.difficulty,
        state: next.state,
        dueDate: next.dueDate,
        elapsedDays: next.elapsedDays,
        scheduledDays: next.scheduledDays,
        reps: next.reps,
        lapses: next.lapses,
        lastReview: next.lastReview ?? undefined,
        updatedAt: now,
      });
    await ctx.db.insert("srs_review_log", {
      cardId,
      studentId: args.userId,
      rating: review.rating,
      reviewId: review.reviewLog.reviewId,
      submissionId: String(submissionId),
      evidence: review.reviewLog.evidence,
      stateBefore: review.reviewLog.stateBefore,
      stateAfter: review.reviewLog.stateAfter,
      reviewedAt: now,
    });
  }
  return {
    kind: "graded" as const,
    submissionId,
    score: grade.score,
    maxScore: grade.maxScore,
    evidencePersisted: true,
    masteryBearing,
  };
}

export const submitTranslationPilot = internalMutation({
  returns: v.union(
    v.object({
      kind: v.literal("acknowledged"),
      submissionId: v.id("activity_submissions"),
      evidencePersisted: v.literal(false),
    }),
    v.object({
      kind: v.literal("graded"),
      submissionId: v.id("activity_submissions"),
      score: v.number(),
      maxScore: v.number(),
      evidencePersisted: v.boolean(),
      masteryBearing: v.boolean(),
    }),
  ),
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    idempotencyKey: v.string(),
    rawResponse: v.string(),
    hintsUsed: v.number(),
    revealStepsSeen: v.number(),
  },
  handler: submitTranslationPilotHandler,
});
