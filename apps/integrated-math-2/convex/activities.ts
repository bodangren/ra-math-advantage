import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { processReview } from "@math-platform/srs-engine";
import { evaluateLearningEvidenceV1, LEARNING_EVIDENCE_CONTRACT_VERSION, learningEvidenceV1Schema, toConvexActivityId } from "@math-platform/practice-core";
import { gradePerpendicularBisector, nodeId, projectPerpendicularBisector } from "../lib/practice/perpendicular-bisector";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import { activeAccount } from "./auth";

type Publication = { nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string; independentPracticeReady?: boolean }>; blueprints: ReadonlyArray<{ nodeId: string; reviewStatus?: string; metadata?: { independentPracticeReady?: boolean } }> };
const currentPublication: Publication = { nodes: nodesDocument.nodes, blueprints: blueprintsDocument.blueprints };
export function isPilotPublished(publication: Publication = currentPublication) {
  const node = publication.nodes.find(row => row.id === nodeId);
  const blueprint = publication.blueprints.find(row => row.nodeId === nodeId);
  return node?.kind === "skill" && node.reviewStatus === "approved" && blueprint?.reviewStatus === "approved";
}
const modes = ["worked_example", "guided_practice", "independent_practice"] as const;

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

export async function getApprovedPilotHandler(ctx: QueryCtx, userId?: Id<"profiles">, publication: Publication = currentPublication) {
  if (!isPilotPublished(publication)) return [];
  if (userId) {
    const profile = await activeAccount(ctx, userId);
    if (!profile || profile.role !== "student") return [];
  }
  const rows = await Promise.all(modes.map(mode => ctx.db.query("activities").withIndex("by_stable_activity_id", q => q.eq("stableActivityId", `${nodeId}.${mode}`)).unique()));
  if (rows.some((row, index) => !row || row.approval?.status !== "approved" || row.masteryNodeId !== nodeId || row.learningEvidenceMode !== modes[index] || row.componentKey !== "im2-question" || row.generatorSeed === undefined || row.generatorDifficulty === undefined)) return [];
  if (userId) {
    const independent = rows[2]!;
    const completed = await ctx.db.query("activity_submissions").withIndex("by_user_and_activity", q => q.eq("userId", userId).eq("activityId", independent!._id)).collect();
    const correct = completed.filter(row => row.score !== undefined && row.maxScore !== undefined && row.score === row.maxScore);
    const accepted = await Promise.all(correct.map(async submission => {
      const evidence = await ctx.db.query("learning_evidence").withIndex("by_learner_and_submission_id", q => q.eq("learnerId", userId).eq("submissionId", submission._id)).collect();
      return evidence.some(row => row.nodeId === nodeId
        && row.activityId === independent.stableActivityId
        && row.attemptOrdinal === submission.attemptOrdinal
        && row.origin === "mastery_advantage"
        && row.mode === "independent_practice"
        && row.masteryBearing === true);
    }));
    if (accepted.some(Boolean)) return [];
  }
  return rows.map(row => ({ stableActivityId: row!.stableActivityId!, ...projectPerpendicularBisector({ nodeId, seed: row!.generatorSeed!, difficulty: row!.generatorDifficulty! }, row!.learningEvidenceMode!, String(row!._id)) }));
}
const pilotItemValidator = v.object({ stableActivityId: v.string(), activityId: v.string(), mode: v.union(v.literal("worked_example"), v.literal("guided_practice"), v.literal("independent_practice")), prompt: v.string(), answer: v.optional(v.number()), hint: v.optional(v.string()), solutionSteps: v.optional(v.array(v.object({ description: v.string(), expression: v.optional(v.string()), value: v.optional(v.number()) }))), stepPrompts: v.optional(v.array(v.string())), hints: v.optional(v.array(v.string())), revealPolicy: v.optional(v.literal("after_attempt")) });
export const getApprovedPerpendicularBisectorPilot = internalQuery({ args: { userId: v.id("profiles") }, returns: v.array(pilotItemValidator), handler: (ctx, args) => getApprovedPilotHandler(ctx, args.userId) });

