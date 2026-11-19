import { describe, expect, it } from "vitest";

import { submit as submitLearningEvidence } from "@/convex/learningEvidence";
import { BM2_LEARNING_EVIDENCE_PILOT, BM2_PILOT_NODE } from "@/lib/learning-evidence/bm2-pilot";

const LEARNER_ID = "profiles:bm2-bounded-authority-learner";
const OTHER_LEARNER_ID = "profiles:bm2-bounded-authority-other-learner";
const ACTIVITY_DOCUMENT_ID = "activities:bm2-bounded-authority-source";
const SUBMISSION_ID = "activity_submissions:bm2-bounded-authority-candidate";
const CANDIDATE_OCCURRED_AT = "2026-08-19T10:00:00.000Z";
const [PILOT_MAPPING] = BM2_LEARNING_EVIDENCE_PILOT.mappings;

if (!PILOT_MAPPING) throw new Error("BM2 pilot mapping is required for bounded authority tests.");

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

const submitHandler = internalHandler<{ learnerId: string; submissionId: string }>(
  submitLearningEvidence,
  "submit",
);

function makeTeacherEvidence(id: string, occurredAt: string, overrides: Partial<Row> = {}): Row {
  return {
    _id: id,
    studentId: LEARNER_ID,
    nodeId: BM2_PILOT_NODE,
    activityId: PILOT_MAPPING.source.activityId,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: PILOT_MAPPING.source.mode,
    occurredAt: Date.parse(occurredAt),
    idempotencyKey: `teacher:${id}`,
    contractVersion: "learning-evidence.v1",
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
    studentId: LEARNER_ID,
    nodeId: BM2_PILOT_NODE,
    activityId: PILOT_MAPPING.masteryAdvantage.activityId,
    attemptOrdinal,
    origin: "mastery_advantage",
    mode: "independent_practice",
    occurredAt: Date.parse(CANDIDATE_OCCURRED_AT) - 1,
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: `mastery:${id}`,
    contractVersion: "learning-evidence.v1",
    createdAt: 1,
    ...overrides,
  };
}

function makeStoredSubmission(attemptOrdinal: number): Row {
  return {
    _id: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: ACTIVITY_DOCUMENT_ID,
    stableActivityId: "accounting-equation-7-assets",
    masteryContractVersion: "learning-evidence.v1",
    attemptOrdinal,
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse(CANDIDATE_OCCURRED_AT),
    gradedAt: Date.parse(CANDIDATE_OCCURRED_AT),
    submissionData: {
      contractVersion: "practice.v1",
      activityId: PILOT_MAPPING.masteryAdvantage.activityId,
      mode: "independent_practice",
      status: "graded",
      attemptNumber: 999999,
      submittedAt: "1999-01-01T00:00:00.000Z",
    },
    createdAt: 1,
    updatedAt: 1,
  };
}

function createBoundedContext({
  evidenceRows = [],
  submission = makeStoredSubmission(1),
}: {
  evidenceRows?: Row[];
  submission?: Row;
} = {}) {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: PILOT_MAPPING.source.activityId,
        componentKey: "notebook-organizer",
        displayName: "Unit 1 Lesson 1 source",
        props: {},
        gradingConfig: {},
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activity_submissions: [submission],
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

describe("BM2 bounded learning-evidence authority reads", () => {
  it("does not let a future or wrong-scope teacher exposure introduce a past opaque mastery submission", async () => {
    const { ctx, calls, rows, trace } = createBoundedContext({
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:future", "2026-08-19T10:01:00.000Z"),
        makeTeacherEvidence("learning_evidence:wrong-student", "2026-08-19T09:59:00.000Z", {
          studentId: OTHER_LEARNER_ID,
        }),
        makeTeacherEvidence("learning_evidence:wrong-node", "2026-08-19T09:59:00.000Z", {
          nodeId: "math.bm2.skill.other",
        }),
      ],
    });

    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
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
    expect(trace).toEqual([]);
    expect(authorityCall(calls, "by_student_node_origin_occurred_at")).toStrictEqual({
      tableName: "learning_evidence",
      indexName: "by_student_node_origin_occurred_at",
      predicates: [
        { kind: "eq", field: "studentId", value: LEARNER_ID },
        { kind: "eq", field: "nodeId", value: BM2_PILOT_NODE },
        { kind: "eq", field: "origin", value: "teacher_led" },
        { kind: "lte", field: "occurredAt", value: Date.parse(CANDIDATE_OCCURRED_AT) },
      ],
      operations: ["order:desc", "first"],
      firstId: undefined,
    });
  });

  it("uses the nearest prior teacher exposure and highest exact-scope ordinal for the opaque path", async () => {
    const { ctx, calls, rows, trace } = createBoundedContext({
      submission: makeStoredSubmission(1002),
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:older-prior", "2026-08-19T09:00:00.000Z"),
        makeTeacherEvidence("learning_evidence:nearest-prior", "2026-08-19T09:59:00.000Z"),
        makeTeacherEvidence("learning_evidence:future", "2026-08-19T10:01:00.000Z"),
        makeTeacherEvidence("learning_evidence:wrong-student", "2026-08-19T09:59:30.000Z", {
          studentId: OTHER_LEARNER_ID,
        }),
        makeTeacherEvidence("learning_evidence:wrong-node", "2026-08-19T09:59:30.000Z", {
          nodeId: "math.bm2.skill.other",
        }),
        makeMasteryEvidence("learning_evidence:mastery-1001", 1001),
        makeMasteryEvidence("learning_evidence:wrong-activity-9999", 9999, {
          activityId: "other-accounting-equation",
        }),
        makeMasteryEvidence("learning_evidence:wrong-node-9998", 9998, {
          nodeId: "math.bm2.skill.other",
        }),
      ],
    });

    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: "new",
      decision: { exposureState: "introduced", reason: "eligible" },
    });
    expect(authorityCall(calls, "by_student_node_origin_occurred_at")).toMatchObject({
      operations: ["order:desc", "first"],
      firstId: "learning_evidence:nearest-prior",
    });
    expect(authorityCall(calls, "by_student_node_activity_origin_attempt")).toMatchObject({
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

  it("finds ordinal 1001 from the exact opaque index after more than one thousand rows and rejects a duplicate", async () => {
    const matchingAttempts = Array.from({ length: 1001 }, (_, index) =>
      makeMasteryEvidence(`learning_evidence:mastery-${index + 1}`, index + 1),
    );
    const { ctx, calls, rows, trace } = createBoundedContext({
      submission: makeStoredSubmission(1001),
      evidenceRows: [
        makeTeacherEvidence("learning_evidence:prior", "2026-08-19T09:59:00.000Z"),
        ...matchingAttempts,
        makeMasteryEvidence("learning_evidence:wrong-student-9999", 9999, {
          studentId: OTHER_LEARNER_ID,
        }),
        makeMasteryEvidence("learning_evidence:wrong-node-9998", 9998, {
          nodeId: "math.bm2.skill.other",
        }),
      ],
    });

    const result = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });

    expect(result).toStrictEqual({
      accepted: false,
      reason: "attempt_ordinal_conflict",
      latestAttemptOrdinal: 1001,
      receivedAttemptOrdinal: 1001,
    });
    expect(authorityCall(calls, "by_student_node_activity_origin_attempt")).toMatchObject({
      operations: ["order:desc", "first"],
      firstId: "learning_evidence:mastery-1001",
    });
    expect(rows.learning_evidence).toHaveLength(1004);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(trace).toEqual([]);
  });
});
