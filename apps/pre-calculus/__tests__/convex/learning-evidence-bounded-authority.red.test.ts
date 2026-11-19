import { describe, expect, it, vi } from "vitest";

import {
  createTopic12TableAverageRateSubmission,
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
} from "@/convex/activities";
import { submitRoutedEvidenceHandler } from "@/convex/selectedLearningEvidence";
import {
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NODE_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import { generateTopic12TableAverageRateChoice } from "@math-platform/math-content/knowledge-space";

const LEARNER_ID = "profiles:precalc-bounded-authority-learner";
const OTHER_LEARNER_ID = "profiles:precalc-bounded-authority-other-learner";
const ACTIVITY_DOCUMENT_ID = "activities:precalc-bounded-authority-topic-1-2";
const PILOT_ACTIVITY_ID = PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID;
const CANDIDATE_OCCURRED_AT = "2026-08-19T10:00:00.000Z";

type Row = Record<string, unknown> & { _id: string };

type Predicate = {
  kind: "eq" | "lte";
  field: string;
  value: unknown;
};

type QueryCall = {
  tableName: string;
  indexName: string;
  predicates: Predicate[];
  operations: string[];
  firstId?: string;
};

type IndexRange = {
  eq(field: string, value: unknown): IndexRange;
  lte(field: string, value: unknown): IndexRange;
};

type InternalHandler<Args> = (ctx: unknown, args: Args) => Promise<unknown>;

function internalHandler<Args>(mutation: object, name: string): InternalHandler<Args> {
  const handler: unknown = Reflect.get(mutation, "_handler");
  if (typeof handler !== "function") {
    throw new Error(`${name} must expose a Convex mutation handler.`);
  }
  return async (ctx, args) => Promise.resolve(handler(ctx, args));
}

const submitHandler = submitRoutedEvidenceHandler as unknown as InternalHandler<{
  learnerId: string;
  submissionId: string;
}>;
const producerHandler = internalHandler<{
  userId: string;
  activityId: string;
  submissionData: Record<string, unknown>;
  idempotencyKey: string;
}>(createTopic12TableAverageRateSubmission, "createTopic12TableAverageRateSubmission");

function makeTeacherEvidence(id: string, occurredAt: string, overrides: Partial<Row> = {}): Row {
  return {
    _id: id,
    learnerId: LEARNER_ID,
    nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
    activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "worked_example",
    occurredAt: Date.parse(occurredAt),
    idempotencyKey: `teacher:${id}`,
    createdAt: 1,
    ...overrides,
  };
}

function makeMasteryEvidence(
  id: string,
  attemptOrdinal: number,
  overrides: Partial<Row> = {},
): Row {
  return {
    _id: id,
    learnerId: LEARNER_ID,
    nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
    activityId: PILOT_ACTIVITY_ID,
    attemptOrdinal,
    origin: "mastery_advantage",
    mode: "guided_practice",
    occurredAt: Date.parse(CANDIDATE_OCCURRED_AT) - 1,
    gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
    idempotencyKey: `mastery:${id}`,
    createdAt: 1,
    ...overrides,
  };
}

function makePriorSubmission(attemptOrdinal: number): Row {
  return {
    _id: "activity_submissions:prior-" + attemptOrdinal,
    userId: LEARNER_ID,
    activityId: ACTIVITY_DOCUMENT_ID,
    stableActivityId: PILOT_ACTIVITY_ID,
    attemptOrdinal,
    createdAt: 1,
    updatedAt: 1,
  };
}

async function createPhysicalSubmission(
  ctx: unknown,
  idempotencyKey: string,
): Promise<{ submissionId: string; attemptOrdinal: number }> {
  const selectedOptionId = generateTopic12TableAverageRateChoice(0).correctOptionId;
  const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse(CANDIDATE_OCCURRED_AT));
  try {
    return (await producerHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      idempotencyKey,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PILOT_ACTIVITY_ID,
        mode: "guided_practice",
        status: "submitted",
        attemptNumber: 99,
        submittedAt: CANDIDATE_OCCURRED_AT,
        answers: { selectedOptionId },
        parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
      },
    })) as { submissionId: string; attemptOrdinal: number };
  } finally {
    now.mockRestore();
  }
}

