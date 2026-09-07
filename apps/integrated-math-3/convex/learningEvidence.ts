import {
  evaluateLearningEvidenceV1,
  learningEvidenceFingerprintV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from "@math-platform/practice-core";
import {
  buildPracticeSubmissionEnvelope,
  toConvexActivityId,
} from "@math-platform/practice-core/contract";
import { SubmissionSrsAdapter } from "@math-platform/srs-engine";
import { ConvexCardStore } from "../lib/srs/convexCardStore";
import { ConvexReviewLogStore } from "../lib/srs/convexReviewLogStore";
import {
  createIm3LearningEvidenceAdapter,
  type Im3LearningEvidenceStore,
  type Im3LearningEvidenceAdapter,
  type Im3MasteryAdvantageBridge,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
  IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "../lib/practice/learning-evidence-pilot";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3PilotSeedDocuments,
} from "./seed/seed_lesson_1_1";
export type { Im3LearningEvidenceStore } from "../lib/practice/learning-evidence-pilot";
export type Im3GraphPilotPublication = {
  nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string }>;
  blueprints: ReadonlyArray<{ nodeId: string; reviewStatus?: string }>;
};

const currentIm3GraphPilotPublication: Im3GraphPilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};

export function isIm3GraphPilotPublished(
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
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

/**
 * Creates the durable IM3 handler bound to one Convex mutation transaction.
 * The evidence write and injected mastery bridge therefore share Convex's
 * atomic transaction boundary when the bridge is also backed by this context.
 */
export function createIm3ConvexLearningEvidenceHandler({
  ctx,
  masteryBridge,
}: {
  readonly ctx: MutationCtx;
  readonly masteryBridge: Im3MasteryAdvantageBridge;
}): Im3LearningEvidenceAdapter {
  return createIm3LearningEvidenceAdapter({
    store: createIm3EvidenceStore(ctx),
    masteryBridge,
  });
}

/** Compatibility name for the existing pure adapter test seam. */
export const createIm3LearningEvidenceHandler =
  createIm3LearningEvidenceAdapter;

const learningEvidenceDecisionValidator = v.object({
  idempotency: v.union(
    v.literal("new"),
    v.literal("replay"),
    v.literal("conflict"),
  ),
  exposureState: v.union(
    v.literal("awaiting_teacher_exposure"),
    v.literal("introduced"),
  ),
  eligible: v.boolean(),
  reason: v.union(
    v.literal("node_not_enabled"),
    v.literal("idempotency_conflict"),
    v.literal("teacher_led"),
    v.literal("awaiting_teacher_exposure"),
    v.literal("ungraded_evidence"),
    v.literal("eligible"),
  ),
  masteryBearing: v.boolean(),
});

const learningEvidenceResultValidator = v.union(
  v.object({
    persisted: v.boolean(),
    masteryApplied: v.boolean(),
    kstApplied: v.boolean(),
    delivery: v.union(v.literal("new"), v.literal("replay")),
    decision: learningEvidenceDecisionValidator,
  }),
  v.object({
    accepted: v.literal(false),
    reason: v.literal("submission_not_found"),
  }),
  v.object({
    accepted: v.literal(false),
    reason: v.literal("attempt_ordinal_conflict"),
    latestAttemptOrdinal: v.number(),
    receivedAttemptOrdinal: v.number(),
  }),
);

export interface Im3ActivitySubmission {
  submissionId: string;
  userId: string;
  activityId: string;
  activity?: {
    stableActivityId?: string;
    masteryNodeId?: string;
    componentKey?: string;
    srsEligible?: boolean;
    learningEvidenceMode?: "worked_example";
    props?: Record<string, unknown>;
    gradingConfig?: Record<string, unknown>;
    approval?: { status?: string };
  };
  masteryContractVersion?: string;
  submissionData: {
    contractVersion?: string;
    activityId?: string;
    attemptNumber?: number;
    mode?: LearningEvidenceV1["mode"];
    submittedAt?: string;
    status?: string;
    [key: string]: unknown;
  };
  score?: number;
  maxScore?: number;
  /** Server-assigned ordinal. Never derive this from submissionData. */
  attemptOrdinal?: number;
  gradedAt?: number | string;
  /** Server insertion timestamp. Never derive this from submissionData. */
  submittedAt?: number | string;
}

export type Im3LearningEvidenceDecision = LearningEvidenceDecisionV1;

export interface Im3SubmissionReceipt {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: Im3LearningEvidenceDecision;
}

export interface Im3SubmissionReceiptStore {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<Im3SubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: Im3SubmissionReceipt,
    evidenceId?: string,
  ): Promise<void>;
}

