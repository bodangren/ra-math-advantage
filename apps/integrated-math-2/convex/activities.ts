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

import {
  gradeTrianglePart,
  projectTriangleItem,
  triangleItem,
  triangleModes,
  triangleNodeIds,
  type TriangleItem,
  type TriangleMode,
  type TriangleNodeId,
  type TrianglePart,
} from "../lib/practice/triangle-ordering";

type PublicTrianglePart = {
  id: string;
  prompt: string;
  kind: "choice" | "numeric";
  choices?: Array<{ id: string; text: string }>;
};
type PublicTriangle = {
  activityId: string;
  mode: TriangleMode;
  problem: number;
  figure: string;
  alt: string;
  prompt: string;
  authoredLabel?: string;
  answer?: string;
  solutionSteps?: string[];
  currentPart?: PublicTrianglePart;
  acceptedAnswers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
};
type PublicGrade = {
  partId: string;
  rawAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
};
type TriangleRequest = {
  answers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
};
type TriangleResponse = {
  kind: "graded";
  score: number;
  maxScore: number;
  feedback?: string;
  finalPart: boolean;
  complete: boolean;
  acceptedAnswers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
  nextPart?: PublicTrianglePart;
  hint?: string;
  parts?: PublicGrade[];
};
type TriangleArtifact = {
  currentPartId: string;
  finalPart: boolean;
  complete: boolean;
  hintsUsed: number;
  revealStepsSeen: number;
  nodeId: string;
  problem: number;
  request: TriangleRequest;
  response: TriangleResponse;
};
type StoredTriangleEnvelope = {
  contractVersion: "practice.v1";
  activityId: string;
  mode: TriangleMode;
  status: "graded";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, string>;
  parts: PublicGrade[];
  artifact: TriangleArtifact;
};
type TriangleState = {
  acceptedAnswers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
  index: number;
  complete: boolean;
};

const trianglePartPublic = v.object({
  id: v.string(),
  prompt: v.string(),
  kind: v.union(v.literal("choice"), v.literal("numeric")),
  choices: v.optional(v.array(v.object({ id: v.string(), text: v.string() }))),
});
const trianglePublic = v.object({
  activityId: v.string(),
  mode: v.union(
    v.literal("worked_example"),
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  problem: v.number(),
  figure: v.string(),
  alt: v.string(),
  prompt: v.string(),
  authoredLabel: v.optional(v.string()),
  answer: v.optional(v.string()),
  solutionSteps: v.optional(v.array(v.string())),
  currentPart: v.optional(trianglePartPublic),
  acceptedAnswers: v.record(v.string(), v.string()),
  hintsUsed: v.number(),
  revealStepsSeen: v.number(),
});
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const actual = Object.keys(value).sort();
  return (
    actual.length === keys.length &&
    actual.every((key, index) => key === [...keys].sort()[index])
  );
};
const sameAnswers = (
  left: Record<string, string>,
  right: Record<string, string>,
) =>
  exactKeys(left, Object.keys(right)) &&
  Object.entries(right).every(([key, value]) => left[key] === value);