function createBoundedContext({
  evidenceRows = [],
  priorAttemptOrdinal = 0,
}: {
  evidenceRows?: Row[];
  priorAttemptOrdinal?: number;
} = {}) {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: PILOT_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
        displayName: "Topic 1.2 table average-rate guided practice",
        props: { presentationMode: "guided_practice" },
        gradingConfig: PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activity_submissions: priorAttemptOrdinal > 0 ? [makePriorSubmission(priorAttemptOrdinal)] : [],
    learning_evidence: [...evidenceRows],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const calls: QueryCall[] = [];
  const trace: string[] = [];

  const query = (tableName: string) => ({
    withIndex: (indexName: string, configure: (range: IndexRange) => unknown) => {
      const call: QueryCall = {
        tableName,
        indexName,
        predicates: [],
        operations: [],
      };
      const range: IndexRange = {
        eq(field, value) {
          call.predicates.push({ kind: "eq", field, value });
          return range;
        },
        lte(field, value) {
          call.predicates.push({ kind: "lte", field, value });
          return range;
        },
      };
      configure(range);
      calls.push(call);

      const matchingRows = () =>
        (rows[tableName] ?? []).filter((row) =>
          call.predicates.every((predicate) => {
            const rowValue = row[predicate.field];
            const predicateValue = predicate.value;
            if (predicate.kind === "eq") return rowValue === predicateValue;
            return (
              typeof rowValue === "number" &&
              typeof predicateValue === "number" &&
              rowValue <= predicateValue
            );
          }),
        );
      const orderedRows = () => {
        const selected = matchingRows();
        const direction = call.operations.find((operation) => operation.startsWith("order:"));
        if (direction !== "order:desc") return selected;
        const field = indexName.includes("occurred_at")
          ? "occurredAt"
          : indexName.includes("attempt")
            ? "attemptOrdinal"
            : undefined;
        return field
          ? [...selected].sort((left, right) => Number(right[field]) - Number(left[field]))
          : selected;
      };

      const result = {
        unique: async () => {
          call.operations.push("unique");
          return orderedRows()[0] ?? null;
        },
        first: async () => {
          call.operations.push("first");
          const first = orderedRows()[0] ?? null;
          call.firstId = first?._id;
          return first;
        },
        collect: async () => {
          if (tableName === "learning_evidence") {
            throw new Error("Authority reads must not use collect()");
          }
          return orderedRows();
        },
        take: async (limit: number) => {
          if (tableName === "learning_evidence") {
            throw new Error("Authority reads must not use take()");
          }
          return orderedRows().slice(0, limit);
        },
        order: (direction: "asc" | "desc") => {
          call.operations.push(`order:${direction}`);
          return result;
        },
        filter: () => result,
      };
      return result;
    },
  });

  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return (
      Object.values(rows)
        .flat()
        .find((row) => row._id === id) ?? null
    );
  };
  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    trace.push(`${tableName}:insert`);
    return id;
  };
  const patch = async (id: string, document: Record<string, unknown>) => {
    const row = Object.values(rows)
      .flat()
      .find((candidate) => candidate._id === id);
    if (!row) throw new Error(`Unknown patch target: ${id}`);
    Object.assign(row, document);
    trace.push("patch");
  };

  return {
    ctx: { db: { query, get, insert, patch } },
    calls,
    rows,
    trace,
  };
}

function authorityCall(calls: readonly QueryCall[], indexName: string): QueryCall {
  const call = calls.find((candidate) => candidate.indexName === indexName);
  if (!call) throw new Error(`Missing authority query ${indexName}`);
  return call;
}

