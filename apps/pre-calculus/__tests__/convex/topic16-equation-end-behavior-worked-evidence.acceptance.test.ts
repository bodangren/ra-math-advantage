import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";
import { polynomialEquationEndBehaviorSchema } from "@math-platform/math-content/schemas";
import type { MutationCtx } from "@/convex/_generated/server";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const USER_ID = "profiles:topic16-equation-end-behavior-worked-evidence-learner";
const OTHER_USER_ID = `${USER_ID}-other`;
const ACTIVITY_DOCUMENT_ID = "activities:topic16-equation-end-behavior-worked";
const CLIENT_SUBMITTED_AT = "2026-08-30T00:00:00.000Z";
const SERVER_NOW = Date.parse("2026-08-30T12:00:00.000Z");
const SERVER_SUBMITTED_AT = "2026-08-30T12:00:00.000Z";
const WORKED_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID;
const PART_IDS = [
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
] as const;
const SOURCE_OUTPUT = generateTopic16EquationEndBehaviorOutput(0);
const SOURCE_ANSWERS = SOURCE_OUTPUT.expectedAnswer as Record<string, unknown>;
const SOURCE_PARTS = PART_IDS.map((partId) => ({
  partId,
  rawAnswer: SOURCE_ANSWERS[partId],
}));
const WORKED_PROPS = {
  ...(SOURCE_OUTPUT.data.rendererProps as Record<string, unknown>),
  presentationMode: "worked_example",
  correctAnswers: SOURCE_OUTPUT.expectedAnswer,
  steps: SOURCE_OUTPUT.solutionSteps.map((step) => step.description),
  finalAnswer: "The six polynomial end behaviors are shown above.",
};
const CREATE_KEY = "topic16-equation-end-behavior-worked-evidence-create-1";

type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
type Input = {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
};

function makeEnvelope(overrides: Record<string, unknown> = {}): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: WORKED_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: SOURCE_ANSWERS,
    parts: SOURCE_PARTS,
    ...overrides,
  };
}

function makeInput(overrides: Partial<Input> = {}): Input {
  return {
    userId: USER_ID,
    activityId: WORKED_ID,
    idempotencyKey: CREATE_KEY,
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: WORKED_ID,
        componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
        props: structuredClone(WORKED_PROPS),
        gradingConfig: {
          ...PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
        },
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    kst_states: [],
    srs_cards: [],
    srs_review_log: [],
    mastery_effects: [],
  };
  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  const ctx = {
    db: {
      get: async (_tableName: string, id: string) => {
        const matches = Object.values(rows)
          .flat()
          .filter((row) => row._id === id);
        return matches.length === 1 ? matches[0] : null;
      },
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        let orderDirection: "asc" | "desc" = "asc";
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
          lte(field: string, value: unknown) {
            conditions.set(`${field}__lte`, value);
            return index;
          },
        };
        const selectRows = () => {
          const upperBounds = [...conditions]
            .filter(([field]) => field.endsWith("__lte"))
            .map(([field, value]) => [field.slice(0, -"__lte".length), value] as const);
          const exact = new Map([...conditions].filter(([field]) => !field.endsWith("__lte")));
          return select(tableName, exact).filter((row) =>
            upperBounds.every(
              ([field, value]) =>
                typeof row[field] === "number" && typeof value === "number" && row[field] <= value,
            ),
          );
        };
        const result = {
          unique: async () => {
            const matches = selectRows();
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = selectRows();
            if (orderDirection === "desc") matches.reverse();
            return matches[0] ?? null;
          },
          order: (direction: "asc" | "desc") => {
            orderDirection = direction;
            return result;
          },
        };
        return {
          withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            return result;
          },
          ...result,
        };
      },
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

type Harness = ReturnType<typeof createHarness>;

async function loadProducer() {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic16EquationEndBehaviorWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("The Topic 1.6 Worked producer is not available.");
  }
  return mutation._handler as (
    ctx: MutationCtx,
    args: Input,
  ) => Promise<{
    submissionId: string;
    attemptOrdinal: number;
    submittedAt: string;
  }>;
}

async function loadConsumer() {
  const importedModule = await vi.importActual<Record<string, unknown>>(
    "@/convex/learningEvidence",
  );
  const mutation = importedModule.submitTopic16EquationEndBehaviorWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("The Topic 1.6 Worked teacher-exposure consumer is not available.");
  }
  return mutation._handler as (
    ctx: MutationCtx,
    args: {
      learnerId: string;
      submissionId: string;
    },
  ) => Promise<Record<string, unknown>>;
}