export interface Im3SubmissionLearningEvidenceHandlerDependencies {
  evidenceStore: Im3LearningEvidenceStore;
  receiptStore: Im3SubmissionReceiptStore;
  loadActivitySubmission: (
    submissionId: string,
  ) => Promise<Im3ActivitySubmission | null>;
  masteryBridge: (input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<void>;
}

export interface Im3SubmissionLearningEvidenceHandler {
  process(input: { learnerId: string; submissionId: string }): Promise<
    | (Im3SubmissionReceipt & { delivery: "new" | "replay" })
    | { accepted: false; reason: "submission_not_found" }
    | {
        accepted: false;
        reason: "attempt_ordinal_conflict";
        latestAttemptOrdinal: number;
        receivedAttemptOrdinal: number;
      }
  >;
}

export interface Im3ServerOwnedSubmissionLearningEvidenceHandler {
  process(input: {
    submissionId: string;
  }): ReturnType<Im3SubmissionLearningEvidenceHandler["process"]>;
}

function storedTimestampToIso(
  value: number | string | undefined,
): string | null {
  if (value === undefined) return null;
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function getSubmissionOwner(submission: Im3ActivitySubmission): string | null {
  const owner = submission.userId;
  return typeof owner === "string" && owner.trim().length > 0 ? owner : null;
}

function isPersistableDecision(decision: LearningEvidenceDecisionV1): boolean {
  return (
    decision.reason === "teacher_led" ||
    decision.reason === "ungraded_evidence" ||
    decision.reason === "eligible"
  );
}

function highestAttemptOrdinal(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[],
): number | null {
  let highest: number | null = null;
  for (const accepted of acceptedEvidence) {
    if (
      accepted.nodeId !== evidence.nodeId ||
      accepted.activityId !== evidence.activityId ||
      accepted.origin !== evidence.origin
    ) {
      continue;
    }
    if (highest === null || accepted.attemptOrdinal > highest) {
      highest = accepted.attemptOrdinal;
    }
  }
  return highest;
}

function hasExactPointResponse(
  value: unknown,
): value is Array<{ x: number; y: number }> {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every(
      (point) =>
        typeof point === "object" &&
        point !== null &&
        !Array.isArray(point) &&
        Object.keys(point).sort().join("|") === "x|y" &&
        Number.isFinite((point as { x: unknown }).x) &&
        Number.isFinite((point as { y: unknown }).y),
    )
  );
}

function canonicalSelectedContent(value: unknown): string {
  return JSON.stringify(value, (_key, entry) =>
    entry !== null && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(
          Object.keys(entry)
            .sort()
            .map((key) => [key, entry[key]]),
        )
      : entry,
  );
}

export function hasCurrentSelectedActivityIdentity(
  submission: Pick<Im3ActivitySubmission, "activity" | "activityId">,
  mode: "guided" | "independent",
): boolean {
  const activity = submission.activity;
  if (!activity || activity.approval?.status !== "approved") return false;
  const expected =
    mode === "guided"
      ? buildIm3GuidedPilotSeedDocuments(
          submission.activityId as Id<"activities">,
          0,
        ).activity
      : buildIm3PilotSeedDocuments(
          submission.activityId as Id<"activities">,
          0,
        ).activity;
  return (
    activity.learningEvidenceMode === undefined &&
    canonicalSelectedContent(activity.props) ===
      canonicalSelectedContent(expected.props) &&
    canonicalSelectedContent(activity.gradingConfig) ===
      canonicalSelectedContent(expected.gradingConfig)
  );
}

function exactSelected(
  submission: Im3ActivitySubmission,
): "worked" | "guided" | "independent" | null {
  const data = submission.submissionData;
  const activity = submission.activity;
  if (
    !activity ||
    activity.masteryNodeId !== IM3_PILOT_NODE ||
    activity.componentKey !== "graphing-explorer" ||
    submission.activityId !== data.activityId
  )
    return null;

  if (
    activity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID &&
    activity.learningEvidenceMode === "worked_example" &&
    activity.srsEligible === false &&
    data.mode === "worked_example" &&
    data.status === "submitted" &&
    Object.keys(data).sort().join("|") ===
      "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt" &&
    typeof data.answers === "object" &&
    data.answers !== null &&
    Object.keys(data.answers).length === 0 &&
    Array.isArray(data.parts) &&
    data.parts.length === 0 &&
    submission.score === undefined &&
    submission.maxScore === undefined &&
    submission.gradedAt === undefined
  )
    return "worked";

  const mode =
    activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
      ? "guided"
      : activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
        ? "independent"
        : null;
  if (
    !mode ||
    !hasCurrentSelectedActivityIdentity(submission, mode) ||
    activity.srsEligible !== true ||
    data.contractVersion !== "practice.v1" ||
    data.mode !==
      (mode === "guided" ? "guided_practice" : "independent_practice") ||
    data.status !== "graded" ||
    typeof data.answers !== "object" ||
    data.answers === null ||
    Object.keys(data.answers).sort().join("|") !==
      "placed_points|table_values" ||
    !Array.isArray(data.parts) ||
    data.parts.length !== 2
  )
    return null;

  const answers = data.answers as Record<string, unknown>;
  const parts = data.parts as Array<Record<string, unknown>>;
  if (
    parts
      .map((part) => part.partId)
      .sort()
      .join("|") !== "placed_points|table_values"
  ) {
    return null;
  }
  for (const partId of ["table_values", "placed_points"] as const) {
    const answer = answers[partId];
    const part = parts.find((candidate) => candidate.partId === partId);
    if (
      !hasExactPointResponse(answer) ||
      !part ||
      JSON.stringify(part.rawAnswer) !== JSON.stringify(answer) ||
      typeof part.isCorrect !== "boolean" ||
      typeof part.score !== "number" ||
      typeof part.maxScore !== "number" ||
      part.maxScore !== 1 ||
      (part.revealStepsSeen !== undefined && part.revealStepsSeen !== 0)
    )
      return null;
  }
  return mode;
}
export function buildIm3StoredEvidence(
  submission: Im3ActivitySubmission,
  learnerId: string,
  submissionId: string,
): { evidence: LearningEvidenceV1; masteryBearing: boolean } | null {
  if (
    getSubmissionOwner(submission) !== learnerId ||
    submission.masteryContractVersion !== IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
  )
    return null;
  const kind = exactSelected(submission),
    d = submission.submissionData,
    ordinal = submission.attemptOrdinal;
  if (
    !kind ||
    !Number.isInteger(ordinal) ||
    (ordinal ?? 0) < 1 ||
    d.attemptNumber !== ordinal ||
    typeof d.submittedAt !== "string" ||
    storedTimestampToIso(d.submittedAt) !== d.submittedAt
  )
    return null;
  if (kind === "worked") return null;
  if (
    typeof submission.score !== "number" ||
    typeof submission.maxScore !== "number" ||
    submission.maxScore !== 2 ||
    typeof submission.gradedAt !== "number"
  )
    return null;
  const gradedParts = d.parts as Array<Record<string, unknown>>;
  const partScore = gradedParts.reduce(
    (sum, part) => sum + Number(part.score),
    0,
  );
  if (
    partScore !== submission.score ||
    gradedParts.some(
      (part) => part.isCorrect !== (part.score === part.maxScore),
    )
  )
    return null;
  const occurredAt = storedTimestampToIso(submission.gradedAt);
  if (!occurredAt) return null;
  return {
    masteryBearing: true,
    evidence: normalizeLearningEvidenceV1({
      contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
      nodeId: IM3_PILOT_NODE,
      activityId:
        kind === "guided"
          ? IM3_GUIDED_PRACTICE_ACTIVITY_ID
          : IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      attemptOrdinal: ordinal!,
      origin: "mastery_advantage",
      mode: kind === "guided" ? "guided_practice" : "independent_practice",
      occurredAt,
      gradedEvidence: {
        isCorrect: submission.score === submission.maxScore,
        score: submission.score,
        maxScore: submission.maxScore,
      },
      idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
    }),
  };
}
function isExactIm3TeacherLedSubmission(s: Im3ActivitySubmission) {
  return exactSelected(s) === "worked";
}
function isExactIm3MasterySubmission(s: Im3ActivitySubmission) {
  const k = exactSelected(s);
  return k === "guided" || k === "independent";
}
export function createIm3SubmissionLearningEvidenceHandler({
  evidenceStore,
  receiptStore,
  loadActivitySubmission,
  masteryBridge,
}: Im3SubmissionLearningEvidenceHandlerDependencies): Im3SubmissionLearningEvidenceHandler {
  return {
    process: async ({ learnerId, submissionId }) => {
      if (typeof learnerId !== "string" || learnerId.trim().length === 0) {
        throw new TypeError(
          "learnerId must be a non-empty authenticated identity",
        );
      }

      const existingReceipt = await receiptStore.findBySubmissionId(
        learnerId,
        submissionId,
      );
      if (existingReceipt)
        return { ...existingReceipt, delivery: "replay" as const };

      const submission = await loadActivitySubmission(submissionId);
      if (!submission)
        return { accepted: false, reason: "submission_not_found" as const };
      if (getSubmissionOwner(submission) !== learnerId) {
        // Do not disclose whether an opaque ID belongs to another learner.
        return { accepted: false, reason: "submission_not_found" as const };
      }

      if (
        !isExactIm3TeacherLedSubmission(submission) &&
        !isExactIm3MasterySubmission(submission)
      ) {
        return { accepted: false, reason: "submission_not_found" as const };
      }

      const stored = buildIm3StoredEvidence(
        submission,
        learnerId,
        submissionId,
      );
      if (!stored) {
        throw new Error(
          "IM3 server-owned pilot submission has invalid grading metadata",
        );
      }

      const existingEvidence = await evidenceStore.findByIdempotencyKey(
        learnerId,
        stored.evidence.idempotencyKey,
      );
      if (existingEvidence) {
        throw new Error(
          "IM3 learning evidence exists without a submission receipt; refusing replay synthesis",
        );
      }

      const acceptedEvidence = await evidenceStore.listByLearnerAndNode(
        learnerId,
        stored.evidence.nodeId,
        {
          activityId: stored.evidence.activityId,
          origin: stored.evidence.origin,
          occurredAt: stored.evidence.occurredAt,
        },
      );
      const latestAttemptOrdinal = highestAttemptOrdinal(
        stored.evidence,
        acceptedEvidence,
      );
      if (
        latestAttemptOrdinal !== null &&
        stored.evidence.attemptOrdinal <= latestAttemptOrdinal
      ) {
        return {
          accepted: false,
          reason: "attempt_ordinal_conflict" as const,
          latestAttemptOrdinal,
          receivedAttemptOrdinal: stored.evidence.attemptOrdinal,
        };
      }

      const decision = evaluateLearningEvidenceV1({
        evidence: stored.evidence,
        acceptedEvidence,
        enabledNodeIds: IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
      });
      if (decision.reason === "awaiting_teacher_exposure") {
        const receipt: Im3SubmissionReceipt = {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          decision,
        };
        await receiptStore.append(learnerId, submissionId, receipt);
        return { ...receipt, delivery: "new" as const };
      }

      if (decision.idempotency !== "new" || !isPersistableDecision(decision)) {
        return {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          delivery: "new" as const,
          decision,
        };
      }

      let kstApplied = false;
      if (stored.masteryBearing) {
        await masteryBridge({
          learnerId,
          evidence: stored.evidence,
        });
        kstApplied = true;
      }

      const evidenceId = await evidenceStore.append(
        learnerId,
        stored.evidence,
        submissionId,
      );
      const receipt: Im3SubmissionReceipt = {
        persisted: true,
        masteryApplied: stored.masteryBearing,
        kstApplied,
        decision,
      };
      await receiptStore.append(
        learnerId,
        submissionId,
        receipt,
        evidenceId === undefined ? undefined : String(evidenceId),
      );
      return { ...receipt, delivery: "new" as const };
    },
  };
}

function toContractEvidence(
  document: Doc<"learning_evidence">,
): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1({
    contractVersion: document.contractVersion,
    nodeId: document.nodeId,
    activityId: document.activityId,
    attemptOrdinal: document.attemptOrdinal,
    origin: document.origin,
    mode: document.mode,
    occurredAt: new Date(document.occurredAt).toISOString(),
    ...(document.gradedEvidence === undefined
      ? {}
      : { gradedEvidence: document.gradedEvidence }),
    idempotencyKey: document.idempotencyKey,
  });
}