function workedAcknowledgementRequest(
  row: Record<string, unknown>,
  userId: string,
  activityId: string,
  lessonId: string,
) {
  const submission = row.submissionData;
  if (
    row.userId !== userId ||
    row.activityId !== activityId ||
    row.lessonId !== lessonId ||
    typeof row.idempotencyKey !== "string" ||
    !row.idempotencyKey.trim() ||
    !Number.isSafeInteger(row.attemptOrdinal) ||
    (row.attemptOrdinal as number) < 1 ||
    !Number.isFinite(row.submittedAt) ||
    !Number.isFinite(row.createdAt) ||
    !Number.isFinite(row.updatedAt) ||
    row.score !== undefined ||
    row.maxScore !== undefined ||
    row.feedback !== undefined ||
    row.gradedAt !== undefined ||
    row.masteryContractVersion !== undefined ||
    !record(submission) ||
    !exactKeys(submission, [
      "contractVersion", "activityId", "mode", "status", "submittedAt",
      "attemptNumber", "answers", "parts", "artifact",
    ]) ||
    submission.contractVersion !== "practice.v1" ||
    submission.activityId !== activityId ||
    submission.mode !== "worked_example" ||
    submission.status !== "submitted" ||
    submission.attemptNumber !== row.attemptOrdinal ||
    submission.submittedAt !== new Date(row.submittedAt as number).toISOString() ||
    !record(submission.answers) ||
    Object.keys(submission.answers).length !== 0 ||
    !Array.isArray(submission.parts) ||
    submission.parts.length !== 0 ||
    !record(submission.artifact) ||
    !exactKeys(submission.artifact, ["request"]) ||
    !record(submission.artifact.request) ||
    !exactKeys(submission.artifact.request, ["answers", "hintsUsed", "revealStepsSeen"]) ||
    !record(submission.artifact.request.answers) ||
    Object.keys(submission.artifact.request.answers).length !== 0 ||
    !Number.isSafeInteger(submission.artifact.request.hintsUsed) ||
    (submission.artifact.request.hintsUsed as number) < 0 ||
    !Number.isSafeInteger(submission.artifact.request.revealStepsSeen) ||
    (submission.artifact.request.revealStepsSeen as number) < 0
  )
    throw Error("invalid_triangle_history");
  return {
    hintsUsed: submission.artifact.request.hintsUsed as number,
    revealStepsSeen: submission.artifact.request.revealStepsSeen as number,
  };
}
function publicPart(part: TrianglePart): PublicTrianglePart {
  return {
    id: part.id,
    prompt: part.question.prompt,
    kind: part.question.kind,
    choices:
      part.question.kind === "choice" ? part.question.choices : undefined,
  };
}
function trianglePublished(nodeId: string, publication: Publication) {
  return (
    publication.nodes.find((row) => row.id === nodeId)?.kind === "skill" &&
    publication.nodes.find((row) => row.id === nodeId)?.reviewStatus ===
      "approved" &&
    publication.blueprints.find((row) => row.nodeId === nodeId)
      ?.reviewStatus === "approved"
  );
}
function publicGrade(value: unknown): value is PublicGrade {
  return (
    record(value) &&
    exactKeys(value, [
      "partId",
      "rawAnswer",
      "isCorrect",
      "score",
      "maxScore",
      ...(value.feedback === undefined ? [] : ["feedback"]),
    ]) &&
    typeof value.partId === "string" &&
    typeof value.rawAnswer === "string" &&
    typeof value.isCorrect === "boolean" &&
    (value.score === 0 || value.score === 1) &&
    value.maxScore === 1 &&
    value.isCorrect === (value.score === 1) &&
    (value.feedback === undefined || typeof value.feedback === "string")
  );
}
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (record(value))
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  return value;
}
function sameValue(left: unknown, right: unknown) {
  return (
    JSON.stringify(canonicalValue(left)) ===
    JSON.stringify(canonicalValue(right))
  );
}
function deriveTriangleResponse(
  item: TriangleItem,
  mode: TriangleMode,
  index: number,
  answers: Record<string, string>,
  parts: PublicGrade[],
  hintsUsed: number,
  revealStepsSeen: number,
): TriangleResponse {
  const itemParts = item.parts!;
  const currentPart = itemParts[index];
  const currentGrade = parts.find((part) => part.partId === currentPart.id)!;
  const finalPart = index === itemParts.length - 1;
  const complete = finalPart && parts.every((part) => part.isCorrect);
  const acceptedAnswers = { ...answers };
  if (!currentGrade.isCorrect) delete acceptedAnswers[currentGrade.partId];
  return {
    kind: "graded",
    score: complete
      ? parts.reduce((sum, part) => sum + part.score, 0)
      : currentGrade.score,
    maxScore: complete ? parts.length : 1,
    feedback: currentGrade.feedback,
    finalPart,
    complete,
    acceptedAnswers,
    hintsUsed,
    revealStepsSeen,
    ...(!complete && currentGrade.isCorrect && !finalPart
      ? { nextPart: publicPart(itemParts[index + 1]) }
      : {}),
    ...(mode === "guided_practice" && !currentGrade.isCorrect
      ? { hint: currentPart.question.hint }
      : {}),
    ...(complete ? { parts } : {}),
  };
}
function responseValid(value: unknown): value is TriangleResponse {
  if (
    !record(value) ||
    value.kind !== "graded" ||
    typeof value.score !== "number" ||
    !Number.isSafeInteger(value.score) ||
    typeof value.maxScore !== "number" ||
    !Number.isSafeInteger(value.maxScore) ||
    value.maxScore < 1 ||
    typeof value.finalPart !== "boolean" ||
    typeof value.complete !== "boolean" ||
    !record(value.acceptedAnswers) ||
    Object.values(value.acceptedAnswers).some(
      (answer) => typeof answer !== "string",
    ) ||
    typeof value.hintsUsed !== "number" ||
    !Number.isSafeInteger(value.hintsUsed) ||
    value.hintsUsed < 0 ||
    typeof value.revealStepsSeen !== "number" ||
    !Number.isSafeInteger(value.revealStepsSeen) ||
    value.revealStepsSeen < 0
  )
    return false;
  return (
    value.parts === undefined ||
    (Array.isArray(value.parts) && value.parts.every(publicGrade))
  );
}
function parseTriangleRow(
  row: Record<string, unknown> | null,
  item: TriangleItem,
  activityId: string,
  nodeId: string,
  mode: TriangleMode,
): TriangleState {
  if (!row)
    return {
      acceptedAnswers: {},
      hintsUsed: 0,
      revealStepsSeen: 0,
      index: 0,
      complete: false,
    };
  const envelope = row.submissionData;
  if (
    row.activityId !== activityId ||
    typeof row.userId !== "string" ||
    !record(envelope) ||
    !exactKeys(envelope, [
      "contractVersion",
      "activityId",
      "mode",
      "status",
      "attemptNumber",
      "submittedAt",
      "answers",
      "parts",
      "artifact",
    ]) ||
    envelope.contractVersion !== "practice.v1" ||
    envelope.activityId !== activityId ||
    envelope.mode !== mode ||
    envelope.status !== "graded" ||
    !Number.isSafeInteger(envelope.attemptNumber) ||
    envelope.attemptNumber !== row.attemptOrdinal ||
    typeof envelope.submittedAt !== "string" ||
    !Number.isFinite(Date.parse(envelope.submittedAt)) ||
    Date.parse(envelope.submittedAt) !== row.submittedAt ||
    row.gradedAt !== row.submittedAt ||
    typeof row.idempotencyKey !== "string" ||
    row.idempotencyKey.length === 0 ||
    !record(envelope.answers) ||
    Object.values(envelope.answers).some(
      (answer) => typeof answer !== "string",
    ) ||
    !Array.isArray(envelope.parts) ||
    !record(envelope.artifact)
  )
    throw Error("invalid_triangle_history");
  const artifact = envelope.artifact;
  if (
    !exactKeys(artifact, [
      "currentPartId",
      "finalPart",
      "complete",
      "hintsUsed",
      "revealStepsSeen",
      "nodeId",
      "problem",
      "request",
      "response",
    ]) ||
    artifact.nodeId !== nodeId ||
    artifact.problem !== item.problem ||
    typeof artifact.currentPartId !== "string" ||
    typeof artifact.finalPart !== "boolean" ||
    typeof artifact.complete !== "boolean" ||
    typeof artifact.hintsUsed !== "number" ||
    !Number.isSafeInteger(artifact.hintsUsed) ||
    artifact.hintsUsed < 0 ||
    typeof artifact.revealStepsSeen !== "number" ||
    !Number.isSafeInteger(artifact.revealStepsSeen) ||
    artifact.revealStepsSeen < 0 ||
    !record(artifact.request) ||
    !responseValid(artifact.response)
  )
    throw Error("invalid_triangle_history");
  const parts = item.parts ?? [];
  const index = parts.findIndex((part) => part.id === artifact.currentPartId);
  if (index < 0 || artifact.finalPart !== (index === parts.length - 1))
    throw Error("invalid_triangle_history");
  const expectedIds = parts.slice(0, index + 1).map((part) => part.id);
  if (
    !exactKeys(envelope.answers, expectedIds) ||
    !exactKeys(artifact.request, ["answers", "hintsUsed", "revealStepsSeen"]) ||
    !record(artifact.request.answers) ||
    typeof artifact.request.hintsUsed !== "number" ||
    !Number.isSafeInteger(artifact.request.hintsUsed) ||
    artifact.request.hintsUsed < 0 ||
    typeof artifact.request.revealStepsSeen !== "number" ||
    !Number.isSafeInteger(artifact.request.revealStepsSeen) ||
    artifact.request.revealStepsSeen < 0 ||
    !sameAnswers(
      artifact.request.answers as Record<string, string>,
      envelope.answers as Record<string, string>,
    ) ||
    (artifact.request.hintsUsed !== artifact.hintsUsed &&
      artifact.response.hintsUsed !== artifact.hintsUsed) ||
    artifact.request.revealStepsSeen !== artifact.revealStepsSeen ||
    artifact.response.revealStepsSeen !== artifact.revealStepsSeen
  )
    throw Error("invalid_triangle_history");
  const expectedPartIds = artifact.finalPart
    ? expectedIds
    : [artifact.currentPartId];
  if (
    envelope.parts.length !== expectedPartIds.length ||
    !envelope.parts.every(publicGrade) ||
    envelope.parts.some(
      (part, partIndex) =>
        part.partId !== expectedPartIds[partIndex] ||
        part.rawAnswer !==
          (envelope.answers as Record<string, string>)[part.partId] ||
        (() => {
          const grade = gradeTrianglePart(
            nodeId,
            mode,
            item.problem,
            1,
            part.partId,
            part.rawAnswer,
          );
          return part.score !== grade.score || part.feedback !== grade.feedback;
        })(),
    )
  )
    throw Error("invalid_triangle_history");
  const current = (envelope.parts as PublicGrade[]).find(
    (part) => part.partId === artifact.currentPartId,
  )!;
  const allCorrect = (envelope.parts as PublicGrade[]).every(
    (part) => part.isCorrect,
  );
  if (
    artifact.complete !== (artifact.finalPart && allCorrect) ||
    artifact.response.complete !== artifact.complete ||
    artifact.response.finalPart !== artifact.finalPart
  )
    throw Error("invalid_triangle_history");
  const acceptedAnswers = { ...(envelope.answers as Record<string, string>) };
  if (!current.isCorrect) delete acceptedAnswers[current.partId];
  const expectedResponse = deriveTriangleResponse(
    item,
    mode,
    index,
    envelope.answers as Record<string, string>,
    envelope.parts as PublicGrade[],
    artifact.hintsUsed,
    artifact.revealStepsSeen,
  );
  if (
    !sameValue(artifact.response, expectedResponse) ||
    row.score !== expectedResponse.score ||
    row.maxScore !== expectedResponse.maxScore ||
    row.feedback !== current.feedback
  )
    throw Error("invalid_triangle_history");
  return {
    acceptedAnswers,
    hintsUsed: artifact.hintsUsed,
    revealStepsSeen: artifact.revealStepsSeen,
    index: current.isCorrect ? index + 1 : index,
    complete: artifact.complete,
  };
}