type SubmitArgs = { userId: Id<"profiles">; activityId: Id<"activities">; idempotencyKey: string; rawResponse: string; hintsUsed: number; revealStepsSeen: number };
export async function recordTeacherExposureHandler(ctx: MutationCtx, args: { teacherId: Id<"profiles">; studentId: Id<"profiles">; classId: Id<"classes">; submissionId: Id<"activity_submissions">; idempotencyKey: string }, publication: Publication = currentPublication) {
  const key = args.idempotencyKey.trim(); if (!key) throw new Error("invalid_exposure");
  const [teacher, student, classroom, enrollment, submission] = await Promise.all([activeAccount(ctx, args.teacherId), activeAccount(ctx, args.studentId), ctx.db.get(args.classId), ctx.db.query("class_enrollments").withIndex("by_class_and_student", q => q.eq("classId", args.classId).eq("studentId", args.studentId)).unique(), ctx.db.get(args.submissionId)]);
  if (!isPilotPublished(publication)) throw new Error("unpublished_curriculum");
  if (!teacher || teacher.role !== "teacher" || !student || student.role !== "student" || student.organizationId !== teacher.organizationId || !classroom || classroom.teacherId !== args.teacherId || classroom.archived || enrollment?.status !== "active") throw new Error("unauthorized_exposure");
  if (!submission || submission.userId !== args.studentId) throw new Error("invalid_source_submission");
  const activity = await ctx.db.get(submission.activityId);
  if (!activity || activity.componentKey !== "im2-question" || activity.masteryNodeId !== nodeId || activity.approval?.status !== "approved" || activity.learningEvidenceMode !== "guided_practice" || activity.stableActivityId !== `${nodeId}.guided_practice` || submission.gradedAt === undefined) throw new Error("invalid_source_submission");
  const lesson = await ctx.db.query("lessons").withIndex("by_slug", q => q.eq("slug", "module-1-lesson-1")).unique();
  const assignment = lesson ? await ctx.db.query("class_lessons").withIndex("by_class_and_lesson", q => q.eq("classId", args.classId).eq("lessonId", lesson._id)).unique() : null;
  if (!lesson || submission.lessonId !== lesson._id || !assignment || submission.submittedAt < Math.max(enrollment.enrolledAt, assignment.assignedAt)) throw new Error("invalid_source_assignment");
  const sourceEvidence = await ctx.db.query("learning_evidence").withIndex("by_learner_and_submission_id", q => q.eq("learnerId", args.studentId).eq("submissionId", args.submissionId)).collect();
  const sameSource = sourceEvidence.find(row => row.origin === "teacher_led");
  const existing = await ctx.db.query("learning_evidence").withIndex("by_learner_and_idempotency_key", q => q.eq("learnerId", args.studentId).eq("idempotencyKey", key)).unique();
  const isCanonicalTeacherReceipt = (row: typeof existing) => row !== null
    && row.learnerId === args.studentId && row.submissionId === args.submissionId
    && row.nodeId === nodeId && row.activityId === activity.stableActivityId
    && row.attemptOrdinal === (submission.attemptOrdinal ?? 1)
    && row.origin === "teacher_led" && row.mode === "guided_practice"
    && row.masteryBearing === false;
  if (existing) { if (!isCanonicalTeacherReceipt(existing)) throw new Error("idempotency_conflict"); return { evidenceId: existing._id, replay: true }; }
  if (sameSource) { if (!isCanonicalTeacherReceipt(sameSource)) throw new Error("idempotency_conflict"); return { evidenceId: sameSource._id, replay: true }; }
  const now = Date.now(); const evidenceId = await ctx.db.insert("learning_evidence", { learnerId: args.studentId, nodeId, submissionId: args.submissionId, activityId: activity.stableActivityId, attemptOrdinal: submission.attemptOrdinal ?? 1, origin: "teacher_led", mode: "guided_practice", occurredAt: new Date(now).toISOString(), idempotencyKey: key, masteryBearing: false, createdAt: now });
  return { evidenceId, replay: false };
}
export const recordTeacherPerpendicularBisectorExposure = internalMutation({ args: { teacherId: v.id("profiles"), studentId: v.id("profiles"), classId: v.id("classes"), submissionId: v.id("activity_submissions"), idempotencyKey: v.string() }, returns: v.object({ evidenceId: v.id("learning_evidence"), replay: v.boolean() }), handler: recordTeacherExposureHandler });
export async function submitPilotHandler(ctx: MutationCtx, args: SubmitArgs, publication: Publication = currentPublication) {
  const key = args.idempotencyKey.trim();
  if (!key || args.rawResponse.length > 128) throw new Error("invalid_submission");
  const [profile, activity] = await Promise.all([activeAccount(ctx, args.userId), ctx.db.get(args.activityId)]);
  if (!profile || profile.role !== "student") throw new Error("inactive_student");
  if (!isPilotPublished(publication)) throw new Error("unpublished_curriculum");
  if (!activity || activity.approval?.status !== "approved" || activity.masteryNodeId !== nodeId || activity.stableActivityId !== `${nodeId}.${activity.learningEvidenceMode}` || activity.componentKey !== "im2-question" || activity.generatorSeed === undefined || activity.generatorDifficulty === undefined || !activity.learningEvidenceMode) throw new Error("unsupported_activity");
  const existing = await ctx.db.query("activity_submissions").withIndex("by_user_activity_idempotency_key", q => q.eq("userId", args.userId).eq("activityId", args.activityId).eq("idempotencyKey", key)).unique();
  if (existing) {
    const stored = existing.submissionData as { rawResponse?: unknown; hintsUsed?: unknown; revealStepsSeen?: unknown; mode?: unknown };
    if (stored.rawResponse !== args.rawResponse || stored.hintsUsed !== args.hintsUsed || stored.revealStepsSeen !== args.revealStepsSeen) throw new Error("idempotency_conflict");
    if (stored.mode === "worked_example") return { kind: "acknowledged" as const, submissionId: existing._id, evidencePersisted: false };
    const evidenceRows = await ctx.db.query("learning_evidence").withIndex("by_learner_and_submission_id", q => q.eq("learnerId", args.userId).eq("submissionId", existing._id)).collect();
    const evidence = evidenceRows.find(row => row.origin === "mastery_advantage");
    return { kind: "graded" as const, submissionId: existing._id, score: existing.score!, maxScore: existing.maxScore!, feedback: existing.feedback!, evidencePersisted: evidence !== undefined };
  }
  const prior = await ctx.db.query("activity_submissions").withIndex("by_user_activity_attempt_ordinal", q => q.eq("userId", args.userId).eq("activityId", args.activityId)).order("desc").first();
  const attemptOrdinal = (prior?.attemptOrdinal ?? 0) + 1, now = Date.now();
  const submissionData = { rawResponse: args.rawResponse, hintsUsed: args.hintsUsed, revealStepsSeen: args.revealStepsSeen, seed: activity.generatorSeed, mode: activity.learningEvidenceMode };
  if (activity.learningEvidenceMode === "worked_example") {
    const submissionId = await ctx.db.insert("activity_submissions", { userId: args.userId, activityId: args.activityId, submissionData, submittedAt: now, createdAt: now, updatedAt: now, attemptOrdinal, idempotencyKey: key });
    return { kind: "acknowledged" as const, submissionId, evidencePersisted: false };
  }
  const grade = gradePerpendicularBisector({ nodeId, seed: activity.generatorSeed, difficulty: activity.generatorDifficulty }, args.rawResponse);
  const sourceLesson = await ctx.db.query("lessons").withIndex("by_slug", q => q.eq("slug", "module-1-lesson-1")).unique();
  if (!sourceLesson) throw new Error("pilot_source_lesson_missing");
  const submissionId = await ctx.db.insert("activity_submissions", { userId: args.userId, activityId: args.activityId, lessonId: sourceLesson._id, submissionData, ...grade, submittedAt: now, gradedAt: now, createdAt: now, updatedAt: now, attemptOrdinal, idempotencyKey: key, masteryContractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION });
  const blueprint = publication.blueprints.find(row => row.nodeId === nodeId);
  const graphReady = publication.nodes.find(row => row.id === nodeId)?.independentPracticeReady === true && blueprint?.metadata?.independentPracticeReady === true;
  const evidenceCandidate = learningEvidenceV1Schema.parse({ contractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION, nodeId, activityId: activity.stableActivityId, attemptOrdinal, origin: "mastery_advantage", mode: activity.learningEvidenceMode, occurredAt: new Date(now).toISOString(), gradedEvidence: { isCorrect: grade.score === grade.maxScore, score: grade.score, maxScore: grade.maxScore }, idempotencyKey: key });
  const acceptedEvidence = (await ctx.db.query("learning_evidence").withIndex("by_learner_and_node", q => q.eq("learnerId", args.userId).eq("nodeId", nodeId)).collect()).map(row => learningEvidenceV1Schema.parse({ contractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION, nodeId: row.nodeId, activityId: row.activityId, attemptOrdinal: row.attemptOrdinal, origin: row.origin, mode: row.mode, occurredAt: row.occurredAt, gradedEvidence: row.gradedEvidence, idempotencyKey: row.idempotencyKey }));
  const decision = evaluateLearningEvidenceV1({ evidence: evidenceCandidate, acceptedEvidence, enabledNodeIds: [nodeId] });
  const evidenceAllowed = graphReady && activity.srsEligible === true && activity.learningEvidenceMode === "independent_practice" && args.hintsUsed === 0 && args.revealStepsSeen === 0 && decision.eligible;
  if (evidenceAllowed) {
    const evidence = evidenceCandidate;
    await ctx.db.insert("learning_evidence", { learnerId: args.userId, nodeId, submissionId, activityId: evidence.activityId, attemptOrdinal, origin: evidence.origin, mode: evidence.mode, occurredAt: evidence.occurredAt, gradedEvidence: evidence.gradedEvidence, idempotencyKey: key, masteryBearing: true, createdAt: now });
    const existingCard = await ctx.db.query("srs_cards").withIndex("by_student_and_objective", q => q.eq("studentId", args.userId).eq("objectiveId", nodeId)).unique();
    const at = evidence.occurredAt; const card = { cardId: existingCard ? String(existingCard._id) : `pending:${submissionId}`, studentId: String(args.userId), objectiveId: nodeId, variantKey: "im2-perpendicular-bisector", stability: existingCard?.stability ?? 0, difficulty: existingCard?.difficulty ?? 0, state: existingCard?.state ?? "new" as const, dueDate: existingCard?.dueDate ?? at, elapsedDays: existingCard?.elapsedDays ?? 0, scheduledDays: existingCard?.scheduledDays ?? 0, reps: existingCard?.reps ?? 0, lapses: existingCard?.lapses ?? 0, lastReview: existingCard?.lastReview ?? null, createdAt: existingCard ? new Date(existingCard.createdAt).toISOString() : at, updatedAt: existingCard ? new Date(existingCard.updatedAt).toISOString() : at };
    const review = processReview({ card, submission: { contractVersion: "practice.v1", activityId: toConvexActivityId(activity.stableActivityId), mode: "independent_practice", status: "graded", submittedAt: at, attemptNumber: attemptOrdinal, answers: { response: args.rawResponse }, parts: [{ partId: "response", rawAnswer: args.rawResponse, isCorrect: grade.score === grade.maxScore, score: grade.score, maxScore: grade.maxScore }] }, now: at }); const next = review.updatedCard;
    const cardId = existingCard?._id ?? await ctx.db.insert("srs_cards", { studentId: args.userId, objectiveId: nodeId, problemFamilyId: next.variantKey, stability: next.stability, difficulty: next.difficulty, state: next.state, dueDate: next.dueDate, elapsedDays: next.elapsedDays, scheduledDays: next.scheduledDays, reps: next.reps, lapses: next.lapses, lastReview: next.lastReview ?? undefined, createdAt: now, updatedAt: now });
    if (existingCard) await ctx.db.patch(existingCard._id, { stability: next.stability, difficulty: next.difficulty, state: next.state, dueDate: next.dueDate, elapsedDays: next.elapsedDays, scheduledDays: next.scheduledDays, reps: next.reps, lapses: next.lapses, lastReview: next.lastReview ?? undefined, updatedAt: now });
    await ctx.db.insert("srs_review_log", { cardId, studentId: args.userId, rating: review.rating, reviewId: review.reviewLog.reviewId, submissionId: String(submissionId), evidence: review.reviewLog.evidence, stateBefore: review.reviewLog.stateBefore, stateAfter: review.reviewLog.stateAfter, reviewedAt: now });
  }
  return { kind: "graded" as const, submissionId, ...grade, evidencePersisted: evidenceAllowed };
}
const submitResult = v.union(v.object({ kind: v.literal("acknowledged"), submissionId: v.id("activity_submissions"), evidencePersisted: v.boolean() }), v.object({ kind: v.literal("graded"), submissionId: v.id("activity_submissions"), score: v.number(), maxScore: v.number(), feedback: v.optional(v.string()), evidencePersisted: v.boolean() }));
export const submitPerpendicularBisectorPilot = internalMutation({ args: { userId: v.id("profiles"), activityId: v.id("activities"), idempotencyKey: v.string(), rawResponse: v.string(), hintsUsed: v.number(), revealStepsSeen: v.number() }, returns: submitResult, handler: submitPilotHandler });