function createIm3EvidenceStore(ctx: MutationCtx): Im3LearningEvidenceStore & {
  append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId?: string,
  ): Promise<Id<"learning_evidence">>;
} {
  return {
    findByIdempotencyKey: async (learnerId, idempotencyKey) => {
      const document = await ctx.db
        .query("learning_evidence")
        .withIndex("by_learner_and_idempotency_key", (query) =>
          query
            .eq("learnerId", learnerId as Id<"profiles">)
            .eq("idempotencyKey", idempotencyKey),
        )
        .unique();
      return document ? toContractEvidence(document) : null;
    },
    listByLearnerAndNode: async (learnerId, nodeId, options) => {
      const documents: Doc<"learning_evidence">[] = [];
      const seen = new Set<string>();
      const addDocument = (document: Doc<"learning_evidence"> | null) => {
        if (document && !seen.has(String(document._id))) {
          seen.add(String(document._id));
          documents.push(document);
        }
      };
      const occurredAt =
        options?.occurredAt === undefined
          ? Number.NaN
          : Date.parse(options.occurredAt);
      const latestTeacherQuery = ctx.db
        .query("learning_evidence")
        .withIndex("by_learner_node_origin_occurred_at", (query) => {
          const scoped = query
            .eq("learnerId", learnerId as Id<"profiles">)
            .eq("nodeId", nodeId)
            .eq("origin", "teacher_led");
          return Number.isFinite(occurredAt) && typeof scoped.lte === "function"
            ? scoped.lte("occurredAt", occurredAt)
            : scoped;
        })
        .order("desc");
      addDocument(await latestTeacherQuery.first());

      if (options?.activityId !== undefined && options.origin !== undefined) {
        const latestAttempt = await ctx.db
          .query("learning_evidence")
          .withIndex("by_learner_node_activity_origin_attempt", (query) =>
            query
              .eq("learnerId", learnerId as Id<"profiles">)
              .eq("nodeId", nodeId)
              .eq("activityId", options.activityId!)
              .eq("origin", options.origin!),
          )
          .order("desc")
          .first();
        addDocument(latestAttempt);
      }

      return documents.map(toContractEvidence);
    },
    append: async (learnerId, evidence, submissionId) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      if (!Number.isFinite(occurredAt)) {
        throw new TypeError("occurredAt must be a valid ISO timestamp");
      }
      return ctx.db.insert("learning_evidence", {
        learnerId: learnerId as Id<"profiles">,
        ...(submissionId
          ? { submissionId: submissionId as Id<"activity_submissions"> }
          : {}),
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: evidence.nodeId,
        activityId: evidence.activityId,
        attemptOrdinal: evidence.attemptOrdinal,
        origin: evidence.origin,
        mode: evidence.mode,
        occurredAt,
        ...(evidence.gradedEvidence === undefined
          ? {}
          : { gradedEvidence: evidence.gradedEvidence }),
        idempotencyKey: evidence.idempotencyKey,
        fingerprint: learningEvidenceFingerprintV1(evidence),
        createdAt: Date.now(),
      });
    },
  };
}

