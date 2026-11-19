import { describe, expect, it } from "vitest";

// Green target for Task 3.1. This module intentionally does not exist at the
// Red baseline; it is the domain-neutral contract consumed by app adapters.
import {
  evaluateLearningEvidenceV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type EvaluateLearningEvidenceV1Input,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from "../index";

const BASE_OCCURRED_AT = "2026-08-19T08:30:00.000Z";

function makeEvidence(overrides: Partial<LearningEvidenceV1> = {}): LearningEvidenceV1 {
  return {
    contractVersion: "learning-evidence.v1",
    nodeId: "domain.shared.skill.linear-functions",
    activityId: "linear-functions.independent-practice",
    attemptOrdinal: 1,
    origin: "mastery_advantage",
    mode: "independent_practice",
    occurredAt: BASE_OCCURRED_AT,
    idempotencyKey: "evidence-001",
    ...overrides,
  };
}

function evaluate(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[] = [],
): LearningEvidenceDecisionV1 {
  const input: EvaluateLearningEvidenceV1Input = {
    evidence,
    acceptedEvidence,
    enabledNodeIds: [evidence.nodeId],
  };

  return evaluateLearningEvidenceV1(input);
}

describe("learning-evidence.v1 schema", () => {
  it.each([
    "worked_example",
    "guided_practice",
    "independent_practice",
    "assessment",
    "teaching",
  ] as const)("accepts practice.v1 mode %s for both evidence origins", (mode) => {
    for (const origin of ["teacher_led", "mastery_advantage"] as const) {
      const parsed = learningEvidenceV1Schema.safeParse(makeEvidence({ origin, mode }));
      expect(parsed.success, `${origin}/${mode}`).toBe(true);
    }
  });

  it.each([
    { label: "wrong contract version", overrides: { contractVersion: "learning-evidence.v2" } },
    { label: "blank nodeId", overrides: { nodeId: "   " } },
    { label: "blank activityId", overrides: { activityId: "" } },
    { label: "zero attempt ordinal", overrides: { attemptOrdinal: 0 } },
    { label: "fractional attempt ordinal", overrides: { attemptOrdinal: 1.5 } },
    { label: "unknown origin", overrides: { origin: "homework_portal" } },
    { label: "unknown practice mode", overrides: { mode: "quiz" } },
    { label: "non-UTC timestamp", overrides: { occurredAt: "2026-08-19T09:30:00+01:00" } },
    { label: "invalid calendar timestamp", overrides: { occurredAt: "2026-02-30T08:30:00.000Z" } },
    { label: "blank idempotency key", overrides: { idempotencyKey: "  " } },
    { label: "raw answer leak", overrides: { rawAnswer: "student-private-answer" } },
  ])("strictly rejects $label", ({ overrides }) => {
    const candidate = { ...makeEvidence(), ...overrides };
    expect(learningEvidenceV1Schema.safeParse(candidate).success).toBe(false);
  });

  it.each([
    { label: "correctness-only outcome", gradedEvidence: { isCorrect: true } },
    { label: "incorrectness-only outcome", gradedEvidence: { isCorrect: false } },
    { label: "zero score at zero max score", gradedEvidence: { score: 0, maxScore: 0 } },
    { label: "full score", gradedEvidence: { score: 6, maxScore: 6 } },
    {
      label: "both correctness and paired score",
      gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
    },
  ])("accepts valid $label", ({ gradedEvidence }) => {
    expect(learningEvidenceV1Schema.safeParse(makeEvidence({ gradedEvidence })).success).toBe(true);
  });

  it.each([
    { label: "empty graded evidence", gradedEvidence: {} },
    { label: "unpaired score", gradedEvidence: { score: 4 } },
    { label: "unpaired max score", gradedEvidence: { maxScore: 4 } },
    { label: "negative score", gradedEvidence: { score: -1, maxScore: 4 } },
    { label: "score above max score", gradedEvidence: { score: 5, maxScore: 4 } },
    {
      label: "unknown graded-evidence member",
      gradedEvidence: { isCorrect: true, rawAnswer: "must-not-enter-the-contract" },
    },
  ])("strictly rejects $label", ({ gradedEvidence }) => {
    expect(learningEvidenceV1Schema.safeParse({ ...makeEvidence(), gradedEvidence }).success).toBe(
      false,
    );
  });
});

describe("normalizeLearningEvidenceV1", () => {
  it("canonicalizes equivalent IDs and UTC timestamp syntax", () => {
    const compact = normalizeLearningEvidenceV1({
      ...makeEvidence(),
      nodeId: "  domain.shared.skill.linear-functions  ",
      activityId: "  linear-functions.independent-practice  ",
      occurredAt: "2026-08-19T08:30:00Z",
    });
    const canonical = normalizeLearningEvidenceV1(makeEvidence());

    expect(compact).toEqual(canonical);
    expect(compact.occurredAt).toBe(BASE_OCCURRED_AT);
  });
});

describe("evaluateLearningEvidenceV1", () => {
  it("treats full-score teacher-led evidence as an introduction, never mastery-bearing", () => {
    const decision = evaluate(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    );

    expect(decision).toEqual({
      idempotency: "new",
      exposureState: "introduced",
      eligible: false,
      reason: "teacher_led",
      masteryBearing: false,
    });
  });

  it("returns awaiting_teacher_exposure before a same-node teacher exposure", () => {
    const decision = evaluate(
      makeEvidence({
        gradedEvidence: { isCorrect: true },
      }),
    );

    expect(decision).toEqual({
      idempotency: "new",
      exposureState: "awaiting_teacher_exposure",
      eligible: false,
      reason: "awaiting_teacher_exposure",
      masteryBearing: false,
    });
  });

  it("requires teacher exposure at or before the Mastery Advantage event time", () => {
    const laterTeacherExposure = normalizeLearningEvidenceV1(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        occurredAt: "2026-08-19T09:30:00.000Z",
        idempotencyKey: "teacher-after-mastery-event",
      }),
    );
    const decision = evaluate(
      makeEvidence({
        occurredAt: "2026-08-19T08:30:00.000Z",
        gradedEvidence: { isCorrect: true },
      }),
      [laterTeacherExposure],
    );

    expect(decision).toEqual({
      idempotency: "new",
      exposureState: "awaiting_teacher_exposure",
      eligible: false,
      reason: "awaiting_teacher_exposure",
      masteryBearing: false,
    });
  });

  it("allows only post-exposure graded Mastery Advantage evidence into mastery", () => {
    const teacherExposure = normalizeLearningEvidenceV1(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        occurredAt: "2026-08-19T08:30:00.000Z",
        idempotencyKey: "teacher-exposure",
      }),
    );

    const ungraded = evaluate(
      makeEvidence({
        occurredAt: "2026-08-19T08:31:00.000Z",
        idempotencyKey: "ungraded-mastery-advantage",
      }),
      [teacherExposure],
    );
    const graded = evaluate(
      makeEvidence({
        occurredAt: "2026-08-19T08:32:00.000Z",
        idempotencyKey: "graded-mastery-advantage",
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
      [teacherExposure],
    );

    expect(ungraded).toEqual({
      idempotency: "new",
      exposureState: "introduced",
      eligible: false,
      reason: "ungraded_evidence",
      masteryBearing: false,
    });
    expect(graded).toEqual({
      idempotency: "new",
      exposureState: "introduced",
      eligible: true,
      reason: "eligible",
      masteryBearing: true,
    });
  });

  it("replays a same-key equivalent normalized payload without a second logical effect", () => {
    const accepted = normalizeLearningEvidenceV1(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        nodeId: "domain.shared.skill.linear-functions",
        activityId: "linear-functions.independent-practice",
        occurredAt: "2026-08-19T08:30:00.000Z",
      }),
    );
    const replay = evaluate(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        nodeId: "  domain.shared.skill.linear-functions  ",
        activityId: "  linear-functions.independent-practice  ",
        occurredAt: "2026-08-19T08:30:00Z",
      }),
      [accepted],
    );

    expect(replay).toEqual({
      idempotency: "replay",
      exposureState: "introduced",
      eligible: false,
      reason: "teacher_led",
      masteryBearing: false,
    });
  });

  it("rejects same-key reuse when the normalized payload conflicts", () => {
    const accepted = normalizeLearningEvidenceV1(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
      }),
    );
    const conflict = evaluate(
      makeEvidence({
        origin: "teacher_led",
        mode: "teaching",
        attemptOrdinal: 2,
      }),
      [accepted],
    );

    expect(conflict).toEqual({
      idempotency: "conflict",
      exposureState: "introduced",
      eligible: false,
      reason: "idempotency_conflict",
      masteryBearing: false,
    });
  });

  it("rejects a node that is absent from the required enabled-node manifest", () => {
    const evidence = makeEvidence({
      origin: "teacher_led",
      mode: "teaching",
    });
    const input: EvaluateLearningEvidenceV1Input = {
      evidence,
      acceptedEvidence: [],
      enabledNodeIds: ["domain.shared.skill.different-node"],
    };

    expect(evaluateLearningEvidenceV1(input)).toEqual({
      idempotency: "new",
      exposureState: "awaiting_teacher_exposure",
      eligible: false,
      reason: "node_not_enabled",
      masteryBearing: false,
    });
  });
});
