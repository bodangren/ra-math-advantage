import { describe, expect, it, vi } from "vitest";

import type { LearningEvidenceV1 } from "@math-platform/practice-core";

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from "@/convex/learningEvidence";
import { gradeTopic15LeastPolynomialDegree } from "@/lib/practice/topic15-least-polynomial-degree";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "precalc-least-polynomial-degree-evidence-learner";
const SUBMITTED_AT = Date.parse("2026-08-30T10:00:00.000Z");
const SUBMITTED_AT_ISO = "2026-08-30T10:00:00.000Z";
const GUIDED_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID;
const WORKED_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID;

type Mode = "guided_practice" | "independent_practice";
type Answers = { readonly leastDegree: number };
type StoredPart = Record<string, unknown>;

const GUIDED_ANSWER: Answers = { leastDegree: 5 };
const INDEPENDENT_ANSWER: Answers = { leastDegree: 4 };
const WRONG_GUIDED_ANSWER: Answers = { leastDegree: 6 };

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: "learning-evidence.v1",
    nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
    activityId: WORKED_ID,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: "2026-08-30T09:00:00.000Z",
    idempotencyKey: "precalc-least-polynomial-degree-teacher-exposure",
  };
}

function storedParts(submission: PrecalculusActivitySubmission): StoredPart[] {
  return submission.submissionData.parts as StoredPart[];
}

function makeSubmission(
  mode: Mode = "guided_practice",
  options: {
    answers?: Answers;
    overrides?: Partial<PrecalculusActivitySubmission>;
    dataOverrides?: Record<string, unknown>;
  } = {},
): PrecalculusActivitySubmission {
  const seed = mode === "guided_practice" ? 1 : 2;
  const stableActivityId = mode === "guided_practice" ? GUIDED_ID : INDEPENDENT_ID;
  const answers =
    options.answers ?? (mode === "guided_practice" ? GUIDED_ANSWER : INDEPENDENT_ANSWER);
  const graded = gradeTopic15LeastPolynomialDegree(seed, answers);
  return {
    submissionId: `precalc-least-polynomial-degree-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-least-polynomial-degree-${mode}-activity-document`,
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
      submittedAt: SUBMITTED_AT_ISO,
      answers,
      parts: graded.parts,
      ...options.dataOverrides,
    },
    score: graded.score,
    maxScore: 1,
    gradedAt: SUBMITTED_AT,
    createIdempotencyKey: `precalc-least-polynomial-degree-${mode}-key`,
    feedback: `${graded.score}/${graded.maxScore} least-polynomial-degree response matched the server rubric.`,
    createdAt: SUBMITTED_AT,
    updatedAt: SUBMITTED_AT,
    ...options.overrides,
  } as PrecalculusActivitySubmission;
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

function createHarness(submission: PrecalculusActivitySubmission, withTeacherExposure = false) {
  const evidenceStore = new InMemoryEvidenceStore();
  if (withTeacherExposure)
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: makeTeacherExposure() });
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