function createIm3ReceiptStore(
  ctx: MutationCtx,
  now: number,
): Im3SubmissionReceiptStore {
  return {
    findBySubmissionId: async (learnerId, submissionId) => {
      const document = await ctx.db
        .query("learning_evidence_receipts")
        .withIndex("by_learner_and_submission_id", (query) =>
          query
            .eq("learnerId", learnerId as Id<"profiles">)
            .eq("submissionId", submissionId as Id<"activity_submissions">),
        )
        .unique();
      if (!document) return null;
      return {
        persisted: document.persisted,
        masteryApplied: document.masteryApplied,
        kstApplied: document.kstApplied,
        decision: document.decision as Im3LearningEvidenceDecision,
      };
    },
    append: async (learnerId, submissionId, receipt, evidenceId) => {
      await ctx.db.insert("learning_evidence_receipts", {
        learnerId: learnerId as Id<"profiles">,
        submissionId: submissionId as Id<"activity_submissions">,
        ...(evidenceId
          ? { evidenceId: evidenceId as Id<"learning_evidence"> }
          : {}),
        persisted: receipt.persisted,
        masteryApplied: receipt.masteryApplied,
        kstApplied: receipt.kstApplied,
        decision: receipt.decision,
        createdAt: now,
        updatedAt: now,
      });
    },
  };
}