describe("Precalculus bounded learning-evidence authority reads", () => {
  it("does not let a future or wrong-scope teacher exposure introduce a past mastery submission", async () => {
    const { ctx, calls, rows, trace } = createBoundedContext({
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:future", "2026-08-19T10:01:00.000Z"),
        makeTeacherEvidence("learning_evidence:other-learner", "2026-08-19T09:59:00.000Z", {
          learnerId: OTHER_LEARNER_ID,
        }),
        makeTeacherEvidence("learning_evidence:other-node", "2026-08-19T09:59:00.000Z", {
          nodeId: "math.precalc.skill.other",
        }),
      ],
    });

    const created = await createPhysicalSubmission(ctx, "precalc-bounded-authority-create");
    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        exposureState: "awaiting_teacher_exposure",
        reason: "awaiting_teacher_exposure",
      },
    });
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(trace).toEqual(["activity_submissions:insert"]);
    expect(authorityCall(calls, "by_learner_node_origin_occurred_at")).toStrictEqual({
      tableName: "learning_evidence",
      indexName: "by_learner_node_origin_occurred_at",
      predicates: [
        { kind: "eq", field: "learnerId", value: LEARNER_ID },
        { kind: "eq", field: "nodeId", value: PRECALCULUS_TOPIC_12_NODE_ID },
        { kind: "eq", field: "origin", value: "teacher_led" },
        { kind: "lte", field: "occurredAt", value: Date.parse(CANDIDATE_OCCURRED_AT) },
      ],
      operations: ["order:desc", "first"],
      firstId: undefined,
    });
  });

  it("uses the nearest prior teacher exposure and the highest exact-scope ordinal without a history scan", async () => {
    const { ctx, calls, rows, trace } = createBoundedContext({
      priorAttemptOrdinal: 1001,
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:older-prior", "2026-08-19T09:00:00.000Z"),
        makeTeacherEvidence("learning_evidence:nearest-prior", "2026-08-19T09:59:00.000Z"),
        makeTeacherEvidence("learning_evidence:future", "2026-08-19T10:01:00.000Z"),
        makeTeacherEvidence("learning_evidence:wrong-learner", "2026-08-19T09:59:30.000Z", {
          learnerId: OTHER_LEARNER_ID,
        }),
        makeTeacherEvidence("learning_evidence:wrong-node", "2026-08-19T09:59:30.000Z", {
          nodeId: "math.precalc.skill.other",
        }),
        makeMasteryEvidence("learning_evidence:mastery-1001", 1001),
        makeMasteryEvidence("learning_evidence:wrong-activity-9999", 9999, {
          activityId: "math.precalc.skill.other.guided_practice",
        }),
        makeMasteryEvidence("learning_evidence:older-other-teacher-source", 9998, {
          origin: "teacher_led",
          occurredAt: Date.parse("2026-08-19T09:30:00.000Z"),
        }),
        makeMasteryEvidence("learning_evidence:wrong-node-9997", 9997, {
          nodeId: "math.precalc.skill.other",
        }),
      ],
    });

    const created = await createPhysicalSubmission(ctx, "precalc-bounded-authority-create");
    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: "new",
      decision: { exposureState: "introduced", reason: "eligible" },
    });
    expect(authorityCall(calls, "by_learner_node_origin_occurred_at")).toMatchObject({
      operations: ["order:desc", "first"],
      firstId: "learning_evidence:nearest-prior",
    });
    expect(authorityCall(calls, "by_learner_node_activity_origin_attempt")).toMatchObject({
      operations: ["order:desc", "first"],
      firstId: "learning_evidence:mastery-1001",
    });
    expect(rows.learning_evidence.at(-1)).toMatchObject({
      origin: "mastery_advantage",
      attemptOrdinal: 1002,
    });
    expect(trace).toContain("srs_cards:insert");
    expect(trace).toContain("learning_evidence_receipts:insert");
  });

  it("finds ordinal 1001 from the exact index after more than one thousand rows and rejects a duplicate", async () => {
    const matchingAttempts = Array.from({ length: 1001 }, (_, index) =>
      makeMasteryEvidence(`learning_evidence:mastery-${index + 1}`, index + 1),
    );
    const { ctx, calls, rows, trace } = createBoundedContext({
      priorAttemptOrdinal: 1000,
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:prior", "2026-08-19T09:59:00.000Z"),
        ...matchingAttempts,
        makeMasteryEvidence("learning_evidence:wrong-learner-9999", 9999, {
          learnerId: OTHER_LEARNER_ID,
        }),
        makeMasteryEvidence("learning_evidence:wrong-node-9998", 9998, {
          nodeId: "math.precalc.skill.other",
        }),
      ],
    });

    const created = await createPhysicalSubmission(ctx, "precalc-bounded-authority-create");
    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    expect(result).toStrictEqual({
      accepted: false,
      reason: "attempt_ordinal_conflict",
      latestAttemptOrdinal: 1001,
      receivedAttemptOrdinal: 1001,
    });
    expect(authorityCall(calls, "by_learner_node_activity_origin_attempt")).toMatchObject({
      operations: ["order:desc", "first"],
      firstId: "learning_evidence:mastery-1001",
    });
    expect(rows.learning_evidence).toHaveLength(1004);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(trace).toEqual(["activity_submissions:insert"]);
  });
});
