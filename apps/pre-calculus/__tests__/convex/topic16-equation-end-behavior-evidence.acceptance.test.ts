import { describe, expect, it } from "vitest";

import type { LearningEvidenceV1 } from "@math-platform/practice-core";

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from "@/convex/learningEvidence";
import {
  generateTopic16EquationEndBehaviorOutput,
  type Topic16EquationEndBehaviorAnswers,
  type Topic16EquationEndBehaviorPartId,
} from "@math-platform/math-content/knowledge-space";
import { gradeTopic16EquationEndBehavior } from "@/lib/practice/topic16-equation-end-behavior";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "precalc-topic16-evidence-learner";
const SUBMITTED_AT = Date.parse("2026-08-30T10:00:00.000Z");
const SUBMITTED_AT_ISO = "2026-08-30T10:00:00.000Z";
const GUIDED_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID =
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;

type Mode = "guided_practice" | "independent_practice";
type StoredPart = Record<string, unknown>;
type StoredRow = Record<string, unknown>;

const PART_IDS: readonly Topic16EquationEndBehaviorPartId[] = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
];

function sourceAnswers(seed: 1 | 2): Topic16EquationEndBehaviorAnswers {
  return {
    ...generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer,
  } as Topic16EquationEndBehaviorAnswers;
}

function oppositeAnswer(value: unknown): "up" | "down" {
  return value === "up" ? "down" : "up";
}

function makeSubmission(
  mode: Mode = "guided_practice",
  options: {
    answers?: Topic16EquationEndBehaviorAnswers;
    overrides?: Partial<PrecalculusActivitySubmission>;
    dataOverrides?: Record<string, unknown>;
  } = {},
): PrecalculusActivitySubmission {
  const seed = mode === "guided_practice" ? 1 : 2;
  const stableActivityId = mode === "guided_practice" ? GUIDED_ID : INDEPENDENT_ID;
  const answers = options.answers ?? sourceAnswers(seed);
  const graded = gradeTopic16EquationEndBehavior(seed, answers);
  return {
    submissionId: `precalc-topic16-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-topic16-${mode}-physical-activity`,
    stableActivityId,
    masteryContractVersion: "learning-evidence.v1",
    attemptOrdinal: 7,
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
    maxScore: 12,
    feedback: `${graded.score}/12 polynomial equation end-behavior responses matched the server rubric.`,
    gradedAt: SUBMITTED_AT,
    submittedAt: SUBMITTED_AT,
    ...options.overrides,
  };
}

function withData(
  submission: PrecalculusActivitySubmission,
  mutate: (data: Record<string, unknown>) => void,
): PrecalculusActivitySubmission {
  const data = { ...submission.submissionData };
  mutate(data);
  return { ...submission, submissionData: data };
}

function withRow(
  submission: PrecalculusActivitySubmission,
  mutate: (row: StoredRow) => void,
): PrecalculusActivitySubmission {
  const row = { ...submission } as StoredRow;
  mutate(row);
  return row as unknown as PrecalculusActivitySubmission;
}

function withPart(
  submission: PrecalculusActivitySubmission,
  mutate: (part: StoredPart) => void,
): PrecalculusActivitySubmission {
  return withData(submission, (data) => {
    const parts = [...(data.parts as StoredPart[])];
    const part = { ...parts[0]! };
    mutate(part);
    parts[0] = part;
    data.parts = parts;
  });
}

class InMemoryEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];
  readonly idempotencyLookups: Array<{ learnerId: string; idempotencyKey: string }> = [];
  readonly nodeLookups: Array<{ learnerId: string; nodeId: string }> = [];

  async findByIdempotencyKey(learnerId: string, idempotencyKey: string) {
    this.idempotencyLookups.push({ learnerId, idempotencyKey });
    return (
      this.events.find(
        (entry) =>
          entry.learnerId === learnerId && entry.evidence.idempotencyKey === idempotencyKey,
      )?.evidence ?? null
    );
  }

  async listByLearnerAndNode(learnerId: string, nodeId: string) {
    this.nodeLookups.push({ learnerId, nodeId });
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1) {
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

function createHarness(submission: PrecalculusActivitySubmission) {
  const evidenceStore = new InMemoryEvidenceStore();
  const receiptStore = new InMemoryReceiptStore();
  const masteryEffects: PrecalculusSubmissionEffect[] = [];
  const submissionLookups: string[] = [];
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission: async (submissionId) => {
      submissionLookups.push(submissionId);
      return submissionId === submission.submissionId ? submission : null;
    },
    masteryBridge: async (effect) => {
      masteryEffects.push(effect);
    },
    receiptStore,
  });
  return { evidenceStore, handler, masteryEffects, receiptStore, submissionLookups };
}