function createSrsSubmission(evidence: LearningEvidenceV1) {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new TypeError(
      "IM3 Mastery Advantage SRS processing requires graded evidence",
    );
  }
  const isCorrect =
    gradedEvidence.isCorrect ??
    (gradedEvidence.score !== undefined &&
      gradedEvidence.maxScore !== undefined &&
      gradedEvidence.score === gradedEvidence.maxScore);
  return buildPracticeSubmissionEnvelope({
    activityId: toConvexActivityId(evidence.activityId),
    mode: evidence.mode,
    status: "graded",
    attemptNumber: evidence.attemptOrdinal,
    submittedAt: evidence.occurredAt,
    answers: {},
    parts: [
      {
        partId: "learning-evidence-graded-outcome",
        rawAnswer: null,
        isCorrect,
        ...(gradedEvidence.score === undefined
          ? {}
          : { score: gradedEvidence.score }),
        ...(gradedEvidence.maxScore === undefined
          ? {}
          : { maxScore: gradedEvidence.maxScore }),
      },
    ],
  });
}

async function createSelectedGraphSrsSubmission(
  ctx: MutationCtx,
  learnerId: string,
  evidence: LearningEvidenceV1,
  submissionId: string,
) {
  if (
    evidence.activityId !== IM3_GUIDED_PRACTICE_ACTIVITY_ID &&
    evidence.activityId !== IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
  ) {
    return createSrsSubmission(evidence);
  }

  const submission = await ctx.db.get(
    "activity_submissions",
    submissionId as Id<"activity_submissions">,
  );
  const activity = submission
    ? await ctx.db.get("activities", submission.activityId)
    : null;
  if (!submission || !activity) {
    throw new Error("The IM3 selected graph SRS source submission is missing");
  }

  const gradedParts = submission.submissionData.parts;
  const partGradesAreValid =
    gradedParts.length > 0 &&
    gradedParts.every(
      (part) =>
        typeof part.score === "number" &&
        Number.isFinite(part.score) &&
        typeof part.maxScore === "number" &&
        Number.isFinite(part.maxScore) &&
        part.maxScore > 0 &&
        part.score >= 0 &&
        part.score <= part.maxScore &&
        part.isCorrect === (part.score === part.maxScore),
    );
  const partScore = gradedParts.reduce(
    (total, part) => total + (part.score ?? Number.NaN),
    0,
  );
  const partMaxScore = gradedParts.reduce(
    (total, part) => total + (part.maxScore ?? Number.NaN),
    0,
  );
  if (
    !partGradesAreValid ||
    !Number.isFinite(partScore) ||
    !Number.isFinite(partMaxScore) ||
    partScore !== submission.score ||
    partMaxScore !== submission.maxScore
  ) {
    throw new Error(
      "The IM3 selected graph SRS stored grade does not match its graded parts",
    );
  }

  const stored = buildIm3StoredEvidence(
    {
      submissionId: String(submission._id),
      userId: String(submission.userId),
      activityId: String(submission.activityId),
      activity: {
        stableActivityId: activity.stableActivityId,
        masteryNodeId: activity.masteryNodeId,
        componentKey: activity.componentKey,
        srsEligible: activity.srsEligible,
        learningEvidenceMode: activity.learningEvidenceMode,
        props: activity.props,
        gradingConfig: activity.gradingConfig,
        approval: activity.approval,
      },
      masteryContractVersion: submission.masteryContractVersion,
      submissionData: submission.submissionData,
      score: submission.score,
      maxScore: submission.maxScore,
      attemptOrdinal: submission.attemptOrdinal,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
    },
    learnerId,
    submissionId,
  );
  if (
    !stored ||
    !stored.masteryBearing ||
    stored.evidence.nodeId !== evidence.nodeId ||
    stored.evidence.activityId !== evidence.activityId ||
    stored.evidence.mode !== evidence.mode ||
    stored.evidence.attemptOrdinal !== evidence.attemptOrdinal ||
    stored.evidence.gradedEvidence?.score !== evidence.gradedEvidence?.score ||
    stored.evidence.gradedEvidence?.maxScore !==
      evidence.gradedEvidence?.maxScore ||
    stored.evidence.gradedEvidence?.isCorrect !==
      evidence.gradedEvidence?.isCorrect
  ) {
    throw new Error("The IM3 selected graph SRS source submission is invalid");
  }

  const data = submission.submissionData;
  return buildPracticeSubmissionEnvelope({
    activityId: toConvexActivityId(String(submission.activityId)),
    mode: data.mode,
    status: data.status,
    attemptNumber: data.attemptNumber,
    submittedAt: data.submittedAt,
    answers: data.answers,
    parts: data.parts,
    artifact: data.artifact,
    interactionHistory: data.interactionHistory,
    analytics: data.analytics,
    studentFeedback: data.studentFeedback,
    teacherSummary: data.teacherSummary,
    timing: data.timing,
  });
}

