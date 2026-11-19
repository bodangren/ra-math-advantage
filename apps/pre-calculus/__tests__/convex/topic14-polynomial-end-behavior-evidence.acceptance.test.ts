import { describe, expect, it, vi } from "vitest";

import type { LearningEvidenceV1 } from "@math-platform/practice-core";
import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from "@/convex/learningEvidence";
import { gradeTopic14PolynomialEndBehavior } from "@/lib/practice/topic14-polynomial-end-behavior";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "precalc-polynomial-end-behavior-evidence-learner";
const SUBMITTED_AT = Date.parse("2026-08-30T10:00:00.000Z");
const PART_IDS = ["leftEnd", "rightEnd"] as const;
type EndPartId = (typeof PART_IDS)[number];
type EndAnswers = Record<EndPartId, string>;

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: "learning-evidence.v1",
    nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: "2026-08-30T09:00:00.000Z",
    idempotencyKey: "precalc-polynomial-end-behavior-teacher-exposure",
  };
}

function makeAnswers(seed: number, overrides: Partial<EndAnswers> = {}): EndAnswers {
  const expected = generateTopic14PolynomialEndBehaviorOutput(seed).expectedAnswer as EndAnswers;
  return {
    leftEnd: expected.leftEnd,
    rightEnd: expected.rightEnd,
    ...overrides,
  };
}