function expectNoEffects(
  harness: ReturnType<typeof createHarness>,
  submission: PrecalculusActivitySubmission,
) {
  expect(harness.masteryEffects).toEqual([]);
  expect(harness.evidenceStore.events).toEqual([]);
  expect(harness.receiptStore.receipts.size).toBe(0);
  expect(harness.submissionLookups).toEqual([submission.submissionId]);
}

async function expectRejected(
  submission: PrecalculusActivitySubmission,
  learnerId: string = LEARNER_ID,
) {
  const harness = createHarness(submission);
  await expect(
    harness.handler.process({ learnerId, submissionId: submission.submissionId }),
  ).resolves.toEqual({ accepted: false, reason: "submission_not_found" });
  expectNoEffects(harness, submission);
}

describe("Topic 1.6 equation end-behavior evidence mapping", () => {
  it("keeps the exact Topic 1.6 node inside the evidence pilot allow-list", () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    );
  });

  it.each([
    ["Guided correct", "guided_practice" as const, sourceAnswers(1), 12],
    [
      "Guided one-answer-wrong",
      "guided_practice" as const,
      (() => {
        const answers = sourceAnswers(1);
        answers.a_leftEnd = oppositeAnswer(answers.a_leftEnd);
        return answers;
      })(),
      11,
    ],
    ["Independent correct", "independent_practice" as const, sourceAnswers(2), 12],
  ])(
    "recognizes %s but returns the teacher-exposure decision with no effects",
    async (_label, mode, answers, expectedScore) => {
      const submission = makeSubmission(mode, { answers });
      expect(submission.score).toBe(expectedScore);
      expect(submission.maxScore).toBe(12);
      const harness = createHarness(submission);

      await expect(
        harness.handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }),
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
      expectNoEffects(harness, submission);
    },
  );

  it.each([
    ["foreign learner", makeSubmission(), LEARNER_ID + "-other"],
    [
      "blank physical activity ID",
      withRow(makeSubmission(), (row) => {
        row.activityId = "   ";
      }),
    ],
    [
      "missing physical activity ID",
      withRow(makeSubmission(), (row) => {
        delete row.activityId;
      }),
    ],
    [
      "wrong stable activity ID",
      withRow(makeSubmission(), (row) => {
        row.stableActivityId = INDEPENDENT_ID;
      }),
    ],
    [
      "wrong envelope activity ID",
      withData(makeSubmission(), (data) => {
        data.activityId = INDEPENDENT_ID;
      }),
    ],
    [
      "wrong mode",
      withData(makeSubmission(), (data) => {
        data.mode = "independent_practice";
      }),
    ],
    [
      "missing mastery contract",
      withRow(makeSubmission(), (row) => {
        delete row.masteryContractVersion;
      }),
    ],
    [
      "wrong mastery contract",
      withRow(makeSubmission(), (row) => {
        row.masteryContractVersion = "wrong";
      }),
    ],
    [
      "extra envelope field",
      withData(makeSubmission(), (data) => {
        data.extra = true;
      }),
    ],
    [
      "missing envelope field",
      withData(makeSubmission(), (data) => {
        delete data.status;
      }),
    ],
    [
      "wrong envelope contract",
      withData(makeSubmission(), (data) => {
        data.contractVersion = "practice.v0";
      }),
    ],
    [
      "wrong envelope status",
      withData(makeSubmission(), (data) => {
        data.status = "submitted";
      }),
    ],
    [
      "row attempt ordinal missing",
      withRow(makeSubmission(), (row) => {
        delete row.attemptOrdinal;
      }),
    ],
    [
      "row attempt ordinal zero",
      withRow(makeSubmission(), (row) => {
        row.attemptOrdinal = 0;
      }),
    ],
    [
      "row attempt ordinal fractional",
      withRow(makeSubmission(), (row) => {
        row.attemptOrdinal = 1.5;
      }),
    ],
    [
      "row attempt ordinal unsafe",
      withRow(makeSubmission(), (row) => {
        row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1;
      }),
    ],
    [
      "envelope attempt number missing",
      withData(makeSubmission(), (data) => {
        delete data.attemptNumber;
      }),
    ],
    [
      "envelope attempt number wrong type",
      withData(makeSubmission(), (data) => {
        data.attemptNumber = "7";
      }),
    ],
    [
      "envelope attempt number mismatch",
      withData(makeSubmission(), (data) => {
        data.attemptNumber = 8;
      }),
    ],
    [
      "row submitted time wrong type",
      withRow(makeSubmission(), (row) => {
        row.submittedAt = "10";
      }),
    ],
    [
      "row submitted time nonfinite",
      withRow(makeSubmission(), (row) => {
        row.submittedAt = Number.NaN;
      }),
    ],
    [
      "row submitted time mismatch",
      withRow(makeSubmission(), (row) => {
        row.submittedAt = SUBMITTED_AT + 1000;
      }),
    ],
    [
      "envelope submitted time noncanonical",
      withData(makeSubmission(), (data) => {
        data.submittedAt = "2026-08-30T10:00:00Z";
      }),
    ],
    [
      "envelope submitted time mismatch",
      withData(makeSubmission(), (data) => {
        data.submittedAt = "2026-08-30T10:00:01.000Z";
      }),
    ],
    [
      "graded time wrong type",
      withRow(makeSubmission(), (row) => {
        row.gradedAt = "10";
      }),
    ],
    [
      "graded time nonfinite",
      withRow(makeSubmission(), (row) => {
        row.gradedAt = Number.NaN;
      }),
    ],
    [
      "graded time mismatch",
      withRow(makeSubmission(), (row) => {
        row.gradedAt = SUBMITTED_AT + 1000;
      }),
    ],
    [
      "row score missing",
      withRow(makeSubmission(), (row) => {
        delete row.score;
      }),
    ],
    [
      "row score nonfinite",
      withRow(makeSubmission(), (row) => {
        row.score = Number.NaN;
      }),
    ],
    [
      "row score mismatch",
      withRow(makeSubmission(), (row) => {
        row.score = 0;
      }),
    ],
    [
      "row max score missing",
      withRow(makeSubmission(), (row) => {
        delete row.maxScore;
      }),
    ],
    [
      "row max score mismatch",
      withRow(makeSubmission(), (row) => {
        row.maxScore = 11;
      }),
    ],
    [
      "feedback missing",
      withRow(makeSubmission(), (row) => {
        delete row.feedback;
      }),
    ],
    [
      "feedback wrong",
      withRow(makeSubmission(), (row) => {
        row.feedback = "wrong";
      }),
    ],
    [
      "answers non-record",
      withData(makeSubmission(), (data) => {
        data.answers = null;
      }),
    ],
    [
      "answer key missing",
      withData(makeSubmission(), (data) => {
        const answers = { ...(data.answers as Record<string, unknown>) };
        delete answers.a_leftEnd;
        data.answers = answers;
      }),
    ],
    [
      "answer value noncanonical",
      withData(makeSubmission(), (data) => {
        data.answers = { ...(data.answers as Record<string, unknown>), a_leftEnd: "UP" };
      }),
    ],
    [
      "wrong answer",
      (() => {
        const answers = sourceAnswers(1);
        answers.a_leftEnd = oppositeAnswer(answers.a_leftEnd);
        return withData(makeSubmission(), (data) => {
          data.answers = answers;
        });
      })(),
    ],
    [
      "parts missing",
      withData(makeSubmission(), (data) => {
        delete data.parts;
      }),
    ],
    [
      "parts reordered",
      withData(makeSubmission(), (data) => {
        const parts = data.parts as StoredPart[];
        data.parts = [parts[1], parts[0], ...parts.slice(2)];
      }),
    ],
    [
      "part wrong ID",
      withPart(makeSubmission(), (part) => {
        part.partId = "wrong";
      }),
    ],
    [
      "part extra field",
      withPart(makeSubmission(), (part) => {
        part.extra = true;
      }),
    ],
    [
      "part raw mismatch",
      withPart(makeSubmission(), (part) => {
        part.rawAnswer = part.rawAnswer === "up" ? "down" : "up";
      }),
    ],
    [
      "part correctness mismatch",
      withPart(makeSubmission(), (part) => {
        part.isCorrect = !part.isCorrect;
      }),
    ],
    [
      "part score mismatch",
      withPart(makeSubmission(), (part) => {
        part.score = 0;
      }),
    ],
    [
      "part max score mismatch",
      withPart(makeSubmission(), (part) => {
        part.maxScore = 2;
      }),
    ],
    [
      "Guided/Independent seed cross-pair",
      withData(makeSubmission(), (data) => {
        const answers = sourceAnswers(2);
        data.activityId = GUIDED_ID;
        data.mode = "guided_practice";
        data.answers = answers;
        data.parts = gradeTopic16EquationEndBehavior(2, answers).parts;
      }),
    ],
  ] as const)("rejects %s with no effects", async (_label, submission, learnerId = LEARNER_ID) => {
    await expectRejected(submission, learnerId);
  });

  it("preserves the canonical 12-part order used by the stored rows", () => {
    expect(PART_IDS).toEqual([
      "a_leftEnd",
      "a_rightEnd",
      "b_leftEnd",
      "b_rightEnd",
      "c_leftEnd",
      "c_rightEnd",
      "d_leftEnd",
      "d_rightEnd",
      "e_leftEnd",
      "e_rightEnd",
      "f_leftEnd",
      "f_rightEnd",
    ]);
  });
});