async function applyIm3SrsReview(
  ctx: MutationCtx,
  learnerId: string,
  evidence: LearningEvidenceV1,
  options: { now: number; submissionId: string },
): Promise<void> {
  const srsSubmission = await createSelectedGraphSrsSubmission(
    ctx,
    learnerId,
    evidence,
    options.submissionId,
  );
  const isSelectedGraphSubmission =
    evidence.activityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID ||
    evidence.activityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  const selectedRatingInput = isSelectedGraphSubmission
    ? {
        parts: srsSubmission.parts.map((part) => {
          if (part.isCorrect === undefined) {
            throw new Error(
              "The IM3 selected graph SRS part is not server graded",
            );
          }
          return {
            partId: part.partId,
            isCorrect: part.isCorrect,
            hintsUsed: part.hintsUsed ?? 0,
            revealStepsSeen: 0,
            totalRevealSteps: 0,
            misconceptionTags: part.misconceptionTags ?? [],
          };
        }),
        severityByTag: {},
      }
    : undefined;
  const adapter = new SubmissionSrsAdapter({
    cardStore: new ConvexCardStore(ctx),
    reviewLogStore: new ConvexReviewLogStore(ctx),
    resolver: {
      resolve: async (activityId) =>
        activityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
          ? {
              variantKey: IM3_GUIDED_VARIANT_KEY,
              objectiveId: IM3_PILOT_NODE,
              schedulerContext: {
                objectivePriority: "essential" as const,
                config: { requestRetentionByPriority: {} },
              },
            }
          : activityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
            ? {
                variantKey: IM3_PILOT_VARIANT_KEY,
                objectiveId: IM3_PILOT_NODE,
                schedulerContext: {
                  objectivePriority: "essential" as const,
                  config: { requestRetentionByPriority: {} },
                },
              }
            : null,
    },
    baselineResolver: { getBaseline: async () => null },
    requireAtomicPersistence: true,
  });
  const result = await adapter.processSubmission({
    submission: srsSubmission,
    studentId: learnerId,
    activityId: evidence.activityId,
    now: new Date(options.now).toISOString(),
    submissionId: options.submissionId,
    ...(selectedRatingInput === undefined
      ? {}
      : { ratingInputV31: selectedRatingInput }),
  });
  if (!result.ok || result.skipped)
    throw new Error(
      "The IM3 learning-evidence SRS boundary rejected eligible evidence",
    );
}

export function createIm3ServerOwnedSubmissionHandler({
  ctx,
  masteryBridge,
  learnerId,
}: {
  readonly ctx: MutationCtx;
  readonly masteryBridge: (input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<void>;
  readonly learnerId: string;
}): Im3ServerOwnedSubmissionLearningEvidenceHandler {
  const handler = createIm3SubmissionLearningEvidenceHandler({
    evidenceStore: createIm3EvidenceStore(ctx),
    receiptStore: createIm3ReceiptStore(ctx, Date.now()),
    loadActivitySubmission: async (submissionId) => {
      const submission = await ctx.db.get(
        "activity_submissions",
        submissionId as Id<"activity_submissions">,
      );
      if (!submission) return null;
      const activity = await ctx.db.get("activities", submission.activityId);
      if (!activity) return null;
      return {
        submissionId: String(submission._id),
        userId: String(submission.userId),
        activityId: String(submission.activityId),
        activity: {
          stableActivityId: activity.stableActivityId,
          masteryNodeId: activity.masteryNodeId,
          componentKey: activity.componentKey,
          srsEligible: activity.srsEligible,
          learningEvidenceMode: activity.learningEvidenceMode,
          props: activity.props,
          gradingConfig: activity.gradingConfig,
          approval: activity.approval,
        },
        masteryContractVersion: submission.masteryContractVersion,
        submissionData: submission.submissionData,
        score: submission.score,
        maxScore: submission.maxScore,
        attemptOrdinal: submission.attemptOrdinal,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      };
    },
    masteryBridge,
  });

  return {
    process: async ({ submissionId }) => {
      return handler.process({ learnerId, submissionId });
    },
  };
}

type TeacherExposureArgs = {
  teacherId: Id<"profiles">;
  studentId: Id<"profiles">;
  classId: Id<"classes">;
  submissionId: Id<"activity_submissions">;
  idempotencyKey: string;
};

async function isActivityInPublishedLesson(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<"lessons">,
  activityId: Id<"activities">,
): Promise<boolean> {
  const versions = (
    await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (query) => query.eq("lessonId", lessonId))
      .collect()
  )
    .filter((version) => version.status === "published")
    .sort((left, right) => right.version - left.version);
  const current = versions[0];
  if (!current) return false;
  const phases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (query) =>
      query.eq("lessonVersionId", current._id),
    )
    .collect();
  for (const phase of phases) {
    if (phase.phaseType !== "worked_example") continue;
    const sections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (query) =>
        query.eq("phaseVersionId", phase._id),
      )
      .collect();
    if (
      sections.some((section) => {
        if (section.sectionType !== "activity") return false;
        const content = section.content as {
          activityId?: unknown;
          componentKey?: unknown;
        };
        return (
          String(content.activityId) === String(activityId) &&
          content.componentKey === "graphing-explorer"
        );
      })
    )
      return true;
  }
  return false;
}

function isExactIm3GraphWorkedAcknowledgement(
  submission: Doc<"activity_submissions">,
  activity: Doc<"activities">,
): boolean {
  const data = submission.submissionData;
  const props = activity.props as { variant?: unknown; equation?: unknown };
  const grading = activity.gradingConfig;
  return (
    submission.masteryContractVersion ===
      IM3_LEARNING_EVIDENCE_CONTRACT_VERSION &&
    Number.isInteger(submission.attemptOrdinal) &&
    (submission.attemptOrdinal ?? 0) > 0 &&
    Number.isFinite(submission.submittedAt) &&
    submission.score === undefined &&
    submission.maxScore === undefined &&
    submission.gradedAt === undefined &&
    Object.keys(data).sort().join("|") ===
      "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt" &&
    data.contractVersion === "practice.v1" &&
    data.activityId === String(activity._id) &&
    data.mode === "worked_example" &&
    data.status === "submitted" &&
    data.attemptNumber === submission.attemptOrdinal &&
    typeof data.submittedAt === "string" &&
    storedTimestampToIso(data.submittedAt) === data.submittedAt &&
    Object.keys(data.answers).length === 0 &&
    data.parts.length === 0 &&
    Object.keys(props ?? {})
      .sort()
      .join("|") === "equation|variant" &&
    Object.keys(grading ?? {})
      .sort()
      .join("|") === "autoGrade|partialCredit" &&
    grading?.autoGrade === false &&
    grading.partialCredit === false &&
    props.variant === "plot_from_equation" &&
    props.equation === "f(x) = x^2"
  );
}