function makeSubmission(
  mode: "guided_practice" | "independent_practice" = "guided_practice",
  options: {
    answers?: Partial<EndAnswers>;
    overrides?: Partial<PrecalculusActivitySubmission>;
  } = {},
): PrecalculusActivitySubmission {
  const seed = mode === "guided_practice" ? 1 : 2;
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
  const answers = makeAnswers(seed, options.answers);
  const graded = gradeTopic14PolynomialEndBehavior(seed, answers);
  return {
    submissionId: `precalc-polynomial-end-behavior-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-polynomial-end-behavior-${mode}-activity-document`,
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
      submittedAt: "2026-08-30T10:00:00.000Z",
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
    maxScore: 2,
    gradedAt: SUBMITTED_AT,
    ...{
      createIdempotencyKey: `precalc-polynomial-end-behavior-${mode}-key`,
      feedback: `${graded.score}/2 polynomial end-behavior responses matched the server rubric.`,
      createdAt: SUBMITTED_AT,
      updatedAt: SUBMITTED_AT,
    },
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

async function expectRejectedSubmission(submission: PrecalculusActivitySubmission): Promise<void> {
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
}

describe("Topic 1.4 polynomial end behavior evidence mapping", () => {
  it("enables the exact node once without duplicate allow-list entries", () => {
    expect(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
      ),
    ).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ["Guided", "guided_practice" as const],
    ["Independent", "independent_practice" as const],
  ])("maps trusted %s evidence with the exact stored score and mode", async (_label, mode) => {
    const submission = makeSubmission(mode);
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createHarness(submission);
    const expectedEvidence = {
      contractVersion: "learning-evidence.v1",
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: "mastery_advantage",
      occurredAt: "2026-08-30T10:00:00.000Z",
      gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
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
    expect(submission.attemptOrdinal).toBe(7);
    expect(submission.submittedAt).toBe(SUBMITTED_AT);
    expect(submission.gradedAt).toBe(SUBMITTED_AT);

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

  it.each([
    ["partial Guided", makeAnswers(1, { leftEnd: "wrong-answer" }), 1],
    ["zero Guided", { leftEnd: "wrong-answer", rightEnd: "also-wrong" }, 0],
  ] as const)(
    "preserves trusted %s score and false correctness",
    async (_label, answers, score) => {
      const submission = makeSubmission("guided_practice", { answers });
      const { evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);
      const graded = gradeTopic14PolynomialEndBehavior(1, makeAnswers(1, answers));

      await expect(
        handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
      ).resolves.toMatchObject({
        persisted: true,
        masteryApplied: true,
        decision: { eligible: true, reason: "eligible", masteryBearing: true },
      });
      expect(graded.score).toBe(score);
      expect(masteryBridge).toHaveBeenCalledOnce();
      expect(evidenceStore.events[1]?.evidence).toEqual(
        expect.objectContaining({
          nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
          activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          gradedEvidence: { isCorrect: false, score, maxScore: 2 },
        }),
      );
      expect(receiptStore.receipts.size).toBe(1);
    },
  );

  it("waits for exact teacher exposure without effects", async () => {
    const submission = makeSubmission("guided_practice");
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
      "cross-paired Guided stable ID with Independent envelope activity and mode",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
            mode: "independent_practice",
          },
        };
      },
    ],
    [
      "cross-paired Independent stable ID with Guided envelope activity and mode",
      () => {
        const submission = makeSubmission("independent_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
            mode: "guided_practice",
          },
        };
      },
    ],
    [
      "Guided stable and activity with Independent mode",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, mode: "independent_practice" },
        };
      },
    ],
    [
      "Independent stable and activity with Guided mode",
      () => {
        const submission = makeSubmission("independent_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, mode: "guided_practice" },
        };
      },
    ],
    [
      "exact Worked stable ID, activity, and mode",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
            mode: "worked_example",
          },
        };
      },
    ],
    [
      "unknown stable and envelope activity identity",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          stableActivityId: "math.precalc.skill.test-only.unknown.guided_practice",
          submissionData: {
            ...submission.submissionData,
            activityId: "math.precalc.skill.test-only.unknown.guided_practice",
          },
        };
      },
    ],
  ] as const)(
    "rejects identity or mode mismatch: %s without effects",
    async (_label, makeRejectedSubmission) => {
      await expectRejectedSubmission(makeRejectedSubmission());
    },
  );

  it.each([
    [
      "foreign learner",
      () => makeSubmission("guided_practice", { overrides: { userId: "other-learner" } }),
    ],
    [
      "wrong mastery contract",
      () =>
        makeSubmission("guided_practice", {
          overrides: { masteryContractVersion: "legacy.learning-evidence.v1" },
        }),
    ],
    [
      "missing stored attempt ordinal",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: undefined } }),
    ],
    [
      "non-number stored attempt ordinal",
      () =>
        makeSubmission("guided_practice", {
          overrides: { attemptOrdinal: "7" as unknown as number },
        }),
    ],
    [
      "zero stored attempt ordinal",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: 0 } }),
    ],
    [
      "fractional stored attempt ordinal",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: 1.5 } }),
    ],
    [
      "non-finite stored attempt ordinal",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: Number.NaN } }),
    ],
    [
      "missing envelope attempt number",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: undefined },
        };
      },
    ],
    [
      "non-number envelope attempt number",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: "7" },
        };
      },
    ],
    [
      "zero envelope attempt number",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 0 },
        };
      },
    ],
    [
      "fractional envelope attempt number",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 1.5 },
        };
      },
    ],
    [
      "mismatched envelope attempt number",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 6 },
        };
      },
    ],
    [
      "non-string envelope submittedAt",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: 123 },
        };
      },
    ],
    [
      "invalid envelope submittedAt",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: "not-a-time" },
        };
      },
    ],
    [
      "mismatched envelope submittedAt",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: "2026-08-30T10:01:00.000Z" },
        };
      },
    ],
    [
      "missing stored submittedAt",
      () => makeSubmission("guided_practice", { overrides: { submittedAt: undefined } }),
    ],
    [
      "non-number stored submittedAt",
      () =>
        makeSubmission("guided_practice", {
          overrides: { submittedAt: "123" as unknown as number },
        }),
    ],
    [
      "non-finite stored submittedAt",
      () => makeSubmission("guided_practice", { overrides: { submittedAt: Number.NaN } }),
    ],
    [
      "missing stored gradedAt",
      () => makeSubmission("guided_practice", { overrides: { gradedAt: undefined } }),
    ],
    [
      "non-number stored gradedAt",
      () =>
        makeSubmission("guided_practice", { overrides: { gradedAt: "123" as unknown as number } }),
    ],
    [
      "non-finite stored gradedAt",
      () => makeSubmission("guided_practice", { overrides: { gradedAt: Number.NaN } }),
    ],
    [
      "mismatched stored gradedAt",
      () => makeSubmission("guided_practice", { overrides: { gradedAt: SUBMITTED_AT + 60_000 } }),
    ],
    [
      "non-record submissionData",
      () =>
        ({
          ...makeSubmission("guided_practice"),
          submissionData: null,
        }) as unknown as PrecalculusActivitySubmission,
    ],
    [
      "non-array submission parts",
      () => {
        const submission = makeSubmission("guided_practice");
        return { ...submission, submissionData: { ...submission.submissionData, parts: {} } };
      },
    ],
    [
      "wrong contract",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, contractVersion: "wrong" },
        };
      },
    ],
    [
      "ungraded status",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: { ...submission.submissionData, status: "submitted" },
        };
      },
    ],
    ["missing score", () => makeSubmission("guided_practice", { overrides: { score: undefined } })],
    [
      "non-number score",
      () => makeSubmission("guided_practice", { overrides: { score: "2" as unknown as number } }),
    ],
    [
      "non-finite score",
      () => makeSubmission("guided_practice", { overrides: { score: Number.NaN } }),
    ],
    ["negative score", () => makeSubmission("guided_practice", { overrides: { score: -1 } })],
    ["fractional score", () => makeSubmission("guided_practice", { overrides: { score: 1.5 } })],
    ["above-maximum score", () => makeSubmission("guided_practice", { overrides: { score: 3 } })],
    [
      "missing maxScore",
      () => makeSubmission("guided_practice", { overrides: { maxScore: undefined } }),
    ],
    [
      "non-number maxScore",
      () =>
        makeSubmission("guided_practice", { overrides: { maxScore: "2" as unknown as number } }),
    ],
    [
      "non-finite maxScore",
      () => makeSubmission("guided_practice", { overrides: { maxScore: Number.NaN } }),
    ],
    ["zero maxScore", () => makeSubmission("guided_practice", { overrides: { maxScore: 0 } })],
    ["negative maxScore", () => makeSubmission("guided_practice", { overrides: { maxScore: -1 } })],
    [
      "fractional maxScore",
      () => makeSubmission("guided_practice", { overrides: { maxScore: 1.5 } }),
    ],
    [
      "positive wrong maxScore",
      () => makeSubmission("guided_practice", { overrides: { maxScore: 1 } }),
    ],
  ] as const)(
    "rejects stored summary mismatch: %s without effects",
    async (_label, makeRejectedSubmission) => {
      await expectRejectedSubmission(makeRejectedSubmission());
    },
  );
});
