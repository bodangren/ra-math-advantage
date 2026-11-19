import { describe, expect, it, vi } from "vitest";

import type { LearningEvidenceV1 } from "@math-platform/practice-core";
import { generateTopic14PolynomialExtremaFromGraphOutput } from "@math-platform/math-content/knowledge-space";

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from "@/convex/learningEvidence";
import { gradeTopic14PolynomialExtremaFromGraph } from "@/lib/practice/topic14-polynomial-extrema-from-graph";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "precalc-extrema-evidence-learner";
const SUBMITTED_AT = Date.parse("2026-08-19T10:00:00.000Z");
const PART_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;
type ExtremaPartId = (typeof PART_IDS)[number];
type ExtremaAnswers = Record<ExtremaPartId, string>;

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: "learning-evidence.v1",
    nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: "2026-08-19T09:00:00.000Z",
    idempotencyKey: "precalc-extrema-teacher-exposure",
  };
}

function makeAnswers(seed: number, overrides: Partial<ExtremaAnswers> = {}): ExtremaAnswers {
  const expected = generateTopic14PolynomialExtremaFromGraphOutput(seed).expectedAnswer as Record<
    ExtremaPartId,
    number
  >;
  return {
    relative_minimum_x: String(expected.relative_minimum_x),
    relative_maximum_x: String(expected.relative_maximum_x),
    absolute_minimum_x: String(expected.absolute_minimum_x),
    ...overrides,
  };
}