export async function recordIm3GraphTeacherExposureHandler(
  ctx: MutationCtx,
  args: TeacherExposureArgs,
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  const key = args.idempotencyKey.trim();
  if (!key) throw new Error("invalid_exposure");
  if (!isIm3GraphPilotPublished(publication))
    throw new Error("unpublished_curriculum");
  const [teacher, student, classroom, enrollment, submission] =
    await Promise.all([
      ctx.db.get("profiles", args.teacherId),
      ctx.db.get("profiles", args.studentId),
      ctx.db.get("classes", args.classId),
      ctx.db
        .query("class_enrollments")
        .withIndex("by_class_and_student", (query) =>
          query.eq("classId", args.classId).eq("studentId", args.studentId),
        )
        .unique(),
      ctx.db.get("activity_submissions", args.submissionId),
    ]);
  if (
    !teacher ||
    teacher.role !== "teacher" ||
    !student ||
    student.role !== "student" ||
    student.organizationId !== teacher.organizationId ||
    !classroom ||
    classroom.teacherId !== args.teacherId ||
    classroom.archived ||
    enrollment?.status !== "active"
  )
    throw new Error("unauthorized_exposure");
  if (!submission || submission.userId !== args.studentId) {
    throw new Error("invalid_source_submission");
  }
  const activity = await ctx.db.get("activities", submission.activityId);
  if (
    !activity ||
    activity.masteryNodeId !== IM3_PILOT_NODE ||
    activity.stableActivityId !== IM3_TEACHER_LED_ACTIVITY_ID ||
    activity.componentKey !== "graphing-explorer" ||
    activity.learningEvidenceMode !== "worked_example" ||
    activity.srsEligible !== false ||
    activity.approval?.status !== "approved" ||
    !isExactIm3GraphWorkedAcknowledgement(submission, activity)
  )
    throw new Error("invalid_source_submission");
  const lesson = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (query) => query.eq("slug", "module-1-lesson-1"))
    .unique();
  const assignment = lesson
    ? await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (query) =>
          query.eq("classId", args.classId).eq("lessonId", lesson._id),
        )
        .unique()
    : null;
  if (
    !assignment ||
    !lesson ||
    !(await isActivityInPublishedLesson(ctx, lesson._id, activity._id)) ||
    submission.submittedAt <
      Math.max(enrollment.enrolledAt, assignment.assignedAt)
  )
    throw new Error("invalid_source_assignment");
  const sourceRows = await ctx.db
    .query("learning_evidence")
    .withIndex("by_learner_and_submission_id", (query) =>
      query
        .eq("learnerId", args.studentId)
        .eq("submissionId", args.submissionId),
    )
    .collect();
  const sameSource = sourceRows.find((row) => row.origin === "teacher_led");
  const existing = await ctx.db
    .query("learning_evidence")
    .withIndex("by_learner_and_idempotency_key", (query) =>
      query.eq("learnerId", args.studentId).eq("idempotencyKey", key),
    )
    .unique();
  const isCanonicalReplay = (row: Doc<"learning_evidence">) =>
    row.submissionId === args.submissionId &&
    row.contractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION &&
    row.nodeId === IM3_PILOT_NODE &&
    row.activityId === IM3_TEACHER_LED_ACTIVITY_ID &&
    row.attemptOrdinal === submission.attemptOrdinal &&
    row.origin === "teacher_led" &&
    row.mode === "teaching";
  if (existing) {
    if (!isCanonicalReplay(existing)) {
      throw new Error("idempotency_conflict");
    }
    return { evidenceId: existing._id, replay: true };
  }
  if (sameSource) {
    if (!isCanonicalReplay(sameSource)) throw new Error("idempotency_conflict");
    return { evidenceId: sameSource._id, replay: true };
  }
  const now = Date.now();
  const teacherEvidence = normalizeLearningEvidenceV1({
    contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
    nodeId: IM3_PILOT_NODE,
    activityId: IM3_TEACHER_LED_ACTIVITY_ID,
    attemptOrdinal: submission.attemptOrdinal ?? 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: new Date(now).toISOString(),
    idempotencyKey: key,
  });
  const evidenceId = await ctx.db.insert("learning_evidence", {
    learnerId: args.studentId,
    submissionId: args.submissionId,
    contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
    nodeId: IM3_PILOT_NODE,
    activityId: IM3_TEACHER_LED_ACTIVITY_ID,
    attemptOrdinal: submission.attemptOrdinal ?? 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: now,
    idempotencyKey: key,
    fingerprint: learningEvidenceFingerprintV1(teacherEvidence),
    createdAt: now,
  });
  return { evidenceId, replay: false };
}

export const recordIm3GraphTeacherExposure = internalMutation({
  args: {
    teacherId: v.id("profiles"),
    studentId: v.id("profiles"),
    classId: v.id("classes"),
    submissionId: v.id("activity_submissions"),
    idempotencyKey: v.string(),
  },
  returns: v.object({
    evidenceId: v.id("learning_evidence"),
    replay: v.boolean(),
  }),
  handler: recordIm3GraphTeacherExposureHandler,
});

