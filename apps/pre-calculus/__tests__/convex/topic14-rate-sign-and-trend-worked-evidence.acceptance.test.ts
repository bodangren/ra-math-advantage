import { describe, expect, it, vi } from "vitest";

import { generateTopic14RateSignAndTrendOutput } from "@math-platform/math-content/knowledge-space";

import type { MutationCtx } from "@/convex/_generated/server";
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:rate-sign-worked-evidence-learner";
const OTHER_LEARNER_ID = "profiles:rate-sign-worked-evidence-other";
const ACTIVITY_DOCUMENT_ID = "activities:rate-sign-worked-evidence";
const CLIENT_SUBMITTED_AT = "2026-08-29T10:00:00.000Z";
const PART_IDS = ["rateSign", "rateTrend"] as const;
type PartId = (typeof PART_IDS)[number];
type Answers = Record<PartId, string>;
type Row = Record<string, unknown> & { _id: string };

function sourceAnswers(): Answers {
  const expected = generateTopic14RateSignAndTrendOutput(0).expectedAnswer as Record<
    PartId,
    string
  >;
  return {
    rateSign: String(expected.rateSign),
    rateTrend: String(expected.rateTrend),
  };
}

function makeEnvelope(
  answers: Record<string, unknown> = sourceAnswers(),
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

type Consumer = (
  ctx: MutationCtx,
  args: { learnerId: string; submissionId: string },
) => Promise<Record<string, unknown>>;
type Producer = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: Record<string, unknown>;
  },
) => Promise<{ submissionId: string; attemptOrdinal: number; submittedAt: string }>;

async function loadConsumer(): Promise<Consumer> {
  const importedModule = await vi.importActual<Record<string, unknown>>(
    "@/convex/learningEvidence",
  );
  const mutation = importedModule.submitTopic14RateSignAndTrendWorkedSubmission as
    | { _handler?: unknown }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export the Topic 1.4 rate-sign-and-trend Worked evidence consumer.",
    );
  }
  return mutation._handler as Consumer;
}

async function loadProducer(): Promise<Producer> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic14RateSignAndTrendWorkedSubmission as
    | { _handler?: unknown }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export the Topic 1.4 rate-sign-and-trend Worked producer.",
    );
  }
  return mutation._handler as Producer;
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig: { ...PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG },
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const query = (tableName: string) => {
    const conditions = new Map<string, unknown>();
    const upperBounds = new Map<string, unknown>();
    const index = {
      eq(field: string, value: unknown) {
        conditions.set(field, value);
        return index;
      },
      lte(field: string, value: unknown) {
        upperBounds.set(field, value);
        return index;
      },
    };
    const select = () =>
      (rows[tableName] ?? []).filter(
        (row) =>
          [...conditions].every(([field, value]) => row[field] === value) &&
          [...upperBounds].every(
            ([field, value]) =>
              typeof row[field] === "number" && typeof value === "number" && row[field] <= value,
          ),
      );
    const result = {
      unique: async () => {
        const matches = select();
        if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
        return matches[0] ?? null;
      },
      collect: async () => select(),
      first: async () => select()[0] ?? null,
      order: () => result,
      withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
        configure(index);
        return result;
      },
    };
    return result;
  };

  const ctx = {
    db: {
      get: async (_tableName: string, id: string) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null,
      query,
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        tableRows.push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, rows };
}

async function createStoredSubmission() {
  const producer = await loadProducer();
  const harness = createHarness();
  const created = await producer(harness.ctx, {
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
    idempotencyKey: "rate-sign-worked-evidence-create-1",
    submissionData: makeEnvelope(),
  });
  return { ...harness, created };
}

function expectNoEffects(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expectNoSecondaryEffects(harness);
}

function expectNoSecondaryEffects(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
}