async function createStoredSubmission() {
  const producer = await loadProducer();
  const harness = createHarness();
  vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
  const created = await producer(harness.ctx, makeInput());
  return { ...harness, created };
}

function expectNoForbiddenFields(value: unknown): void {
  const forbidden = new Set([
    "score",
    "maxScore",
    "feedback",
    "gradedAt",
    "masteryContractVersion",
    "evidence",
    "kst",
    "srs",
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
  ]);
  const keys: string[] = [];
  const collect = (nested: unknown) => {
    if (Array.isArray(nested)) nested.forEach(collect);
    else if (nested && typeof nested === "object") {
      Object.entries(nested).forEach(([key, child]) => {
        keys.push(key);
        collect(child);
      });
    }
  };
  collect(value);
  expect(keys.filter((key) => forbidden.has(key))).toEqual([]);
}

function expectNoEffects(harness: Harness, submissionCount: number): void {
  expect(harness.rows.activity_submissions).toHaveLength(submissionCount);
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.kst_states).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
  expect(harness.rows.mastery_effects).toHaveLength(0);
}

function storedData(harness: Harness): SubmissionData {
  return harness.rows.activity_submissions[0]!.submissionData as SubmissionData;
}

function opposite(value: unknown): "up" | "down" {
  return value === "up" ? "down" : "up";
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Topic 1.6 equation-end-behavior Worked teacher exposure", () => {
  it("records the exact seed-0 source row as teacher exposure", async () => {
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    const data = stored.submissionData as SubmissionData;
    const activity = harness.rows.activities[0]!;

    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    );
    expect(activity).toEqual({
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: WORKED_ID,
      componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
      props: WORKED_PROPS,
      gradingConfig: {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 0,
      },
    });
    expect(polynomialEquationEndBehaviorSchema.safeParse(WORKED_PROPS).success).toBe(true);
    expect(
      Object.keys(stored)
        .filter((key) => key !== "_creationTime")
        .sort(),
    ).toEqual([
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
    ]);
    if (Object.hasOwn(stored, "_creationTime")) {
      expect(typeof stored._creationTime).toBe("number");
      expect(Number.isFinite(stored._creationTime)).toBe(true);
    }
    expect(stored.userId).toBe(USER_ID);
    expect(stored.activityId).toBe(ACTIVITY_DOCUMENT_ID);
    expect(stored.stableActivityId).toBe(WORKED_ID);
    expect(stored.createIdempotencyKey).toBe(CREATE_KEY);
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).toBe(SERVER_NOW);
    expect(stored.createdAt).toBe(SERVER_NOW);
    expect(stored.updatedAt).toBe(SERVER_NOW);
    expect(Object.keys(data).sort()).toEqual([
      "activityId",
      "answers",
      "attemptNumber",
      "contractVersion",
      "mode",
      "parts",
      "status",
      "submittedAt",
    ]);
    expect(data).toEqual({
      contractVersion: "practice.v1",
      activityId: WORKED_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: SERVER_SUBMITTED_AT,
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    expect(Object.keys(data.answers as Record<string, unknown>).sort()).toEqual(
      [...PART_IDS].sort(),
    );
    expect((data.parts as Array<Record<string, unknown>>).map((part) => part.partId)).toEqual([
      ...PART_IDS,
    ]);
    expect((data.parts as Array<Record<string, unknown>>).map((part) => part.rawAnswer)).toEqual(
      PART_IDS.map((partId) => SOURCE_ANSWERS[partId]),
    );
    expectNoForbiddenFields(stored);

    const consumer = await loadConsumer();
    await expect(
      consumer(harness.ctx, {
        learnerId: USER_ID,
        submissionId: stored._id,
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
    expect(harness.rows.learning_evidence[0]).toMatchObject({
      origin: "teacher_led",
      nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    });
    expect(harness.rows.kst_states).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);
  });

  it("records teacher exposure with a max-safe stored ordinal", async () => {
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    stored.attemptOrdinal = Number.MAX_SAFE_INTEGER;
    storedData(harness).attemptNumber = Number.MAX_SAFE_INTEGER;
    stored._creationTime = SERVER_NOW;
    const consumer = await loadConsumer();

    await expect(
      consumer(harness.ctx, {
        learnerId: USER_ID,
        submissionId: stored._id,
      }),
    ).resolves.toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      decision: {
        idempotency: "new",
        reason: "teacher_led",
      },
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence[0]).toMatchObject({
      origin: "teacher_led",
      nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    });
    expect(harness.rows.kst_states).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);
  });

  it("rejects missing and foreign submissions without effects", async () => {
    const missing = createHarness();
    const consumer = await loadConsumer();
    await expect(
      consumer(missing.ctx, {
        learnerId: USER_ID,
        submissionId: "activity_submissions:missing",
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(missing, 0);

    const stored = await createStoredSubmission();
    await expect(
      consumer(stored.ctx, {
        learnerId: OTHER_USER_ID,
        submissionId: stored.created.submissionId,
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(stored, 1);
  });

  const corruptStoredRowCases: Array<readonly [string, (harness: Harness) => void]> = [
    [
      "missing physical activity ID",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.activityId;
      },
    ],
    [
      "blank physical activity ID",
      (harness) => {
        harness.rows.activity_submissions[0]!.activityId = "   ";
      },
    ],
    [
      "wrong physical activity ID",
      (harness) => {
        harness.rows.activity_submissions[0]!.activityId = "activities:wrong";
      },
    ],
    [
      "missing stable activity ID",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.stableActivityId;
      },
    ],
    [
      "wrong stable activity ID",
      (harness) => {
        harness.rows.activity_submissions[0]!.stableActivityId = "wrong.stable";
      },
    ],
    [
      "missing stored user ID",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.userId;
      },
    ],
    [
      "wrong stored user ID",
      (harness) => {
        harness.rows.activity_submissions[0]!.userId = OTHER_USER_ID;
      },
    ],
    [
      "extra stored row field",
      (harness) => {
        harness.rows.activity_submissions[0]!.extra = true;
      },
    ],
    [
      "missing activity row",
      (harness) => {
        harness.rows.activities.splice(0, 1);
      },
    ],
    [
      "duplicate activity row",
      (harness) => {
        harness.rows.activities.push({ ...harness.rows.activities[0]! });
      },
    ],
    [
      "wrong provisioned stable activity ID",
      (harness) => {
        harness.rows.activities[0]!.stableActivityId = "wrong.provisioned";
      },
    ],
    [
      "wrong component key",
      (harness) => {
        harness.rows.activities[0]!.componentKey = "wrong-component";
      },
    ],
    [
      "non-record props",
      (harness) => {
        harness.rows.activities[0]!.props = "wrong";
      },
    ],
    [
      "wrong presentation mode",
      (harness) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
    ],
    [
      "extra activity prop",
      (harness) => {
        (harness.rows.activities[0]!.props as Record<string, unknown>).extra = true;
      },
    ],
    [
      "missing activity prompt",
      (harness) => {
        delete (harness.rows.activities[0]!.props as Record<string, unknown>).prompt;
      },
    ],
    [
      "changed activity prompt",
      (harness) => {
        const props = harness.rows.activities[0]!.props as Record<string, unknown>;
        props.prompt = `${String(props.prompt)} changed`;
      },
    ],
    [
      "changed first activity expression",
      (harness) => {
        const props = harness.rows.activities[0]!.props as Record<string, unknown>;
        const items = [...(props.items as Array<Record<string, unknown>>)].map((item) => ({
          ...item,
        }));
        items[0]!.expression = "changed expression";
        props.items = items;
      },
    ],
    [
      "changed activity correct answer",
      (harness) => {
        const props = harness.rows.activities[0]!.props as Record<string, unknown>;
        const answers = { ...(props.correctAnswers as Record<string, unknown>) };
        answers.a_leftEnd = opposite(answers.a_leftEnd);
        props.correctAnswers = answers;
      },
    ],
    [
      "changed first activity step",
      (harness) => {
        const props = harness.rows.activities[0]!.props as Record<string, unknown>;
        const steps = [...(props.steps as string[])];
        steps[0] = "changed step";
        props.steps = steps;
      },
    ],
    [
      "changed activity final answer",
      (harness) => {
        const props = harness.rows.activities[0]!.props as Record<string, unknown>;
        props.finalAnswer = "changed final answer";
      },
    ],
    [
      "non-record grading config",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = "wrong";
      },
    ],
    [
      "extra grading config key",
      (harness) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true;
      },
    ],
    [
      "wrong generator key",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = { generatorKey: "wrong", variantSeed: 0 };
      },
    ],
    [
      "wrong grading seed",
      (harness) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1;
      },
    ],
    [
      "fractional grading seed",
      (harness) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 0.5;
      },
    ],
    [
      "unsafe grading seed",
      (harness) => {
        (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed =
          Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "missing create key",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.createIdempotencyKey;
      },
    ],
    [
      "blank create key",
      (harness) => {
        harness.rows.activity_submissions[0]!.createIdempotencyKey = "   ";
      },
    ],
    [
      "non-string create key",
      (harness) => {
        harness.rows.activity_submissions[0]!.createIdempotencyKey = 1;
      },
    ],
    [
      "non-record submission data",
      (harness) => {
        harness.rows.activity_submissions[0]!.submissionData = null;
      },
    ],
    [
      "extra envelope field",
      (harness) => {
        storedData(harness).extra = true;
      },
    ],
    [
      "missing envelope field",
      (harness) => {
        delete storedData(harness).status;
      },
    ],
    [
      "wrong envelope contract",
      (harness) => {
        storedData(harness).contractVersion = "practice.v0";
      },
    ],
    [
      "wrong envelope activity",
      (harness) => {
        storedData(harness).activityId = "wrong";
      },
    ],
    [
      "wrong envelope mode",
      (harness) => {
        storedData(harness).mode = "guided_practice";
      },
    ],
    [
      "wrong envelope status",
      (harness) => {
        storedData(harness).status = "graded";
      },
    ],
    [
      "missing envelope attempt",
      (harness) => {
        delete storedData(harness).attemptNumber;
      },
    ],
    [
      "wrong envelope attempt type",
      (harness) => {
        storedData(harness).attemptNumber = "1";
      },
    ],
    [
      "zero envelope attempt",
      (harness) => {
        storedData(harness).attemptNumber = 0;
      },
    ],
    [
      "fractional envelope attempt",
      (harness) => {
        storedData(harness).attemptNumber = 1.5;
      },
    ],
    [
      "unsafe envelope attempt",
      (harness) => {
        storedData(harness).attemptNumber = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "mismatched envelope attempt",
      (harness) => {
        storedData(harness).attemptNumber = 2;
      },
    ],
    [
      "missing row ordinal",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.attemptOrdinal;
      },
    ],
    [
      "wrong row ordinal type",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = "1";
      },
    ],
    [
      "zero row ordinal",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
      },
    ],
    [
      "negative row ordinal",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = -1;
      },
    ],
    [
      "fractional row ordinal",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = 1.5;
      },
    ],
    [
      "nonfinite row ordinal",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = Number.NaN;
      },
    ],
    [
      "unsafe row ordinal",
      (harness) => {
        harness.rows.activity_submissions[0]!.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "missing inner submitted time",
      (harness) => {
        delete storedData(harness).submittedAt;
      },
    ],
    [
      "wrong inner submitted time type",
      (harness) => {
        storedData(harness).submittedAt = 1;
      },
    ],
    [
      "invalid inner submitted time",
      (harness) => {
        storedData(harness).submittedAt = "not-a-time";
      },
    ],
    [
      "noncanonical inner submitted time",
      (harness) => {
        storedData(harness).submittedAt = "2026-08-30T12:00:00Z";
        harness.rows.activity_submissions[0]!.submittedAt = Date.parse("2026-08-30T12:00:00Z");
      },
    ],
    [
      "mismatched inner submitted time",
      (harness) => {
        storedData(harness).submittedAt = "2026-08-30T12:00:01.000Z";
      },
    ],
    [
      "missing row submitted time",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.submittedAt;
      },
    ],
    [
      "wrong row submitted time type",
      (harness) => {
        harness.rows.activity_submissions[0]!.submittedAt = "1";
      },
    ],
    [
      "nonfinite row submitted time",
      (harness) => {
        harness.rows.activity_submissions[0]!.submittedAt = Number.NaN;
      },
    ],
    [
      "mismatched row submitted time",
      (harness) => {
        harness.rows.activity_submissions[0]!.submittedAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "missing created time",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.createdAt;
      },
    ],
    [
      "wrong created time type",
      (harness) => {
        harness.rows.activity_submissions[0]!.createdAt = "now";
      },
    ],
    [
      "nonfinite created time",
      (harness) => {
        harness.rows.activity_submissions[0]!.createdAt = Number.NaN;
      },
    ],
    [
      "mismatched created time",
      (harness) => {
        harness.rows.activity_submissions[0]!.createdAt = SERVER_NOW - 1_000;
      },
    ],
    [
      "missing updated time",
      (harness) => {
        delete harness.rows.activity_submissions[0]!.updatedAt;
      },
    ],
    [
      "wrong updated time type",
      (harness) => {
        harness.rows.activity_submissions[0]!.updatedAt = "now";
      },
    ],
    [
      "nonfinite updated time",
      (harness) => {
        harness.rows.activity_submissions[0]!.updatedAt = Number.POSITIVE_INFINITY;
      },
    ],
    [
      "mismatched updated time",
      (harness) => {
        harness.rows.activity_submissions[0]!.updatedAt = SERVER_NOW - 1_000;
      },
    ],
    [
      "missing answers",
      (harness) => {
        delete storedData(harness).answers;
      },
    ],
    [
      "non-record answers",
      (harness) => {
        storedData(harness).answers = null;
      },
    ],
    [
      "extra answer key",
      (harness) => {
        (storedData(harness).answers as Record<string, unknown>).extra = "up";
      },
    ],
    [
      "wrong answer key",
      (harness) => {
        const answers = { ...(storedData(harness).answers as Record<string, unknown>) };
        delete answers.a_leftEnd;
        answers.a_left = "down";
        storedData(harness).answers = answers;
      },
    ],
    [
      "noncanonical answer value",
      (harness) => {
        (storedData(harness).answers as Record<string, unknown>).a_leftEnd = "UP";
      },
    ],
    [
      "missing parts",
      (harness) => {
        delete storedData(harness).parts;
      },
    ],
    [
      "empty parts",
      (harness) => {
        storedData(harness).parts = [];
      },
    ],
    [
      "reordered parts",
      (harness) => {
        const parts = storedData(harness).parts as Array<Record<string, unknown>>;
        [parts[0], parts[1]] = [parts[1]!, parts[0]!];
      },
    ],
    [
      "duplicate part",
      (harness) => {
        const parts = storedData(harness).parts as Array<Record<string, unknown>>;
        parts[1] = { ...parts[0]! };
      },
    ],
    [
      "wrong part ID",
      (harness) => {
        (storedData(harness).parts as Array<Record<string, unknown>>)[0]!.partId = "wrong_part";
      },
    ],
    [
      "missing part raw answer",
      (harness) => {
        delete (storedData(harness).parts as Array<Record<string, unknown>>)[0]!.rawAnswer;
      },
    ],
    [
      "extra part field",
      (harness) => {
        (storedData(harness).parts as Array<Record<string, unknown>>)[0]!.extra = true;
      },
    ],
    [
      "wrong part raw answer",
      (harness) => {
        (storedData(harness).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = opposite(
          SOURCE_ANSWERS.a_leftEnd,
        );
      },
    ],
    [
      "noncanonical part raw answer",
      (harness) => {
        (storedData(harness).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = "UP";
      },
    ],
  ];

  it.each(corruptStoredRowCases)(
    "rejects %s stored row without effects",
    async (_label, corrupt) => {
      const harness = await createStoredSubmission();
      corrupt(harness);
      const consumer = await loadConsumer();

      await expect(
        consumer(harness.ctx, {
          learnerId: USER_ID,
          submissionId: harness.created.submissionId,
        }),
      ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
      expectNoEffects(harness, 1);
    },
  );

  it("rejects a duplicate stored submission ID without effects", async () => {
    const harness = await createStoredSubmission();
    harness.rows.activity_submissions.push({ ...harness.rows.activity_submissions[0]! });
    const consumer = await loadConsumer();

    await expect(
      consumer(harness.ctx, {
        learnerId: USER_ID,
        submissionId: harness.created.submissionId,
      }),
    ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
    expectNoEffects(harness, 2);
  });

  const sourceAnswerCorruptionCases = PART_IDS.map(
    (partId) =>
      [
        partId,
        (harness: Harness) => {
          const answers = storedData(harness).answers as Record<string, unknown>;
          const next = opposite(answers[partId]);
          answers[partId] = next;
          const part = (storedData(harness).parts as Array<Record<string, unknown>>).find(
            (candidate) => candidate.partId === partId,
          )!;
          part.rawAnswer = next;
        },
      ] as const,
  );

  it.each(sourceAnswerCorruptionCases)(
    "rejects stored source answer and raw part changes for %s",
    async (_partId, corrupt) => {
      const harness = await createStoredSubmission();
      corrupt(harness);
      const consumer = await loadConsumer();

      await expect(
        consumer(harness.ctx, {
          learnerId: USER_ID,
          submissionId: harness.created.submissionId,
        }),
      ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
      expectNoEffects(harness, 1);
    },
  );

  const forbiddenStoredFields = [
    "score",
    "maxScore",
    "feedback",
    "gradedAt",
    "masteryContractVersion",
    "evidence",
    "kst",
    "srs",
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
  ] as const;

  it.each(forbiddenStoredFields)(
    "rejects stored forbidden field %s without effects",
    async (field) => {
      const harness = await createStoredSubmission();
      harness.rows.activity_submissions[0]![field] = true;
      const consumer = await loadConsumer();

      await expect(
        consumer(harness.ctx, {
          learnerId: USER_ID,
          submissionId: harness.created.submissionId,
        }),
      ).resolves.toStrictEqual({ accepted: false, reason: "submission_not_found" });
      expectNoEffects(harness, 1);
    },
  );
});
