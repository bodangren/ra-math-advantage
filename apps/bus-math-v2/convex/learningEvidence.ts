import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from "@math-platform/practice-core";
import {
  buildPracticeSubmissionEnvelope,
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";
import {
  SubmissionSrsAdapter,
  type SrsCardState,
  type SrsReviewLogEntryV31,
} from "@math-platform/srs-engine";
import type { CardStore, ReviewLogStore } from "@math-platform/srs-engine/adapters";

import { internalMutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v, type Infer } from "convex/values";

import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_NODE,
  BM2_PILOT_PROBLEM_FAMILY_ID,
  BM2_PILOT_SOURCE_ACTIVITY_ID,
  bm2ProblemFamilyIdToVariantKey,
  bm2VariantKeyToProblemFamilyId,
  isBm2PilotPublished,
  isBm2PilotSourcePublished,
} from "../lib/learning-evidence/bm2-pilot";

const learningEvidenceDecisionValidator = v.object({
  idempotency: v.union(v.literal("new"), v.literal("replay"), v.literal("conflict")),
  exposureState: v.union(v.literal("awaiting_teacher_exposure"), v.literal("introduced")),
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

export interface Bm2LearningEvidenceStore {
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    options: Pick<LearningEvidenceV1, "activityId" | "origin" | "occurredAt">,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1, submissionId: string): Promise<void>;
}

/** Minimal server-owned activity submission projection used by the pilot. */
export interface Bm2ActivitySubmission {
  submissionId: string;
  userId: string;
  activityId: string;
  /** Stable identity of the physical activity foreign key, when projected. */
  activityStableActivityId?: string;
  /** Stable identity and ordinal written by the server on the submission row. */
  stableActivityId?: string;
  attemptOrdinal?: number;
  masteryContractVersion?: string;
  /** True only after an authorized teacher verifies this learner submission. */
  trustedTeacherExposure?: boolean;
  submissionData: {
    contractVersion?: string;
    activityId?: string;
    mode?: LearningEvidenceV1["mode"];
    status?: string;
    [key: string]: unknown;
  };
  score?: number;
  maxScore?: number;
  gradedAt?: number | string;
  submittedAt?: number | string;
}

export interface Bm2SubmissionReceipt {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: LearningEvidenceDecisionV1;
}

export interface Bm2SubmissionReceiptStore {
  findBySubmissionId(learnerId: string, submissionId: string): Promise<Bm2SubmissionReceipt | null>;
  append(learnerId: string, submissionId: string, receipt: Bm2SubmissionReceipt): Promise<void>;
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

function storedTimestampToIso(value: number | string | undefined): string | null {
  if (value === undefined) return null;
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

const GENERATED_BM2_STABLE_ACTIVITY_ID = /^accounting-equation-\d+-(assets|liabilities|equity)$/;

function buildBm2StoredEvidence(
  submission: Bm2ActivitySubmission,
  learnerId: string,
  submissionId: string,
): { evidence: LearningEvidenceV1; masteryBearing: boolean } | null {
  if (submission.userId !== learnerId) return null;

  const data = submission.submissionData;
  if (typeof data !== "object" || data === null) return null;
  if (data.contractVersion !== "practice.v1") return null;

  const stableActivityId = submission.stableActivityId;
  const serverAttemptOrdinal = submission.attemptOrdinal;
  if (
    typeof stableActivityId !== "string" ||
    stableActivityId.trim().length === 0 ||
    typeof serverAttemptOrdinal !== "number" ||
    !Number.isInteger(serverAttemptOrdinal) ||
    serverAttemptOrdinal < 1
  ) {
    return null;
  }

  if (submission.masteryContractVersion !== "learning-evidence.v1") return null;

  const activityId = data.activityId;
  const mode = data.mode;
  if (typeof activityId !== "string" || typeof mode !== "string") return null;

  const mapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0];
  const source = mapping.source;
  const mastery = mapping.masteryAdvantage;
  const isTeacherLed =
    stableActivityId === source.activityId &&
    submission.trustedTeacherExposure === true &&
    submission.activityStableActivityId === source.activityId &&
    submission.activityId === activityId &&
    activityId !== source.activityId &&
    mode === source.mode;
  const isMasteryAdvantage =
    (stableActivityId === mastery.activityId ||
      GENERATED_BM2_STABLE_ACTIVITY_ID.test(stableActivityId)) &&
    submission.activityStableActivityId === source.activityId &&
    activityId === mastery.activityId &&
    mode === "independent_practice" &&
    data.status === "graded";
  if (!isTeacherLed && !isMasteryAdvantage) return null;

  if (isTeacherLed && data.status !== "graded") return null;

  const occurredAt = storedTimestampToIso(submission.submittedAt);
  if (!occurredAt) return null;

  if (isTeacherLed) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: "learning-evidence.v1",
        nodeId: BM2_PILOT_NODE,
        activityId: source.activityId,
        attemptOrdinal: serverAttemptOrdinal,
        origin: "teacher_led",
        mode: source.mode,
        occurredAt,
        idempotencyKey: `bm2:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  const score = submission.score;
  const maxScore = submission.maxScore;
  const gradedAt = storedTimestampToIso(submission.gradedAt);
  if (
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    typeof maxScore !== "number" ||
    !Number.isFinite(maxScore) ||
    maxScore <= 0 ||
    score < 0 ||
    score > maxScore ||
    gradedAt === null
  ) {
    return null;
  }

  return {
    masteryBearing: true,
    evidence: normalizeLearningEvidenceV1({
      contractVersion: "learning-evidence.v1",
      nodeId: BM2_PILOT_NODE,
      activityId: mastery.activityId,
      attemptOrdinal: serverAttemptOrdinal,
      origin: "mastery_advantage",
      mode: mode as LearningEvidenceV1["mode"],
      occurredAt,
      gradedEvidence: {
        isCorrect: score === maxScore,
        score,
        maxScore,
      },
      idempotencyKey: `bm2:mastery-advantage:submission:${submissionId}`,
    }),
  };
}

/**
 * Creates the server-owned BM2 submission boundary. The submission document
 * is the only source for pilot mapping, timing, attempt, and grade fields.
 */
export function createBm2SubmissionLearningEvidenceHandler({
  evidenceStore,
  loadActivitySubmission,
  masteryBridge,
  receiptStore,
}: {
  evidenceStore: Bm2LearningEvidenceStore;
  loadActivitySubmission: (submissionId: string) => Promise<Bm2ActivitySubmission | null>;
  masteryBridge: (input: {
    learnerId: string;
    submissionId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<void>;
  receiptStore: Bm2SubmissionReceiptStore;
}): {
  process(input: {
    learnerId: string;
    submissionId: string;
  }): Promise<Infer<typeof learningEvidenceResultValidator>>;
} {
  return {
    process: async ({ learnerId, submissionId }) => {
      const existingReceipt = await receiptStore.findBySubmissionId(learnerId, submissionId);
      if (existingReceipt) return { ...existingReceipt, delivery: "replay" as const };

      const submission = await loadActivitySubmission(submissionId);
      if (!submission) return { accepted: false, reason: "submission_not_found" };

      const stored = buildBm2StoredEvidence(submission, learnerId, submissionId);
      if (!stored) return { accepted: false, reason: "submission_not_found" };

      const acceptedEvidence = await evidenceStore.listByLearnerAndNode(
        learnerId,
        stored.evidence.nodeId,
        {
          activityId: stored.evidence.activityId,
          origin: stored.evidence.origin,
          occurredAt: stored.evidence.occurredAt,
        },
      );
      const latestAttemptOrdinal = highestAttemptOrdinal(stored.evidence, acceptedEvidence);
      if (latestAttemptOrdinal !== null && stored.evidence.attemptOrdinal <= latestAttemptOrdinal) {
        return {
          accepted: false,
          reason: "attempt_ordinal_conflict",
          latestAttemptOrdinal,
          receivedAttemptOrdinal: stored.evidence.attemptOrdinal,
        };
      }
      const decision = evaluateLearningEvidenceV1({
        evidence: stored.evidence,
        acceptedEvidence,
        enabledNodeIds: BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds,
      });

      if (
        decision.idempotency !== "new" ||
        (decision.reason !== "teacher_led" &&
          decision.reason !== "ungraded_evidence" &&
          decision.reason !== "eligible")
      ) {
        return {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          delivery: "new" as const,
          decision,
        };
      }

      if (stored.masteryBearing) {
        await masteryBridge({
          learnerId,
          submissionId,
          evidence: stored.evidence,
        });
      }

      await evidenceStore.append(learnerId, stored.evidence, submissionId);
      const receipt: Bm2SubmissionReceipt = {
        persisted: true,
        masteryApplied: stored.masteryBearing,
        kstApplied: false,
        decision,
      };
      await receiptStore.append(learnerId, submissionId, receipt);
      return { ...receipt, delivery: "new" as const };
    },
  };
}

function createEvidenceStore(ctx: MutationCtx): Bm2LearningEvidenceStore {
  return {
    listByLearnerAndNode: async (learnerId, nodeId, options) => {
      const documents: Doc<"learning_evidence">[] = [];
      const seen = new Set<string>();
      const addDocument = (document: Doc<"learning_evidence"> | null) => {
        if (document && !seen.has(String(document._id))) {
          seen.add(String(document._id));
          documents.push(document);
        }
      };
      const occurredAt = Date.parse(options.occurredAt);
      const latestTeacherQuery = ctx.db
        .query("learning_evidence")
        .withIndex("by_student_node_origin_occurred_at", (query) =>
          query
            .eq("studentId", learnerId as Id<"profiles">)
            .eq("nodeId", nodeId)
            .eq("origin", "teacher_led")
            .lte("occurredAt", occurredAt),
        );
      const orderedLatestTeacherQuery = latestTeacherQuery.order("desc");
      addDocument(await orderedLatestTeacherQuery.first());

      const latestAttemptQuery = ctx.db
        .query("learning_evidence")
        .withIndex("by_student_node_activity_origin_attempt", (query) =>
          query
            .eq("studentId", learnerId as Id<"profiles">)
            .eq("nodeId", nodeId)
            .eq("activityId", options.activityId)
            .eq("origin", options.origin),
        );
      const orderedLatestAttemptQuery = latestAttemptQuery.order("desc");
      addDocument(await orderedLatestAttemptQuery.first());

      return documents.map((document) =>
        normalizeLearningEvidenceV1({
          contractVersion: document.contractVersion,
          nodeId: document.nodeId,
          activityId: document.activityId,
          attemptOrdinal: document.attemptOrdinal,
          origin: document.origin,
          mode: document.mode,
          occurredAt: new Date(document.occurredAt).toISOString(),
          gradedEvidence: document.gradedEvidence,
          idempotencyKey: document.idempotencyKey,
        }),
      );
    },
    append: async (learnerId, evidence, submissionId) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      if (!Number.isFinite(occurredAt)) {
        throw new TypeError("occurredAt must be a valid ISO timestamp");
      }
      await ctx.db.insert("learning_evidence", {
        studentId: learnerId as Id<"profiles">,
        submissionId: submissionId as Id<"activity_submissions">,
        contractVersion: "learning-evidence.v1",
        nodeId: evidence.nodeId,
        activityId: evidence.activityId,
        attemptOrdinal: evidence.attemptOrdinal,
        origin: evidence.origin,
        mode: evidence.mode,
        occurredAt,
        gradedEvidence: evidence.gradedEvidence,
        idempotencyKey: evidence.idempotencyKey,
        createdAt: Date.now(),
      });
    },
  };
}

function createBm2ReceiptStore(ctx: MutationCtx, now: number): Bm2SubmissionReceiptStore {
  return {
    findBySubmissionId: async (learnerId, submissionId) => {
      const document = await ctx.db
        .query("learning_evidence_receipts")
        .withIndex("by_student_and_submission_id", (query) =>
          query
            .eq("studentId", learnerId as Id<"profiles">)
            .eq("submissionId", submissionId as Id<"activity_submissions">),
        )
        .unique();
      if (!document) return null;
      return {
        persisted: document.persisted,
        masteryApplied: document.masteryApplied,
        kstApplied: document.kstApplied,
        decision: document.decision as LearningEvidenceDecisionV1,
      };
    },
    append: async (learnerId, submissionId, receipt) => {
      await ctx.db.insert("learning_evidence_receipts", {
        studentId: learnerId as Id<"profiles">,
        submissionId: submissionId as Id<"activity_submissions">,
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

function toSrsCard(document: Doc<"srs_cards">): SrsCardState {
  return {
    cardId: document.cardId,
    studentId: document.studentId,
    objectiveId: document.objectiveId,
    variantKey: bm2ProblemFamilyIdToVariantKey(document.problemFamilyId),
    stability: document.stability,
    difficulty: document.difficulty,
    state: document.state,
    dueDate: document.dueDate,
    elapsedDays: document.elapsedDays,
    scheduledDays: document.scheduledDays,
    reps: document.reps,
    lapses: document.lapses,
    lastReview: document.lastReview,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function toDatabaseCard(card: SrsCardState) {
  return {
    cardId: card.cardId,
    studentId: card.studentId as Id<"profiles">,
    objectiveId: card.objectiveId,
    problemFamilyId: bm2VariantKeyToProblemFamilyId(card.variantKey),
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    dueDate: card.dueDate,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

function createSrsStores(ctx: MutationCtx): {
  cardStore: CardStore;
  reviewLogStore: ReviewLogStore;
} {
  const getCardDocumentByVariant = async (studentId: string, variantKey: string) => {
    const document = await ctx.db
      .query("srs_cards")
      .withIndex("by_student_family", (query) =>
        query
          .eq("studentId", studentId as Id<"profiles">)
          .eq("problemFamilyId", bm2VariantKeyToProblemFamilyId(variantKey)),
      )
      .unique();
    return document ?? null;
  };

  const getCardByVariant = async (studentId: string, variantKey: string) => {
    const document = await getCardDocumentByVariant(studentId, variantKey);
    return document ? toSrsCard(document) : null;
  };

  const saveCardAndReview = async (card: SrsCardState, reviewLog: SrsReviewLogEntryV31) => {
    const existing = await getCardDocumentByVariant(card.studentId, card.variantKey);
    if (existing) {
      await ctx.db.patch(existing._id, toDatabaseCard(card));
    } else {
      await ctx.db.insert("srs_cards", toDatabaseCard(card));
    }

    const reviewedAt = Date.parse(reviewLog.reviewedAt);
    if (!Number.isFinite(reviewedAt)) {
      throw new TypeError("reviewedAt must be a valid ISO timestamp");
    }
    const scheduledAt = existing ? Date.parse(existing.dueDate) : Date.parse(card.createdAt);

    await ctx.db.insert("srs_review_log", {
      studentId: card.studentId as Id<"profiles">,
      problemFamilyId: bm2VariantKeyToProblemFamilyId(card.variantKey),
      rating: reviewLog.rating,
      submissionId: reviewLog.submissionId,
      scheduledAt: Number.isFinite(scheduledAt) ? scheduledAt : reviewedAt,
      reviewedAt,
      elapsedDays: card.elapsedDays,
      scheduledDays: card.scheduledDays,
      stateBefore: reviewLog.stateBefore,
      stateAfter: reviewLog.stateAfter,
    });
  };

  const cardStore: CardStore = {
    // BM2 stores a legacy string cardId without a cardId index. Submission
    // processing uses the indexed student/variant lookup below.
    getCard: async () => null,
    getCardsByStudent: async (studentId) => {
      const documents = await ctx.db
        .query("srs_cards")
        .withIndex("by_student", (query) => query.eq("studentId", studentId as Id<"profiles">))
        .collect();
      return documents
        .filter((document) => document.problemFamilyId === BM2_PILOT_PROBLEM_FAMILY_ID)
        .map(toSrsCard);
    },
    // The existing BM2 schema has no objective-only index. The atomic
    // submission path does not call this method.
    getCardsByObjective: async () => [],
    getCardByStudentAndVariant: getCardByVariant,
    getDueCards: async (studentId, now) => {
      const nowMs = Date.parse(now);
      const documents = await ctx.db
        .query("srs_cards")
        .withIndex("by_student", (query) => query.eq("studentId", studentId as Id<"profiles">))
        .collect();
      return documents
        .filter(
          (document) =>
            document.problemFamilyId === BM2_PILOT_PROBLEM_FAMILY_ID &&
            Date.parse(document.dueDate) <= nowMs,
        )
        .map(toSrsCard);
    },
    saveCard: async (card) => {
      const existing = await getCardDocumentByVariant(card.studentId, card.variantKey);
      if (existing) {
        await ctx.db.patch(existing._id, toDatabaseCard(card));
      } else {
        await ctx.db.insert("srs_cards", toDatabaseCard(card));
      }
    },
    saveCards: async (cards) => {
      for (const card of cards) {
        await cardStore.saveCard(card);
      }
    },
    saveCardAndReview,
  };

  const reviewLogStore: ReviewLogStore = {
    // Atomic persistence is required for this production boundary. This
    // fallback is retained only to satisfy the shared adapter interface.
    saveReview: async () => {
      throw new Error("BM2 learning-evidence SRS persistence requires the atomic save boundary");
    },
    getReviewsByCard: async () => [],
    getReviewsByStudent: async () => [],
  };

  return { cardStore, reviewLogStore };
}

function createSrsSubmission(evidence: LearningEvidenceV1): PracticeSubmissionEnvelope {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new TypeError("Mastery Advantage SRS processing requires graded evidence");
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
        ...(gradedEvidence.score === undefined ? {} : { score: gradedEvidence.score }),
        ...(gradedEvidence.maxScore === undefined ? {} : { maxScore: gradedEvidence.maxScore }),
      },
    ],
  });
}

async function applyBm2SrsReview(
  ctx: MutationCtx,
  learnerId: Id<"profiles">,
  evidence: LearningEvidenceV1,
  options: { now: number; submissionId: string },
): Promise<void> {
  const masteryMapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0].masteryAdvantage;
  const { cardStore, reviewLogStore } = createSrsStores(ctx);
  const adapter = new SubmissionSrsAdapter({
    cardStore,
    reviewLogStore,
    resolver: {
      resolve: async (activityId) =>
        activityId === masteryMapping.activityId
          ? {
              variantKey: masteryMapping.variantKey,
              objectiveId: BM2_PILOT_NODE,
            }
          : null,
    },
    baselineResolver: {
      getBaseline: async () => null,
    },
    requireAtomicPersistence: true,
  });

  const result = await adapter.processSubmission({
    submission: createSrsSubmission(evidence),
    studentId: learnerId,
    activityId: masteryMapping.activityId,
    now: new Date(options.now).toISOString(),
    submissionId: options.submissionId,
  });
  if (!result.ok || result.skipped) {
    throw new Error("The BM2 learning-evidence SRS boundary rejected eligible evidence");
  }
}

async function processBm2Submission(
  ctx: MutationCtx,
  learnerId: Id<"profiles">,
  submissionId: Id<"activity_submissions">,
) {
  const sourceSubmission = await ctx.db.get("activity_submissions", submissionId);
  if (!sourceSubmission) {
    return { accepted: false as const, reason: "submission_not_found" as const };
  }
  const isGuidedSource =
    sourceSubmission.stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID &&
    sourceSubmission.submissionData.mode === "guided_practice";
  if (
    (isGuidedSource && !isBm2PilotSourcePublished()) ||
    (!isGuidedSource && !isBm2PilotPublished())
  ) {
    return { accepted: false as const, reason: "submission_not_found" as const };
  }
  const serverNow = Date.now();
  const handler = createBm2SubmissionLearningEvidenceHandler({
    evidenceStore: createEvidenceStore(ctx),
    receiptStore: createBm2ReceiptStore(ctx, serverNow),
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
        activityStableActivityId: activity.stableActivityId,
        stableActivityId: submission.stableActivityId,
        attemptOrdinal: submission.attemptOrdinal,
        masteryContractVersion: submission.masteryContractVersion,
        trustedTeacherExposure: submission.gradedBy !== undefined,
        submissionData: submission.submissionData,
        score: submission.score,
        maxScore: submission.maxScore,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      };
    },
    masteryBridge: ({ evidence, submissionId }) =>
      applyBm2SrsReview(ctx, learnerId, evidence, { now: serverNow, submissionId }),
  });

  return handler.process({ learnerId, submissionId: String(submissionId) });
}

/** Process a server-owned learner submission. */
export const submit = internalMutation({
  args: {
    learnerId: v.id("profiles"),
    submissionId: v.id("activity_submissions"),
  },
  returns: learningEvidenceResultValidator,
  handler: async (ctx, args) => processBm2Submission(ctx, args.learnerId, args.submissionId),
});

/** Record teacher-verified exposure for an actively enrolled learner. */
export const verifyTeacherExposure = internalMutation({
  args: {
    teacherId: v.id("profiles"),
    learnerId: v.id("profiles"),
    submissionId: v.id("activity_submissions"),
  },
  returns: learningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get("profiles", args.teacherId);
    const learner = await ctx.db.get("profiles", args.learnerId);
    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_student", (query) => query.eq("studentId", args.learnerId))
      .collect();
    const submission = await ctx.db.get("activity_submissions", args.submissionId);
    const activity = submission ? await ctx.db.get("activities", submission.activityId) : null;
    let enrollmentIsAuthorized = false;
    for (const enrollment of enrollments) {
      if (
        enrollment.status !== "active" ||
        !submission ||
        enrollment.enrolledAt > submission.submittedAt
      )
        continue;
      const cls = await ctx.db.get("classes", enrollment.classId);
      if (cls && !cls.archived && (teacher?.role === "admin" || cls.teacherId === teacher?._id)) {
        enrollmentIsAuthorized = true;
        break;
      }
    }
    const pilotLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (query) =>
        query.eq("slug", BM2_LEARNING_EVIDENCE_PILOT.mappings[0].source.lessonSlug),
      )
      .unique();
    let sourceAccessIsAuthorized = false;
    if (pilotLesson && submission && activity && learner) {
      const versions = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (query) => query.eq("lessonId", pilotLesson._id))
        .take(20);
      for (const version of versions) {
        if (version.status !== "published") continue;
        const phases = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version", (query) => query.eq("lessonVersionId", version._id))
          .take(20);
        for (const phase of phases) {
          const sections = await ctx.db
            .query("phase_sections")
            .withIndex("by_phase_version", (query) => query.eq("phaseVersionId", phase._id))
            .take(20);
          const hasSource = sections.some(
            (section) =>
              section.sectionType === "activity" &&
              (section.content.activityId === String(activity._id) ||
                section.content.activityId === activity.stableActivityId),
          );
          if (!hasSource) continue;
          const progress = await ctx.db
            .query("student_progress")
            .withIndex("by_user_and_phase", (query) =>
              query.eq("userId", learner._id).eq("phaseId", phase._id),
            )
            .unique();
          const assignedAt = progress?.startedAt ?? progress?.createdAt;
          if (assignedAt !== undefined && assignedAt <= submission.submittedAt) {
            sourceAccessIsAuthorized = true;
            break;
          }
        }
        if (sourceAccessIsAuthorized) break;
      }
    }
    if (
      !isBm2PilotSourcePublished() ||
      !teacher ||
      (teacher.role !== "teacher" && teacher.role !== "admin") ||
      !learner ||
      learner.role !== "student" ||
      teacher.organizationId !== learner.organizationId ||
      !enrollmentIsAuthorized ||
      !sourceAccessIsAuthorized ||
      submission?.userId !== learner._id ||
      activity?.stableActivityId !== BM2_LEARNING_EVIDENCE_PILOT.mappings[0].source.activityId ||
      submission.stableActivityId !== BM2_LEARNING_EVIDENCE_PILOT.mappings[0].source.activityId ||
      submission.submissionData.mode !== BM2_LEARNING_EVIDENCE_PILOT.mappings[0].source.mode
    ) {
      return { accepted: false as const, reason: "submission_not_found" as const };
    }
    if (submission.gradedBy !== undefined) {
      const receipt = await ctx.db
        .query("learning_evidence_receipts")
        .withIndex("by_student_and_submission_id", (query) =>
          query.eq("studentId", learner._id).eq("submissionId", submission._id),
        )
        .unique();
      if (!receipt || submission.gradedBy !== teacher._id) {
        return { accepted: false as const, reason: "submission_not_found" as const };
      }
      return processBm2Submission(ctx, learner._id, submission._id);
    }
    await ctx.db.patch("activity_submissions", submission._id, {
      gradedBy: teacher._id,
      gradedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return processBm2Submission(ctx, learner._id, submission._id);
  },
});