describe("Topic 1.4 rate-sign-and-trend Worked evidence", () => {
  it("consumes the real seed-0 source review as one exact ungraded teacher exposure", async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    const answers = sourceAnswers();

    expect(generateTopic14RateSignAndTrendOutput(0).expectedAnswer).toEqual({
      rateSign: "positive",
      rateTrend: "decreasing",
    });
    expect(Object.keys(storedData).sort()).toEqual(
      [
        "activityId",
        "answers",
        "attemptNumber",
        "contractVersion",
        "mode",
        "parts",
        "status",
        "submittedAt",
      ].sort(),
    );
    expect(storedData.answers).toEqual(answers);
    expect(storedData.parts).toEqual(
      PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    );
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).not.toBe(Date.parse(CLIENT_SUBMITTED_AT));
    expect(stored.createdAt).toBe(stored.submittedAt);
    expect(stored.updatedAt).toBe(stored.submittedAt);
    expect(Object.keys(stored).sort()).toEqual(
      [
        "_id",
        "activityId",
        "attemptOrdinal",
        "createIdempotencyKey",
        "createdAt",
        "stableActivityId",
        "submissionData",
        "submittedAt",
        "updatedAt",
        "userId",
      ].sort(),
    );
    for (const field of [
      "masteryContractVersion",
      "score",
      "maxScore",
      "feedback",
      "gradedAt",
      "correctness",
      "isCorrect",
      "answer",
      "answerKey",
      "correctAnswer",
      "correctAnswers",
      "expectedAnswer",
      "grading",
      "gradingMetadata",
      "normalizedAnswer",
      "solution",
      "solutions",
      "solutionSteps",
      "steps",
      "finalAnswer",
      "authority",
    ])
      expect(stored[field]).toBeUndefined();

    await expect(
      consumer(harness.ctx, {
        learnerId: LEARNER_ID,
        submissionId: harness.created.submissionId,
      }),
    ).resolves.toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: false,
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence[0]).toStrictEqual(
      expect.objectContaining({
        learnerId: LEARNER_ID,
        nodeId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
        activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: stored.submittedAt,
        idempotencyKey: `precalc:topic-1-4-rate-sign-and-trend:teacher-led:submission:${harness.created.submissionId}`,
      }),
    );
    expect(harness.rows.learning_evidence[0]!.gradedEvidence).toBeUndefined();
    expectNoSecondaryEffects(harness);
  });

  it("replays without a duplicate effect and preserves teacher-led gating", async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const input = { learnerId: LEARNER_ID, submissionId: harness.created.submissionId };

    await consumer(harness.ctx, input);
    const evidenceAfterFirst = [...harness.rows.learning_evidence];
    await expect(consumer(harness.ctx, input)).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        idempotency: "replay",
        exposureState: "introduced",
        eligible: false,
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(harness.rows.learning_evidence).toEqual(evidenceAfterFirst);
    expectNoSecondaryEffects(harness);
  });

  it("rejects missing and foreign rows without effects", async () => {
    const consumer = await loadConsumer();
    const missing = createHarness();
    await expect(
      consumer(missing.ctx, {
        learnerId: LEARNER_ID,
        submissionId: "activity_submissions:missing",
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(missing);

    const stored = await createStoredSubmission();
    await expect(
      consumer(stored.ctx, {
        learnerId: OTHER_LEARNER_ID,
        submissionId: stored.created.submissionId,
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(stored);
  });

  it.each([
    [
      "wrong activity document",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.activityId = "activities:wrong";
      },
    ],
    [
      "wrong row stable ID",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.stableActivityId = "wrong.stable";
      },
    ],
    [
      "wrong provisioned stable ID",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.stableActivityId = "wrong.provisioned";
      },
    ],
    [
      "wrong component",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.componentKey = "wrong-component";
      },
    ],
    [
      "wrong props mode",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activities[0]!.props as Record<string, unknown>).presentationMode =
          "guided_practice";
      },
    ],
    [
      "wrong generator",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).generatorKey =
          "wrong-generator";
      },
    ],
    [
      "extra grading config",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true;
      },
    ],
    [
      "wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1;
      },
    ],
    [
      "non-record props",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.props = "wrong";
      },
    ],
    [
      "non-record grading config",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = "wrong";
      },
    ],
    [
      "extra envelope",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).extra =
          true;
      },
    ],
    [
      "wrong contract",
      (harness: ReturnType<typeof createHarness>) => {
        (
          harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>
        ).contractVersion = "wrong";
      },
    ],
    [
      "wrong envelope activity",
      (harness: ReturnType<typeof createHarness>) => {
        (
          harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>
        ).activityId = "wrong";
      },
    ],
    [
      "wrong mode",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).mode =
          "guided_practice";
      },
    ],
    [
      "wrong status",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).status =
          "graded";
      },
    ],
    [
      "extra answer",
      (harness: ReturnType<typeof createHarness>) => {
        (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).answers =
          { ...sourceAnswers(), extra: "x" };
      },
    ],
    [
      "wrong source answer",
      (harness: ReturnType<typeof createHarness>) => {
        const data = harness.rows.activity_submissions[0]!.submissionData as Record<
          string,
          unknown
        >;
        data.answers = { ...sourceAnswers(), rateSign: "negative" };
        data.parts = PART_IDS.map((partId) => ({
          partId,
          rawAnswer: (data.answers as Record<string, unknown>)[partId],
        }));
      },
    ],
    [
      "missing answer",
      (harness: ReturnType<typeof createHarness>) => {
        const data = harness.rows.activity_submissions[0]!.submissionData as Record<
          string,
          unknown
        >;
        data.answers = { rateSign: sourceAnswers().rateSign };
      },
    ],
    [
      "missing part",
      (harness: ReturnType<typeof createHarness>) => {
        const data = harness.rows.activity_submissions[0]!.submissionData as Record<
          string,
          unknown
        >;
        data.parts = (data.parts as unknown[]).slice(1);
      },
    ],
    [
      "extra part field",
      (harness: ReturnType<typeof createHarness>) => {
        (
          (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>)
            .parts as Record<string, unknown>[]
        )[0]!.score = 1;
      },
    ],
    [
      "reordered parts",
      (harness: ReturnType<typeof createHarness>) => {
        const data = harness.rows.activity_submissions[0]!.submissionData as Record<
          string,
          unknown
        >;
        data.parts = [...(data.parts as unknown[])].reverse();
      },
    ],
    [
      "duplicate part",
      (harness: ReturnType<typeof createHarness>) => {
        const data = harness.rows.activity_submissions[0]!.submissionData as Record<
          string,
          unknown
        >;
        data.parts = [
          ...(data.parts as unknown[]).slice(0, 1),
          { ...(data.parts as Record<string, unknown>[])[0] },
        ];
      },
    ],
    [
      "raw part mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        (
          (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>)
            .parts as Record<string, unknown>[]
        )[0]!.rawAnswer = "negative";
      },
    ],
    [
      "invalid ordinal",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
      },
    ],
    [
      "fractional ordinal",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = 1.5;
      },
    ],
    [
      "ordinal mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = 2;
      },
    ],
    [
      "invalid envelope time",
      (harness: ReturnType<typeof createHarness>) => {
        (
          harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>
        ).submittedAt = "not-a-date";
      },
    ],
    [
      "envelope time mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        (
          harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>
        ).submittedAt = "2026-08-29T11:00:00.000Z";
      },
    ],
    [
      "invalid stored time",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.submittedAt = Number.NaN;
      },
    ],
    [
      "stored time mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.submittedAt = Date.parse("2026-08-29T11:00:00.000Z");
      },
    ],
    [
      "invalid created time",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.createdAt = Number.NaN;
      },
    ],
    [
      "created time mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.createdAt = 1;
      },
    ],
    [
      "invalid updated time",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.updatedAt = Number.NaN;
      },
    ],
    [
      "updated time mismatch",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activity_submissions[0]!.updatedAt = 1;
      },
    ],
    ...[
      "masteryContractVersion",
      "score",
      "maxScore",
      "feedback",
      "gradedAt",
      "correctness",
      "isCorrect",
      "answer",
      "answerKey",
      "correctAnswer",
      "correctAnswers",
      "expectedAnswer",
      "grading",
      "gradingMetadata",
      "normalizedAnswer",
      "solution",
      "solutions",
      "solutionSteps",
      "steps",
      "finalAnswer",
      "authority",
    ].map(
      (field) =>
        [
          field,
          (harness: ReturnType<typeof createHarness>) => {
            harness.rows.activity_submissions[0]![field] = "forged";
          },
        ] as const,
    ),
  ] as const)("rejects %s without effects", async (_label, corrupt) => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    corrupt(harness);

    await expect(
      consumer(harness.ctx, {
        learnerId: LEARNER_ID,
        submissionId: harness.created.submissionId,
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(harness);
  });
});