export async function getTrianglePracticeHandler(
  ctx: QueryCtx,
  userId: Id<"profiles">,
  publication: Publication = currentPublication,
) {
  const profile = await activeAccount(ctx, userId);
  if (!profile || profile.role !== "student") return [];
  const sourceLessons = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (query) =>
      query.eq("slug", "module-1-lesson-4"),
    )
    .take(2);
  if (sourceLessons.length !== 1) return [];
  const sourceLesson = sourceLessons[0];
  const output: PublicTriangle[] = [];
  for (const nodeId of Object.values(triangleNodeIds)) {
    if (!trianglePublished(nodeId, publication)) continue;
    try {
      const rows = [];
      for (const spec of triangleModes(nodeId))
        rows.push(
          await ctx.db
            .query("activities")
            .withIndex("by_stable_activity_id", (query) =>
              query.eq("stableActivityId", `${nodeId}.${spec.mode}`),
            )
            .unique(),
        );
      if (
        rows.some((row, index) => {
          const spec = triangleModes(nodeId)[index];
          return (
            !row ||
            row.approval?.status !== "approved" ||
            row.masteryNodeId !== nodeId ||
            row.learningEvidenceMode !== spec.mode ||
            row.generatorSeed !== spec.seed ||
            row.generatorDifficulty !== 1 ||
            row.componentKey !== "im2-question"
          );
        })
      )
        return [];
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index]!;
        const spec = triangleModes(nodeId)[index];
        const mode = spec.mode;
        const base = projectTriangleItem(
          nodeId,
          mode,
          spec.seed,
          1,
          String(row._id),
        );
        if (mode === "worked_example") {
          const latest = await ctx.db
            .query("activity_submissions")
            .withIndex("by_user_activity_attempt_ordinal", (query) =>
              query.eq("userId", userId).eq("activityId", row._id),
            )
            .order("desc")
            .first();
          if (latest) {
            workedAcknowledgementRequest(
              latest,
              String(userId),
              String(row._id),
              String(sourceLesson._id),
            );
            continue;
          }
          output.push(base);
          continue;
        }
        const latest = await ctx.db
          .query("activity_submissions")
          .withIndex("by_user_activity_attempt_ordinal", (query) =>
            query.eq("userId", userId).eq("activityId", row._id),
          )
          .order("desc")
          .first();
        const item = triangleItem(nodeId, mode, spec.seed, 1);
        const state = parseTriangleRow(
          latest,
          item,
          String(row._id),
          nodeId,
          mode,
        );
        if (state.complete) continue;
        output.push({
          ...base,
          acceptedAnswers: state.acceptedAnswers,
          hintsUsed: state.hintsUsed,
          revealStepsSeen: state.revealStepsSeen,
          currentPart: publicPart(item.parts![state.index]),
        });
      }
    } catch {
      return [];
    }
  }
  return output;
}
export const getApprovedTriangleOrderingPractice = internalQuery({
  args: { userId: v.id("profiles") },
  returns: v.array(trianglePublic),
  handler: (ctx, args) => getTrianglePracticeHandler(ctx, args.userId),
});
type TriangleSubmit = {
  userId: Id<"profiles">;
  activityId: Id<"activities">;
  idempotencyKey: string;
  answers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
};
async function writeTriangleEvidence(
  ctx: MutationCtx,
  args: TriangleSubmit,
  activity: Record<string, unknown>,
  nodeId: TriangleNodeId,
  mode: TriangleMode,
  submissionId: Id<"activity_submissions">,
  attemptOrdinal: number,
  grade: PublicGrade,
  prerequisitePassed: boolean,
  now: number,
  publication: Publication,
) {
  const blueprint = publication.blueprints.find((row) => row.nodeId === nodeId);
  const graphReady =
    publication.nodes.find((row) => row.id === nodeId)
      ?.independentPracticeReady === true &&
    blueprint?.metadata?.independentPracticeReady === true;
  if (
    !graphReady ||
    activity.srsEligible !== true ||
    mode !== "independent_practice" ||
    args.hintsUsed !== 0 ||
    args.revealStepsSeen !== 0 ||
    !prerequisitePassed
  )
    return false;
  const stableActivityId = activity.stableActivityId as string;
  const occurredAt = new Date(now).toISOString();
  const evidence = learningEvidenceV1Schema.parse({
    contractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION,
    nodeId,
    activityId: stableActivityId,
    attemptOrdinal,
    origin: "mastery_advantage",
    mode,
    occurredAt,
    gradedEvidence: {
      isCorrect: grade.isCorrect,
      score: grade.score,
      maxScore: grade.maxScore,
    },
    idempotencyKey: args.idempotencyKey.trim(),
  });
  const acceptedEvidence = (
    await ctx.db
      .query("learning_evidence")
      .withIndex("by_learner_and_node", (query) =>
        query.eq("learnerId", args.userId).eq("nodeId", nodeId),
      )
      .collect()
  ).map((row) =>
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
  if (
    !evaluateLearningEvidenceV1({
      evidence,
      acceptedEvidence,
      enabledNodeIds: [nodeId],
    }).eligible
  )
    return false;
  await ctx.db.insert("learning_evidence", {
    learnerId: args.userId,
    nodeId,
    submissionId,
    activityId: stableActivityId,
    attemptOrdinal,
    origin: evidence.origin,
    mode,
    occurredAt,
    gradedEvidence: evidence.gradedEvidence,
    idempotencyKey: evidence.idempotencyKey,
    masteryBearing: true,
    createdAt: now,
  });
  const existingCard = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_objective", (query) =>
      query.eq("studentId", args.userId).eq("objectiveId", nodeId),
    )
    .unique();
  const card = {
    cardId: existingCard ? String(existingCard._id) : `pending:${submissionId}`,
    studentId: String(args.userId),
    objectiveId: nodeId,
    variantKey: `im2-triangle-ordering:${nodeId}`,
    stability: existingCard?.stability ?? 0,
    difficulty: existingCard?.difficulty ?? 0,
    state: existingCard?.state ?? ("new" as const),
    dueDate: existingCard?.dueDate ?? occurredAt,
    elapsedDays: existingCard?.elapsedDays ?? 0,
    scheduledDays: existingCard?.scheduledDays ?? 0,
    reps: existingCard?.reps ?? 0,
    lapses: existingCard?.lapses ?? 0,
    lastReview: existingCard?.lastReview ?? null,
    createdAt: existingCard
      ? new Date(existingCard.createdAt).toISOString()
      : occurredAt,
    updatedAt: existingCard
      ? new Date(existingCard.updatedAt).toISOString()
      : occurredAt,
  };
  const review = processReview({
    card,
    submission: {
      contractVersion: "practice.v1",
      activityId: toConvexActivityId(stableActivityId),
      mode,
      status: "graded",
      submittedAt: occurredAt,
      attemptNumber: attemptOrdinal,
      answers: { final_order: grade.rawAnswer },
      parts: [grade],
    },
    now: occurredAt,
  });
  const next = review.updatedCard;
  const cardId =
    existingCard?._id ??
    (await ctx.db.insert("srs_cards", {
      studentId: args.userId,
      objectiveId: nodeId,
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
  return true;
}
export async function submitTriangleHandler(
  ctx: MutationCtx,
  args: TriangleSubmit,
  publication: Publication = currentPublication,
) {
  const key = args.idempotencyKey.trim();
  const [profile, activity] = await Promise.all([
    activeAccount(ctx, args.userId),
    ctx.db.get(args.activityId),
  ]);
  if (!key || !profile || profile.role !== "student")
    throw Error("invalid_submission");
  const nodeId = activity?.masteryNodeId as TriangleNodeId;
  const mode = activity?.learningEvidenceMode as TriangleMode;
  const spec = triangleModes(nodeId).find(
    (candidate) => candidate.mode === mode,
  );
  if (
    !spec ||
    !trianglePublished(nodeId, publication) ||
    activity?.approval?.status !== "approved" ||
    activity.stableActivityId !== `${nodeId}.${mode}` ||
    activity.componentKey !== "im2-question" ||
    activity.generatorSeed !== spec.seed ||
    activity.generatorDifficulty !== 1
  )
    throw Error("unsupported_activity");
  const item = triangleItem(nodeId, mode, spec.seed, 1);
  const existing = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_idempotency_key", (query) =>
      query
        .eq("userId", args.userId)
        .eq("activityId", args.activityId)
        .eq("idempotencyKey", key),
    )
    .unique();
  if (existing) {
    const state = parseTriangleRow(
      existing,
      item,
      String(args.activityId),
      nodeId,
      mode,
    );
    const envelope = existing.submissionData as StoredTriangleEnvelope;
    if (
      !sameAnswers(envelope.artifact.request.answers, args.answers) ||
      envelope.artifact.request.hintsUsed !== args.hintsUsed ||
      envelope.artifact.request.revealStepsSeen !== args.revealStepsSeen ||
      state.complete !== envelope.artifact.complete
    )
      throw Error("idempotency_conflict");
    const evidenceRows = await ctx.db
      .query("learning_evidence")
      .withIndex("by_learner_and_submission_id", (query) =>
        query.eq("learnerId", args.userId).eq("submissionId", existing._id),
      )
      .collect();
    return {
      ...envelope.artifact.response,
      submissionId: existing._id,
      evidencePersisted: evidenceRows.some(
        (row) => row.origin === "mastery_advantage" && row.nodeId === nodeId,
      ),
    };
  }
  if (mode === "worked_example") throw Error("invalid_submission");
  const latest = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_attempt_ordinal", (query) =>
      query.eq("userId", args.userId).eq("activityId", args.activityId),
    )
    .order("desc")
    .first();
  const state = parseTriangleRow(
    latest,
    item,
    String(args.activityId),
    nodeId,
    mode,
  );
  if (state.complete) throw Error("unsupported_activity");
  if (
    !Number.isSafeInteger(args.hintsUsed) ||
    args.hintsUsed < state.hintsUsed ||
    !Number.isSafeInteger(args.revealStepsSeen) ||
    args.revealStepsSeen < state.revealStepsSeen
  )
    throw Error("invalid_submission");
  const part = item.parts![state.index];
  const expected = [...Object.keys(state.acceptedAnswers), part.id];
  if (
    !exactKeys(args.answers, expected) ||
    Object.entries(state.acceptedAnswers).some(
      ([answerId, answer]) => args.answers[answerId] !== answer,
    )
  )
    throw Error("invalid_submission");
  const currentGrade = gradeTrianglePart(
    nodeId,
    mode,
    spec.seed,
    1,
    part.id,
    args.answers[part.id],
  );
  const finalPart = state.index === item.parts!.length - 1;
  const parts: PublicGrade[] = (finalPart ? item.parts! : [part]).map(
    (candidate) => {
      const grade = gradeTrianglePart(
        nodeId,
        mode,
        spec.seed,
        1,
        candidate.id,
        args.answers[candidate.id],
      );
      return {
        partId: candidate.id,
        rawAnswer: args.answers[candidate.id],
        isCorrect: grade.score === 1,
        score: grade.score,
        maxScore: 1,
        feedback: grade.feedback,
      };
    },
  );
  const complete = finalPart && parts.every((grade) => grade.isCorrect);
  const hintsUsed =
    args.hintsUsed +
    (mode === "guided_practice" && currentGrade.score === 0 ? 1 : 0);
  const response = deriveTriangleResponse(
    item,
    mode,
    state.index,
    args.answers,
    parts,
    hintsUsed,
    args.revealStepsSeen,
  );
  const priorOrdinal = latest?.attemptOrdinal ?? 0;
  if (!Number.isSafeInteger(priorOrdinal + 1))
    throw Error("invalid_submission");
  const lesson = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (query) => query.eq("slug", "module-1-lesson-4"))
    .unique();
  if (!lesson) throw Error("pilot_source_lesson_missing");
  const now = Date.now();
  const artifact: TriangleArtifact = {
    currentPartId: part.id,
    finalPart,
    complete,
    hintsUsed,
    revealStepsSeen: args.revealStepsSeen,
    nodeId,
    problem: item.problem,
    request: {
      answers: { ...args.answers },
      hintsUsed: args.hintsUsed,
      revealStepsSeen: args.revealStepsSeen,
    },
    response,
  };
  const submissionData: StoredTriangleEnvelope = {
    contractVersion: "practice.v1",
    activityId: String(args.activityId),
    mode,
    status: "graded",
    attemptNumber: priorOrdinal + 1,
    submittedAt: new Date(now).toISOString(),
    answers: { ...args.answers },
    parts,
    artifact,
  };
  const submissionId = await ctx.db.insert("activity_submissions", {
    userId: args.userId,
    activityId: args.activityId,
    lessonId: lesson._id,
    submissionData,
    score: response.score,
    maxScore: response.maxScore,
    feedback: response.feedback,
    submittedAt: now,
    gradedAt: now,
    createdAt: now,
    updatedAt: now,
    attemptOrdinal: priorOrdinal + 1,
    idempotencyKey: key,
    masteryContractVersion: LEARNING_EVIDENCE_CONTRACT_VERSION,
  });
  const finalGrade = parts.find((grade) => grade.partId === "final_order");
  const prerequisitePassed =
    item.problem !== 10 ||
    parts.find((grade) => grade.partId === "missing_angle")?.isCorrect === true;
  const evidencePersisted =
    finalPart && finalGrade
      ? await writeTriangleEvidence(
          ctx,
          args,
          activity,
          nodeId,
          mode,
          submissionId,
          priorOrdinal + 1,
          finalGrade,
          prerequisitePassed,
          now,
          publication,
        )
      : false;
  return { ...response, submissionId, evidencePersisted };
}
export async function submitBoundedPracticeHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    activityId: Id<"activities">;
    idempotencyKey: string;
    rawResponse?: string;
    answers?: Record<string, string>;
    hintsUsed: number;
    revealStepsSeen: number;
  },
  publication: Publication = currentPublication,
) {
  const activity = await ctx.db.get(args.activityId);
  if (
    activity &&
    triangleModes(activity.masteryNodeId ?? "").some(
      (spec) => spec.mode === activity.learningEvidenceMode,
    )
  ) {
    if (!args.answers || args.rawResponse !== undefined)
      throw Error("invalid_submission");
    if (activity.learningEvidenceMode === "worked_example") {
      if (Object.keys(args.answers).length !== 0)
        throw Error("invalid_submission");
      const key = args.idempotencyKey.trim();
      const profile = await activeAccount(ctx, args.userId);
      const nodeId = activity.masteryNodeId as TriangleNodeId;
      const spec = triangleModes(nodeId).find(
        (candidate) => candidate.mode === "worked_example",
      );
      if (
        !key ||
        !spec ||
        !profile ||
        profile.role !== "student" ||
        !trianglePublished(nodeId, publication) ||
        activity.approval?.status !== "approved" ||
        activity.stableActivityId !== `${nodeId}.worked_example` ||
        activity.componentKey !== "im2-question" ||
        activity.generatorSeed !== spec.seed ||
        activity.generatorDifficulty !== 1 ||
        !Number.isSafeInteger(args.hintsUsed) ||
        args.hintsUsed < 0 ||
        !Number.isSafeInteger(args.revealStepsSeen) ||
        args.revealStepsSeen < 0
      )
        throw Error("invalid_submission");
      const sourceLessons = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (query) =>
          query.eq("slug", "module-1-lesson-4"),
        )
        .take(2);
      if (sourceLessons.length !== 1)
        throw Error("pilot_source_lesson_missing");
      const sourceLesson = sourceLessons[0];
      const existing = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_activity_idempotency_key", (query) =>
          query
            .eq("userId", args.userId)
            .eq("activityId", args.activityId)
            .eq("idempotencyKey", key),
        )
        .unique();
      if (existing) {
        const storedRequest = workedAcknowledgementRequest(
          existing,
          String(args.userId),
          String(args.activityId),
          String(sourceLesson._id),
        );
        if (
          storedRequest.hintsUsed !== args.hintsUsed ||
          storedRequest.revealStepsSeen !== args.revealStepsSeen
        )
          throw Error("idempotency_conflict");
        return {
          kind: "acknowledged" as const,
          submissionId: existing._id,
          evidencePersisted: false,
        };
      }
      const prior = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_activity_attempt_ordinal", (query) =>
          query.eq("userId", args.userId).eq("activityId", args.activityId),
        )
        .order("desc")
        .first();
      if (prior) {
        const storedRequest = workedAcknowledgementRequest(
          prior,
          String(args.userId),
          String(args.activityId),
          String(sourceLesson._id),
        );
        if (
          storedRequest.hintsUsed !== args.hintsUsed ||
          storedRequest.revealStepsSeen !== args.revealStepsSeen
        )
          throw Error("idempotency_conflict");
        return {
          kind: "acknowledged" as const,
          submissionId: prior._id,
          evidencePersisted: false,
        };
      }
      const attemptOrdinal = 1;
      const now = Date.now();
      const submissionId = await ctx.db.insert("activity_submissions", {
        userId: args.userId,
        activityId: args.activityId,
        lessonId: sourceLesson._id,
        submissionData: {
          contractVersion: "practice.v1",
          activityId: String(args.activityId),
          mode: "worked_example",
          status: "submitted",
          submittedAt: new Date(now).toISOString(),
          attemptNumber: attemptOrdinal,
          answers: {},
          parts: [],
          artifact: {
            request: {
              answers: {},
              hintsUsed: args.hintsUsed,
              revealStepsSeen: args.revealStepsSeen,
            },
          },
        },
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        attemptOrdinal,
        idempotencyKey: key,
      });
      return {
        kind: "acknowledged" as const,
        submissionId,
        evidencePersisted: false,
      };
    }
    return submitTriangleHandler(ctx, args as TriangleSubmit, publication);
  }
  if (args.rawResponse === undefined || args.answers !== undefined)
    throw Error("invalid_submission");
  return submitPilotHandler(ctx, args as SubmitArgs, publication);
}
export const submitBoundedPractice = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    idempotencyKey: v.string(),
    rawResponse: v.optional(v.string()),
    answers: v.optional(v.record(v.string(), v.string())),
    hintsUsed: v.number(),
    revealStepsSeen: v.number(),
  },
  handler: submitBoundedPracticeHandler,
});
export const submitTriangleOrderingPractice = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    idempotencyKey: v.string(),
    answers: v.record(v.string(), v.string()),
    hintsUsed: v.number(),
    revealStepsSeen: v.number(),
  },
  handler: submitTriangleHandler,
});