export async function getIm3GraphTeacherExposureCandidatesHandler(
  ctx: QueryCtx,
  args: { teacherId: Id<"profiles"> },
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  if (!isIm3GraphPilotPublished(publication)) return [];
  const teacher = await ctx.db.get("profiles", args.teacherId);
  if (!teacher || teacher.role !== "teacher") return [];
  const lesson = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (query) => query.eq("slug", "module-1-lesson-1"))
    .unique();
  const activity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (query) =>
      query.eq("stableActivityId", IM3_TEACHER_LED_ACTIVITY_ID),
    )
    .unique();
  if (
    !lesson ||
    !activity ||
    activity.stableActivityId !== IM3_TEACHER_LED_ACTIVITY_ID ||
    activity.approval?.status !== "approved" ||
    activity.componentKey !== "graphing-explorer" ||
    activity.srsEligible !== false ||
    activity.masteryNodeId !== IM3_PILOT_NODE ||
    activity.learningEvidenceMode !== "worked_example"
  )
    return [];
  if (!(await isActivityInPublishedLesson(ctx, lesson._id, activity._id)))
    return [];
  const classes = (
    await ctx.db
      .query("classes")
      .withIndex("by_teacher", (query) => query.eq("teacherId", args.teacherId))
      .collect()
  ).filter((row) => !row.archived);
  const candidates = [];
  for (const classroom of classes) {
    const assignment = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (query) =>
        query.eq("classId", classroom._id).eq("lessonId", lesson._id),
      )
      .unique();
    if (!assignment) continue;
    const enrollments = (
      await ctx.db
        .query("class_enrollments")
        .withIndex("by_class", (query) => query.eq("classId", classroom._id))
        .collect()
    ).filter((row) => row.status === "active");
    for (const enrollment of enrollments) {
      const student = await ctx.db.get("profiles", enrollment.studentId);
      if (
        !student ||
        student.role !== "student" ||
        student.organizationId !== teacher.organizationId
      )
        continue;
      const submissions = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_activity", (query) =>
          query
            .eq("userId", enrollment.studentId)
            .eq("activityId", activity._id),
        )
        .collect();
      for (const submission of submissions) {
        if (
          submission.submittedAt <
          Math.max(enrollment.enrolledAt, assignment.assignedAt)
        )
          continue;
        if (!isExactIm3GraphWorkedAcknowledgement(submission, activity))
          continue;
        const evidence = await ctx.db
          .query("learning_evidence")
          .withIndex("by_learner_and_submission_id", (query) =>
            query
              .eq("learnerId", enrollment.studentId)
              .eq("submissionId", submission._id),
          )
          .collect();
        if (evidence.some((row) => row.origin === "teacher_led")) continue;
        candidates.push({
          classId: classroom._id,
          studentId: enrollment.studentId,
          submissionId: submission._id,
          className: classroom.name,
          studentName: student.displayName ?? student.username,
          lessonTitle: lesson.title,
          response:
            "The student acknowledged reviewing the worked graph of f(x) = x².",
          score: submission.score ?? null,
          maxScore: submission.maxScore ?? null,
          submittedAt: submission.submittedAt,
        });
      }
    }
  }
  return candidates;
}

export const getIm3GraphTeacherExposureCandidates = internalQuery({
  args: { teacherId: v.id("profiles") },
  returns: v.array(
    v.object({
      classId: v.id("classes"),
      studentId: v.id("profiles"),
      submissionId: v.id("activity_submissions"),
      className: v.string(),
      studentName: v.string(),
      lessonTitle: v.string(),
      response: v.string(),
      score: v.union(v.number(), v.null()),
      maxScore: v.union(v.number(), v.null()),
      submittedAt: v.number(),
    }),
  ),
  handler: getIm3GraphTeacherExposureCandidatesHandler,
});

export async function submitIm3PublishedEvidenceHandler(
  ctx: MutationCtx,
  args: { learnerId: Id<"profiles">; submissionId: Id<"activity_submissions"> },
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  const submission = await ctx.db.get(
    "activity_submissions",
    args.submissionId,
  );
  const activity = submission
    ? await ctx.db.get("activities", submission.activityId)
    : null;
  const isExactGraphActivity =
    activity?.masteryNodeId === IM3_PILOT_NODE &&
    typeof activity.stableActivityId === "string" &&
    activity.stableActivityId.startsWith(`${IM3_PILOT_NODE}.`);
  if (isExactGraphActivity && !isIm3GraphPilotPublished(publication)) {
    throw new Error("unpublished_curriculum");
  }
  const serverNow = Date.now();
  const handler = createIm3ServerOwnedSubmissionHandler({
    ctx,
    learnerId: String(args.learnerId),
    masteryBridge: async ({ learnerId, evidence }) => {
      const marker = ":submission:";
      const markerIndex = evidence.idempotencyKey.lastIndexOf(marker);
      const submissionId =
        markerIndex >= 0
          ? evidence.idempotencyKey.slice(markerIndex + marker.length)
          : String(args.submissionId);
      await applyIm3SrsReview(ctx, learnerId, evidence, {
        now: serverNow,
        submissionId,
      });
    },
  });
  return handler.process({ submissionId: String(args.submissionId) });
}

/** Internal mutation called by the authenticated opaque submission route. */
export const submit = internalMutation({
  args: {
    learnerId: v.id("profiles"),
    submissionId: v.id("activity_submissions"),
  },
  returns: learningEvidenceResultValidator,
  handler: submitIm3PublishedEvidenceHandler,
});
