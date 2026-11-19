import { describe, expect, it, vi } from "vitest";

import type { LearningEvidenceV1 } from "@math-platform/practice-core";

import {
  createBm2SubmissionLearningEvidenceHandler,
  type Bm2ActivitySubmission,
  type Bm2LearningEvidenceStore,
  type Bm2SubmissionReceipt,
  type Bm2SubmissionReceiptStore,
} from "../../convex/learningEvidence";

const LEARNER_ID = "student-bm2-convex-pilot";
const PILOT_NODE_ID = "math.bm2.skill.1.1.apply-accounting-equation";
const PILOT_ACTIVITY_ID = "accounting-equation";
const FROZEN_SOURCE_ACTIVITY_ID = "d6b57545-65f6-4c39-80d5-000100001002";
const SERVER_SUBMISSION_ID = "server-owned-bm2-submission";

class InMemoryEvidenceStore implements Bm2LearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  constructor(private readonly effectOrder: string[] = []) {}

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]> {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1): Promise<void> {
    this.events.push({ learnerId, evidence });
    this.effectOrder.push("evidence");
  }
}

class InMemoryReceiptStore implements Bm2SubmissionReceiptStore {
  readonly receipts = new Map<string, Bm2SubmissionReceipt>();

  constructor(private readonly effectOrder: string[]) {}

  async findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<Bm2SubmissionReceipt | null> {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(
    learnerId: string,
    submissionId: string,
    receipt: Bm2SubmissionReceipt,
  ): Promise<void> {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
    this.effectOrder.push("receipt");
  }
}

function makeMasterySubmission(
  overrides: Partial<Bm2ActivitySubmission> = {},
): Bm2ActivitySubmission {
  return {
    submissionId: SERVER_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: "bm2-pilot-activity-document",
    activityStableActivityId: FROZEN_SOURCE_ACTIVITY_ID,
    stableActivityId: PILOT_ACTIVITY_ID,
    attemptOrdinal: 2,
    masteryContractVersion: "learning-evidence.v1",
    submittedAt: "2026-08-19T10:00:00.000Z",
    submissionData: {
      contractVersion: "practice.v1",
      activityId: PILOT_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "independent_practice",
      status: "graded",
      submittedAt: "2026-08-19T10:00:00.000Z",
      rawAnswer: "server-only-bm2-answer",
    },
    score: 0,
    maxScore: 2,
    gradedAt: "2026-08-19T10:01:00.000Z",
    ...overrides,
  };
}

function createSubmissionHarness({
  submission = makeMasterySubmission(),
}: {
  submission?: Bm2ActivitySubmission | null;
} = {}) {
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  const loadActivitySubmission = vi.fn(async (submissionId: string) =>
    submission?.submissionId === submissionId ? submission : null,
  );
  const masteryBridge = vi.fn(async (): Promise<void> => {
    effectOrder.push("mastery");
  });
  const handler = createBm2SubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
  });

  return {
    effectOrder,
    evidenceStore,
    handler,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
  };
}

describe("BM2 Convex learning-evidence boundary", () => {
  it("derives server grades after trusted exposure and applies the single mastery bridge once before evidence and receipt", async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
    } = createSubmissionHarness();
    evidenceStore.events.push({
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: "learning-evidence.v1",
        nodeId: PILOT_NODE_ID,
        activityId: FROZEN_SOURCE_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "guided_practice",
        occurredAt: "2026-08-19T09:00:00.000Z",
        idempotencyKey: "bm2-trusted-teacher-exposure",
      },
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
      evidence: expect.objectContaining({
        nodeId: PILOT_NODE_ID,
        activityId: PILOT_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: "2026-08-19T10:00:00.000Z",
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
      }),
    };

    expect(loadActivitySubmission).toHaveBeenCalledWith(SERVER_SUBMISSION_ID);
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(masteryBridge).toHaveBeenCalledTimes(1);
    expect(effectOrder).toEqual(["mastery", "evidence", "receipt"]);
    expect(result).toEqual({
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
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SERVER_SUBMISSION_ID}`)).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: true,
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(JSON.stringify(result)).not.toContain("server-only-bm2-answer");
    expect(evidenceStore.events[1]?.evidence).not.toHaveProperty("rawAnswer");
  });

  it("stops before mastery evidence and receipt when the single mastery bridge fails", async () => {
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createSubmissionHarness();

    evidenceStore.events.push({
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: "learning-evidence.v1",
        nodeId: PILOT_NODE_ID,
        activityId: FROZEN_SOURCE_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "guided_practice",
        occurredAt: "2026-08-19T09:00:00.000Z",
        idempotencyKey: "bm2-trusted-teacher-exposure",
      },
    });
    const evidenceCountBeforeAttempt = evidenceStore.events.length;
    const receiptCountBeforeAttempt = receiptStore.receipts.size;
    masteryBridge.mockRejectedValueOnce(new Error("mastery bridge failed"));

    await expect(
      handler.process({
        learnerId: LEARNER_ID,
        submissionId: SERVER_SUBMISSION_ID,
      }),
    ).rejects.toThrow("mastery bridge failed");

    expect(masteryBridge).toHaveBeenCalledTimes(1);
    expect(evidenceStore.events).toHaveLength(evidenceCountBeforeAttempt);
    expect(receiptStore.receipts.size).toBe(receiptCountBeforeAttempt);
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ["an unknown submission", null],
    [
      "a submission owned by another learner",
      makeMasterySubmission({ userId: "other-bm2-learner" }),
    ],
    [
      "a non-pilot activity",
      makeMasterySubmission({
        submissionData: {
          contractVersion: "practice.v1",
          activityId: "unapproved-bm2-activity",
          attemptNumber: 2,
          mode: "independent_practice",
          status: "graded",
          submittedAt: "2026-08-19T10:00:00.000Z",
          rawAnswer: "server-only-bm2-answer",
        },
      }),
    ],
  ])("rejects %s without a mastery effect, evidence, or a receipt", async (_label, submission) => {
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createSubmissionHarness({ submission });

    await expect(
      handler.process({
        learnerId: LEARNER_ID,
        submissionId: SERVER_SUBMISSION_ID,
      }),
    ).resolves.toEqual({ accepted: false, reason: "submission_not_found" });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it("denies a server-owned mastery submission before trusted exposure without writes", async () => {
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createSubmissionHarness();

    await expect(
      handler.process({
        learnerId: LEARNER_ID,
        submissionId: SERVER_SUBMISSION_ID,
      }),
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
  });

  it("returns the original logical receipt on submission replay without another effect", async () => {
    const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } =
      createSubmissionHarness();

    evidenceStore.events.push({
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: "learning-evidence.v1",
        nodeId: PILOT_NODE_ID,
        activityId: FROZEN_SOURCE_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "guided_practice",
        occurredAt: "2026-08-19T09:00:00.000Z",
        idempotencyKey: "bm2-trusted-teacher-exposure",
      },
    });

    const first = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });
    const bridgeCallsBeforeReplay = masteryBridge.mock.calls.length;
    const evidenceCountBeforeReplay = evidenceStore.events.length;
    const receiptCountBeforeReplay = receiptStore.receipts.size;
    const effectsBeforeReplay = [...effectOrder];
    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...first, delivery: "replay" });
    expect(masteryBridge).toHaveBeenCalledTimes(bridgeCallsBeforeReplay);
    expect(evidenceStore.events).toHaveLength(evidenceCountBeforeReplay);
    expect(receiptStore.receipts.size).toBe(receiptCountBeforeReplay);
    expect(effectOrder).toEqual(effectsBeforeReplay);
  });
});