function makeExtremaSubmission(
  mode: "guided_practice" | "independent_practice" = "guided_practice",
  options: {
    answers?: Partial<ExtremaAnswers>;
    overrides?: Partial<PrecalculusActivitySubmission>;
  } = {},
): PrecalculusActivitySubmission {
  const seed = mode === "guided_practice" ? 1 : 2;
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID;
  const answers = makeAnswers(seed, options.answers);
  const graded = gradeTopic14PolynomialExtremaFromGraph(seed, answers);
  return {
    submissionId: `precalc-extrema-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-extrema-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: "learning-evidence.v1",
    attemptOrdinal: 7,
    submittedAt: SUBMITTED_AT,
    submissionData: {
      contractVersion: "practice.v1",
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: "graded",
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers,
      parts: graded.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
      })),
    },
    score: graded.score,
    maxScore: 3,
    gradedAt: SUBMITTED_AT,
    ...options.overrides,
  };
}

class InMemoryEvidenceStore implements PrecalculusLearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(learnerId: string, idempotencyKey: string) {
    return (
      this.events.find(
        (entry) =>
          entry.learnerId === learnerId && entry.evidence.idempotencyKey === idempotencyKey,
      )?.evidence ?? null
    );
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    _options: PrecalculusLearningEvidenceHistoryOptions,
  ) {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1, _submissionId?: string) {
    this.events.push({ learnerId, evidence });
  }
}

class InMemoryReceiptStore implements PrecalculusSubmissionReceiptStore {
  readonly receipts = new Map<string, PrecalculusSubmissionReceipt>();

  async findBySubmissionId(learnerId: string, submissionId: string) {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(learnerId: string, submissionId: string, receipt: PrecalculusSubmissionReceipt) {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
  }
}

function createHarness(submission: PrecalculusActivitySubmission, withTeacherExposure = true) {
  const evidenceStore = new InMemoryEvidenceStore();
  if (withTeacherExposure)
    evidenceStore.events.push({
      learnerId: LEARNER_ID,
      evidence: makeTeacherExposure(),
    });
  const receiptStore = new InMemoryReceiptStore();
  const effectOrder: string[] = [];
  const masteryBridge = vi.fn(async (_effect: PrecalculusSubmissionEffect) => {
    effectOrder.push("mastery");
  });
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission: async (submissionId) =>
      submissionId === submission.submissionId ? submission : null,
    masteryBridge,
    receiptStore: {
      findBySubmissionId: receiptStore.findBySubmissionId.bind(receiptStore),
      append: async (learnerId, submissionId, receipt) => {
        await receiptStore.append(learnerId, submissionId, receipt);
        effectOrder.push("receipt");
      },
    },
  });
  const originalAppend = evidenceStore.append.bind(evidenceStore);
  evidenceStore.append = async (learnerId, evidence, submissionId) => {
    await originalAppend(learnerId, evidence, submissionId);
    effectOrder.push("evidence");
  };
  return { effectOrder, evidenceStore, handler, masteryBridge, receiptStore };
}

describe("Topic 1.4 polynomial extrema evidence mapping", () => {
  it("enables the exact extrema node once without duplicate allow-list entries", () => {
    expect(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      ),
    ).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ["Guided", "guided_practice" as const],
    ["Independent", "independent_practice" as const],
  ])("maps trusted %s extrema evidence and replays from its receipt", async (_label, mode) => {
    const submission = makeExtremaSubmission(mode);
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createHarness(submission);
    const expectedEvidence = {
      contractVersion: "learning-evidence.v1",
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: "mastery_advantage",
      occurredAt: "2026-08-19T10:00:00.000Z",
      gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    };

    await expect(
      handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
    ).resolves.toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: "new",
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: true,
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
      evidence: expectedEvidence,
    });
    expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(["mastery", "evidence", "receipt"]);

    await expect(
      handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
    ).resolves.toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: "replay",
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: true,
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(["mastery", "evidence", "receipt"]);
  });

  it("preserves a trusted partial Guided result and false correctness", async () => {
    const submission = makeExtremaSubmission("guided_practice", {
      answers: { relative_maximum_x: "0" },
    });
    const { evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);

    await expect(
      handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
    ).resolves.toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: { eligible: true, reason: "eligible", masteryBearing: true },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events[1]?.evidence).toEqual(
      expect.objectContaining({
        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        gradedEvidence: { isCorrect: false, score: 2, maxScore: 3 },
      }),
    );
    expect(receiptStore.receipts.size).toBe(1);
  });

  it("waits for exact extrema teacher exposure without effects", async () => {
    const submission = makeExtremaSubmission("guided_practice");
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(
      submission,
      false,
    );

    await expect(
      handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
    ).resolves.toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        idempotency: "new",
        exposureState: "awaiting_teacher_exposure",
        eligible: false,
        reason: "awaiting_teacher_exposure",
        masteryBearing: false,
      },
    });
    expect(evidenceStore.events).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it.each([
    [
      "cross-paired Guided stable and Independent envelope identity",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
            mode: "independent_practice",
          },
        };
      },
    ],
    [
      "cross-paired Independent stable and Guided envelope identity",
      () => {
        const submission = makeExtremaSubmission("independent_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
            mode: "guided_practice",
          },
        };
      },
    ],
    [
      "Guided identity with Independent mode",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, mode: "independent_practice" },
        };
      },
    ],
    [
      "Independent identity with Guided mode",
      () => {
        const submission = makeExtremaSubmission("independent_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, mode: "guided_practice" },
        };
      },
    ],
    [
      "Worked identity",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
            mode: "worked_example",
          },
        };
      },
    ],
  ] as const)("rejects %s without effects", async (_label, makeRejectedSubmission) => {
    const submission = makeRejectedSubmission();
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createHarness(submission);

    await expect(
      handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
    ).resolves.toEqual({
      accepted: false,
      reason: "submission_not_found",
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it.each([
    [
      "foreign learner",
      () => makeExtremaSubmission("guided_practice", { overrides: { userId: "other-learner" } }),
    ],
    [
      "wrong mastery contract",
      () =>
        makeExtremaSubmission("guided_practice", {
          overrides: { masteryContractVersion: "legacy.learning-evidence.v1" },
        }),
    ],
    [
      "zero stored attempt ordinal",
      () => makeExtremaSubmission("guided_practice", { overrides: { attemptOrdinal: 0 } }),
    ],
    [
      "fractional stored attempt ordinal",
      () => makeExtremaSubmission("guided_practice", { overrides: { attemptOrdinal: 1.5 } }),
    ],
    [
      "missing envelope attempt number",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: undefined },
        };
      },
    ],
    [
      "zero envelope attempt number",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 0 },
        };
      },
    ],
    [
      "fractional envelope attempt number",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 1.5 },
        };
      },
    ],
    [
      "mismatched envelope attempt number",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 6 },
        };
      },
    ],
    [
      "invalid envelope submittedAt",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: "not-a-time" },
        };
      },
    ],
    [
      "mismatched envelope submittedAt",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: "2026-08-19T10:01:00.000Z" },
        };
      },
    ],
    [
      "invalid stored submittedAt",
      () => makeExtremaSubmission("guided_practice", { overrides: { submittedAt: Number.NaN } }),
    ],
    [
      "invalid stored gradedAt",
      () => makeExtremaSubmission("guided_practice", { overrides: { gradedAt: Number.NaN } }),
    ],
    [
      "gradedAt differs from submittedAt",
      () =>
        makeExtremaSubmission("guided_practice", {
          overrides: { gradedAt: SUBMITTED_AT + 60_000 },
        }),
    ],
    [
      "ungraded status",
      () => {
        const submission = makeExtremaSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, status: "submitted" },
        };
      },
    ],
    [
      "negative score",
      () => makeExtremaSubmission("guided_practice", { overrides: { score: -1 } }),
    ],
    [
      "fractional score",
      () => makeExtremaSubmission("guided_practice", { overrides: { score: 1.5 } }),
    ],
    [
      "above-maximum score",
      () => makeExtremaSubmission("guided_practice", { overrides: { score: 4 } }),
    ],
    [
      "zero maxScore",
      () => makeExtremaSubmission("guided_practice", { overrides: { maxScore: 0 } }),
    ],
    [
      "positive wrong maxScore",
      () => makeExtremaSubmission("guided_practice", { overrides: { maxScore: 2 } }),
    ],
    [
      "fractional maxScore",
      () => makeExtremaSubmission("guided_practice", { overrides: { maxScore: 1.5 } }),
    ],
  ] as const)(
    "rejects Topic 1.4 summary mismatch: %s without effects",
    async (_label, makeRejectedSubmission) => {
      const submission = makeRejectedSubmission();
      const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
        createHarness(submission);

      await expect(
        handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
      ).resolves.toEqual({
        accepted: false,
        reason: "submission_not_found",
      });
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(evidenceStore.events).toEqual([
        { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
      ]);
      expect(receiptStore.receipts.size).toBe(0);
      expect(effectOrder).toEqual([]);
    },
  );
});