async function expectEnabled(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(
    submission,
    true,
  );

  const expectedEvidence: LearningEvidenceV1 = {
    contractVersion: "learning-evidence.v1",
    nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
    activityId: submission.stableActivityId!,
    attemptOrdinal: submission.attemptOrdinal!,
    origin: "mastery_advantage",
    mode: submission.submissionData.mode as Mode,
    occurredAt: SUBMITTED_AT_ISO,
    gradedEvidence: {
      isCorrect: submission.score === submission.maxScore,
      score: submission.score!,
      maxScore: submission.maxScore!,
    },
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
  expect(evidenceStore.events).toHaveLength(2);
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
}

async function expectAwaitingExposure(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
    createHarness(submission);

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
  expect(masteryBridge).not.toHaveBeenCalled();
  expect(evidenceStore.events).toEqual([]);
  expect(receiptStore.receipts.size).toBe(0);
  expect(effectOrder).toEqual([]);
}

async function expectRejected(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
    createHarness(submission);

  await expect(
    handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
  ).resolves.toEqual({
    accepted: false,
    reason: "submission_not_found",
  });
  expect(masteryBridge).not.toHaveBeenCalled();
  expect(evidenceStore.events).toEqual([]);
  expect(receiptStore.receipts.size).toBe(0);
  expect(effectOrder).toEqual([]);
}

function withPart(
  changes: Record<string, unknown>,
  submission = makeSubmission(),
): PrecalculusActivitySubmission {
  const part = storedParts(submission)[0];
  return {
    ...submission,
    submissionData: {
      ...submission.submissionData,
      parts: [{ ...part, ...changes }],
    },
  } as PrecalculusActivitySubmission;
}

describe("Topic 1.5 least polynomial degree evidence mapping", () => {
  it("enables the Example 2 node exactly once without duplicate allow-list entries", () => {
    expect(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => (nodeId as string) === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
      ),
    ).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ["Guided correct", "guided_practice" as const, GUIDED_ANSWER],
    ["Guided wrong", "guided_practice" as const, WRONG_GUIDED_ANSWER],
    ["Independent correct", "independent_practice" as const, INDEPENDENT_ANSWER],
  ])(
    "maps a valid %s row to exact evidence after teacher exposure",
    async (_label, mode, answers) => {
      const submission = makeSubmission(mode, { answers });
      expect(submission.score).toBe(
        answers.leastDegree === (mode === "guided_practice" ? 5 : 4) ? 1 : 0,
      );
      expect(submission.maxScore).toBe(1);
      await expectEnabled(submission);
    },
  );

  it.each([
    ["Guided", "guided_practice" as const],
    ["Independent", "independent_practice" as const],
  ])("waits for exact teacher exposure for %s without effects", async (_label, mode) => {
    await expectAwaitingExposure(makeSubmission(mode));
  });

  it.each([
    [
      "cross-paired Guided identity and Independent envelope",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: INDEPENDENT_ID,
            mode: "independent_practice",
          },
        };
      },
    ],
    [
      "cross-paired Independent identity and Guided envelope",
      () => {
        const submission = makeSubmission("independent_practice");
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: GUIDED_ID,
            mode: "guided_practice",
          },
        };
      },
    ],
    [
      "Worked identity",
      () => {
        const submission = makeSubmission("guided_practice");
        return {
          ...submission,
          stableActivityId: WORKED_ID,
          submissionData: {
            ...submission.submissionData,
            activityId: WORKED_ID,
            mode: "worked_example",
          },
        };
      },
    ],
    [
      "unknown identity",
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
    [
      "foreign learner",
      () => makeSubmission("guided_practice", { overrides: { userId: "other-learner" } }),
    ],
  ] as const)("rejects %s with no effects", async (_label, makeRejectedSubmission) => {
    await expectRejected(makeRejectedSubmission());
  });

  it.each([
    [
      "wrong mastery contract",
      () =>
        makeSubmission("guided_practice", {
          overrides: { masteryContractVersion: "legacy.learning-evidence.v1" },
        }),
    ],
    [
      "non-record envelope",
      () =>
        ({ ...makeSubmission(), submissionData: null }) as unknown as PrecalculusActivitySubmission,
    ],
    [
      "missing envelope field",
      () => makeSubmission("guided_practice", { dataOverrides: { mode: undefined } }),
    ],
    [
      "extra envelope field",
      () => makeSubmission("guided_practice", { dataOverrides: { privateField: true } }),
    ],
    [
      "wrong envelope contract",
      () =>
        makeSubmission("guided_practice", { dataOverrides: { contractVersion: "practice.v0" } }),
    ],
    [
      "wrong envelope status",
      () => makeSubmission("guided_practice", { dataOverrides: { status: "submitted" } }),
    ],
    [
      "wrong envelope activity",
      () => makeSubmission("guided_practice", { dataOverrides: { activityId: INDEPENDENT_ID } }),
    ],
    [
      "wrong envelope mode",
      () => makeSubmission("guided_practice", { dataOverrides: { mode: "independent_practice" } }),
    ],
    [
      "missing row attempt",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: undefined } }),
    ],
    [
      "row attempt type",
      () =>
        makeSubmission("guided_practice", {
          overrides: { attemptOrdinal: "7" as unknown as number },
        }),
    ],
    [
      "row attempt zero",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: 0 } }),
    ],
    [
      "row attempt fractional",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: 1.5 } }),
    ],
    [
      "row attempt nonfinite",
      () => makeSubmission("guided_practice", { overrides: { attemptOrdinal: Number.NaN } }),
    ],
    [
      "row attempt unsafe integer",
      () =>
        makeSubmission("guided_practice", {
          overrides: { attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 },
        }),
    ],
    [
      "missing envelope attempt",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: undefined } }),
    ],
    [
      "envelope attempt type",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: "7" } }),
    ],
    [
      "envelope attempt zero",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: 0 } }),
    ],
    [
      "envelope attempt fractional",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: 1.5 } }),
    ],
    [
      "envelope attempt nonfinite",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: Number.NaN } }),
    ],
    [
      "envelope attempt unsafe integer",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { attemptNumber: Number.MAX_SAFE_INTEGER + 1 },
        }),
    ],
    [
      "envelope attempt mismatch",
      () => makeSubmission("guided_practice", { dataOverrides: { attemptNumber: 6 } }),
    ],
    [
      "row submitted time type",
      () =>
        makeSubmission("guided_practice", {
          overrides: { submittedAt: "123" as unknown as number },
        }),
    ],
    [
      "row submitted time nonfinite",
      () => makeSubmission("guided_practice", { overrides: { submittedAt: Number.NaN } }),
    ],
    [
      "row submitted time mismatch",
      () => makeSubmission("guided_practice", { overrides: { submittedAt: SUBMITTED_AT + 1_000 } }),
    ],
    [
      "envelope time type",
      () => makeSubmission("guided_practice", { dataOverrides: { submittedAt: 123 } }),
    ],
    [
      "envelope time invalid",
      () => makeSubmission("guided_practice", { dataOverrides: { submittedAt: "not-a-time" } }),
    ],
    [
      "envelope time mismatch",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { submittedAt: "2026-08-30T10:01:00.000Z" },
        }),
    ],
    [
      "envelope time noncanonical",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { submittedAt: "2026-08-30T10:00:00Z" },
        }),
    ],
    [
      "graded time type",
      () =>
        makeSubmission("guided_practice", { overrides: { gradedAt: "123" as unknown as number } }),
    ],
    [
      "graded time nonfinite",
      () => makeSubmission("guided_practice", { overrides: { gradedAt: Number.NaN } }),
    ],
    [
      "graded time mismatch",
      () => makeSubmission("guided_practice", { overrides: { gradedAt: SUBMITTED_AT + 1_000 } }),
    ],
    [
      "answers non-record",
      () => makeSubmission("guided_practice", { dataOverrides: { answers: null } }),
    ],
    [
      "answers missing key",
      () => makeSubmission("guided_practice", { dataOverrides: { answers: {} } }),
    ],
    [
      "answers extra key",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { answers: { leastDegree: 5, hidden: true } },
        }),
    ],
    [
      "answer non-number",
      () => makeSubmission("guided_practice", { dataOverrides: { answers: { leastDegree: "5" } } }),
    ],
    [
      "answer nonfinite",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { answers: { leastDegree: Number.NaN } },
        }),
    ],
    [
      "answer fractional",
      () => makeSubmission("guided_practice", { dataOverrides: { answers: { leastDegree: 5.5 } } }),
    ],
    [
      "answer unsafe integer",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: { answers: { leastDegree: Number.MAX_SAFE_INTEGER + 1 } },
        }),
    ],
    ["parts non-array", () => makeSubmission("guided_practice", { dataOverrides: { parts: {} } })],
    ["parts empty", () => makeSubmission("guided_practice", { dataOverrides: { parts: [] } })],
    [
      "parts extra item",
      () =>
        makeSubmission("guided_practice", {
          dataOverrides: {
            parts: [...storedParts(makeSubmission()), storedParts(makeSubmission())[0]],
          },
        }),
    ],
    [
      "part non-record",
      () => makeSubmission("guided_practice", { dataOverrides: { parts: [null] } }),
    ],
    ["part extra key", () => withPart({ hidden: true })],
    ["part wrong ID", () => withPart({ partId: "answer" })],
    ["part raw answer missing", () => withPart({ rawAnswer: undefined })],
    ["part raw answer wrong", () => withPart({ rawAnswer: 4 })],
    ["part raw answer non-number", () => withPart({ rawAnswer: "5" })],
    ["part correctness mismatch", () => withPart({ isCorrect: false })],
    ["part score mismatch", () => withPart({ score: 0 })],
    ["part max score mismatch", () => withPart({ maxScore: 2 })],
    [
      "row score missing",
      () => makeSubmission("guided_practice", { overrides: { score: undefined } }),
    ],
    [
      "row score type",
      () => makeSubmission("guided_practice", { overrides: { score: "1" as unknown as number } }),
    ],
    [
      "row score nonfinite",
      () => makeSubmission("guided_practice", { overrides: { score: Number.NaN } }),
    ],
    ["row score negative", () => makeSubmission("guided_practice", { overrides: { score: -1 } })],
    [
      "row score above maximum",
      () => makeSubmission("guided_practice", { overrides: { score: 2 } }),
    ],
    [
      "row score fractional",
      () => makeSubmission("guided_practice", { overrides: { score: 0.5 } }),
    ],
    ["row score mismatch", () => makeSubmission("guided_practice", { overrides: { score: 0 } })],
    [
      "row max score missing",
      () => makeSubmission("guided_practice", { overrides: { maxScore: undefined } }),
    ],
    [
      "row max score type",
      () =>
        makeSubmission("guided_practice", { overrides: { maxScore: "1" as unknown as number } }),
    ],
    [
      "row max score nonfinite",
      () => makeSubmission("guided_practice", { overrides: { maxScore: Number.NaN } }),
    ],
    ["row max score zero", () => makeSubmission("guided_practice", { overrides: { maxScore: 0 } })],
    [
      "row max score wrong value",
      () => makeSubmission("guided_practice", { overrides: { maxScore: 2 } }),
    ],
  ] as const)("rejects observable %s with no effects", async (_label, makeRejectedSubmission) => {
    await expectRejected(makeRejectedSubmission());
  });
});
