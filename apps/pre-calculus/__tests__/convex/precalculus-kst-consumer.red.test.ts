import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import type { QueryCtx } from "@/convex/_generated/server";
import {
  getPrecalculusPhysicalContextKnowledgeStateHandler,
  getPrecalculusPilotKnowledgeStateHandler,
  getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler,
  getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler,
  getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler,
  getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler,
  getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler,
  getPrecalculusTopic12KnowledgeStateHandler,
  getPrecalculusTopic13ConcavityKnowledgeStateHandler,
  getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler,
  getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler,
  getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler,
} from "@/convex/learningEvidence";
import {
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-kst-consumer-learner" as Id<"profiles">;
const NOW = Date.parse("2026-08-21T12:00:00.000Z");
const PILOT_VARIANT_KEY = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const PILOT_INDEPENDENT_VARIANT_KEY = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const PILOT_TITLE = "Identify intervals of increase, decrease, and constant behavior from graphs";
const PHYSICAL_TITLE = "Select a graph that models a physical context";
const TOPIC_12_TITLE = "Compare average rates of change across intervals";
const GRAPH_AVERAGE_RATE_TITLE = "Compute and interpret the average rate of change";
const NEGATIVE_RATE_CONTEXT_TITLE = "Model negative-rate contexts";
const QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE = "Determine negative-rate intervals for quadratics";
const RATE_PATTERN_CLASSIFICATION_TITLE =
  "Classify linear vs quadratic functions from rate-of-change patterns";
const CONCAVITY_TITLE = "Determine concavity from rate-of-change behavior";
const POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE =
  "Identify polynomial degree and leading coefficient";
const POLYNOMIAL_EXTREMA_TITLE = "Identify relative and absolute extrema from graphs";

type Row = Record<string, unknown> & { _id: string };

function createQueryHarness(cards: readonly Row[] = []) {
  const queryEvents: string[] = [];
  const queryConditions: Array<Record<string, unknown>> = [];
  const writes: string[] = [];
  let collectCalls = 0;

  const query = (tableName: string) => ({
    withIndex: (
      indexName: string,
      configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      queryEvents.push(`${tableName}:${indexName}`);
      if (tableName !== "srs_cards" || indexName !== "by_student_and_objective") {
        throw new Error(
          "The Precalculus KST consumer must read the exact pilot card through its native index.",
        );
      }

      const conditions = new Map<string, unknown>();
      const index = {
        eq(field: string, value: unknown) {
          conditions.set(field, value);
          return index;
        },
      };
      configure(index);
      queryConditions.push(Object.fromEntries(conditions));

      return {
        collect: async () => {
          collectCalls += 1;
          return cards.filter((card) =>
            [...conditions].every(([field, value]) => card[field] === value),
          );
        },
      };
    },
  });

  const failWrite = (operation: string) => async () => {
    writes.push(operation);
    throw new Error(`Read-side KST must not ${operation}.`);
  };

  return {
    ctx: {
      db: {
        query,
        insert: failWrite("insert"),
        patch: failWrite("patch"),
        delete: failWrite("delete"),
      },
    } as unknown as QueryCtx,
    queryEvents,
    queryConditions,
    writes,
    get collectCalls() {
      return collectCalls;
    },
  };
}

function makeReviewedPilotCard(): Row {
  return {
    _id: "srs_cards:precalc-pilot",
    studentId: LEARNER_ID,
    objectiveId: PRECALCULUS_PILOT_NODE_ID,
    problemFamilyId: PILOT_VARIANT_KEY,
    stability: 1,
    difficulty: 5,
    state: "review",
    dueDate: "2026-08-22T12:00:00.000Z",
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 1,
    lapses: 0,
    lastReview: "2026-08-21T11:00:00.000Z",
    createdAt: NOW - 60_000,
    updatedAt: NOW - 60_000,
  };
}

function makeTopic12Card(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:topic-12-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makeGraphAverageRateCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:graph-average-rate-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makePointwiseLeastRateCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:pointwise-least-rate-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makePointwiseRateOrderingCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:pointwise-rate-ordering-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makeNegativeRateContextCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:negative-rate-context-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makeQuadraticNegativeRateIntervalCard(
  problemFamilyId: string,
  overrides: Partial<Row> = {},
): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:quadratic-negative-rate-interval-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makeRatePatternClassificationCard(
  problemFamilyId: string,
  overrides: Partial<Row> = {},
): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:rate-pattern-classification-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makeConcavityCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:concavity-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makePolynomialDegreeLeadingCoefficientCard(
  problemFamilyId: string,
  overrides: Partial<Row> = {},
): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:polynomial-degree-leading-coefficient-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

function makePolynomialExtremaCard(problemFamilyId: string, overrides: Partial<Row> = {}): Row {
  return {
    ...makeReviewedPilotCard(),
    _id: `srs_cards:polynomial-extrema-${problemFamilyId.split(".").at(-1) ?? "variant"}`,
    objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
    problemFamilyId,
    ...overrides,
  };
}

describe("getPrecalculusPilotKnowledgeState", () => {
  it("returns the safe not-started projection before Mastery Advantage creates a pilot card", async () => {
    const harness = createQueryHarness();

    await expect(
      getPrecalculusPilotKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      title: PILOT_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("derives the exact safe KST projection from one stored pilot card without writes", async () => {
    const harness = createQueryHarness([
      makeReviewedPilotCard(),
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:precalc-pilot-independent",
        problemFamilyId: PILOT_INDEPENDENT_VARIANT_KEY,
      },
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:precalc-pilot-unrelated",
        problemFamilyId: `${PRECALCULUS_PILOT_NODE_ID}.unrelated_variant`,
      },
    ]);

    const first = await getPrecalculusPilotKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusPilotKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      title: PILOT_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("returns the exact physical node as not started when no allowed physical card exists", async () => {
    const harness = createQueryHarness([
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:physical-unrelated",
        objectiveId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
        problemFamilyId: `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.unrelated_variant`,
      },
    ]);

    await expect(
      getPrecalculusPhysicalContextKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      title: PHYSICAL_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("accepts both physical practice variants and ignores interval and unrelated physical variants", async () => {
    const harness = createQueryHarness([
      makeReviewedPilotCard(),
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:physical-guided",
        objectiveId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
        problemFamilyId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      },
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:physical-independent",
        objectiveId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
        problemFamilyId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      },
      {
        ...makeReviewedPilotCard(),
        _id: "srs_cards:physical-unrelated",
        objectiveId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
        problemFamilyId: `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.unrelated_variant`,
      },
    ]);

    await expect(
      getPrecalculusPhysicalContextKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      title: PHYSICAL_TITLE,
      status: "mastered",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["no card", []],
    ["Worked-only card", [makeTopic12Card(PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID)]],
    ["unrelated family", [makeTopic12Card(`${PRECALCULUS_TOPIC_12_NODE_ID}.unrelated_variant`)]],
    [
      "foreign objective",
      [
        makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID, {
          objectiveId: PRECALCULUS_PILOT_NODE_ID,
        }),
      ],
    ],
    [
      "foreign learner",
      [
        makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID, {
          studentId: "profiles:another-learner",
        }),
      ],
    ],
  ] as const)("returns Topic 1.2 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12KnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      title: TOPIC_12_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("accepts both Topic 1.2 practice variants, ignores other families, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID),
      makeTopic12Card(PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:topic-12-independent",
      }),
      makeTopic12Card(PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:topic-12-worked",
      }),
      makeTopic12Card(`${PRECALCULUS_TOPIC_12_NODE_ID}.unrelated_variant`, {
        _id: "srs_cards:topic-12-unrelated",
      }),
    ]);

    const first = await getPrecalculusTopic12KnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic12KnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      title: TOPIC_12_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["no card", []],
    [
      "graph Worked-only",
      [makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID)],
    ],
    [
      "table Topic 1.2 variants",
      [
        makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID),
        makeTopic12Card(PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID, {
          _id: "srs_cards:table-independent",
        }),
      ],
    ],
    [
      "unrelated graph family",
      [
        makeGraphAverageRateCard(
          `${PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "foreign objective",
      [
        makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID, {
          objectiveId: PRECALCULUS_TOPIC_12_NODE_ID,
        }),
      ],
    ],
    [
      "foreign learner",
      [
        makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID, {
          studentId: "profiles:another-learner",
        }),
      ],
    ],
  ] as const)("returns graph average rate as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      title: GRAPH_AVERAGE_RATE_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("accepts both graph practice variants, ignores other cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeReviewedPilotCard(),
      makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID),
      makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:graph-average-rate-independent",
      }),
      makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:graph-average-rate-worked",
      }),
      makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID, {
        _id: "srs_cards:table-guided-ignored",
      }),
      makeGraphAverageRateCard(
        `${PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:graph-average-rate-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      title: GRAPH_AVERAGE_RATE_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID)],
    ],
    [
      "table Topic 1.2 variants",
      [
        makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID),
        makeTopic12Card(PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID, {
          _id: "srs_cards:table-independent-pointwise-ignored",
        }),
      ],
    ],
    [
      "graph average-rate variants",
      [
        makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID),
        makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID, {
          _id: "srs_cards:graph-independent-pointwise-ignored",
        }),
      ],
    ],
    [
      "unrelated pointwise family",
      [
        makePointwiseLeastRateCard(
          `${PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "foreign objective",
      [
        makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, {
          objectiveId: PRECALCULUS_TOPIC_12_NODE_ID,
        }),
      ],
    ],
    [
      "foreign learner",
      [
        makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, {
          studentId: "profiles:another-learner",
        }),
      ],
    ],
  ] as const)("returns pointwise least-rate as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      title: "Identify the least pointwise rate of change from graphs",
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("accepts both pointwise Guided and Independent cards, ignores other cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeReviewedPilotCard(),
      makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID),
      makePointwiseLeastRateCard(
        PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:pointwise-least-rate-independent",
        },
      ),
      makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:pointwise-least-rate-worked",
      }),
      makePointwiseLeastRateCard(
        `${PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:pointwise-least-rate-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      title: "Identify the least pointwise rate of change from graphs",
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [
        makePointwiseRateOrderingCard(
          PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "least-rate cards",
      [makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID)],
    ],
    ["table cards", [makeTopic12Card(PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID)]],
    [
      "graph average-rate cards",
      [makeGraphAverageRateCard(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID)],
    ],
    [
      "unrelated family",
      [
        makePointwiseRateOrderingCard(
          `${PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "foreign objective",
      [
        makePointwiseRateOrderingCard(
          PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
          {
            objectiveId: PRECALCULUS_TOPIC_12_NODE_ID,
          },
        ),
      ],
    ],
    [
      "foreign learner",
      [
        makePointwiseRateOrderingCard(
          PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
          {
            studentId: "profiles:another-learner",
          },
        ),
      ],
    ],
  ] as const)("returns pointwise ordering as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      title: "Compare pointwise rates of change from graphs",
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("accepts both pointwise ordering practice cards, ignores other cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeReviewedPilotCard(),
      makePointwiseRateOrderingCard(
        PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
      ),
      makePointwiseRateOrderingCard(
        PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:pointwise-rate-ordering-independent",
        },
      ),
      makePointwiseRateOrderingCard(
        PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
        {
          _id: "srs_cards:pointwise-rate-ordering-worked",
        },
      ),
      makePointwiseRateOrderingCard(
        `${PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:pointwise-rate-ordering-unrelated",
        },
      ),
      makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, {
        _id: "srs_cards:pointwise-least-rate-ignored",
      }),
    ]);

    const first = await getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );
    const replay = await getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      title: "Compare pointwise rates of change from graphs",
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [makeNegativeRateContextCard(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID)],
    ],
    [
      "unrelated family",
      [
        makeNegativeRateContextCard(
          `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "foreign node",
      [makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID)],
    ],
  ] as const)("returns Example 4 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      title: NEGATIVE_RATE_CONTEXT_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("returns in progress for one exact Example 4 practice family", async () => {
    const harness = createQueryHarness([
      makeNegativeRateContextCard(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID),
    ]);

    await expect(
      getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      title: NEGATIVE_RATE_CONTEXT_TITLE,
      status: "in_progress",
      readiness: "ready",
    });

    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("uses the query time for live retention on aged exact Example 4 cards", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makeNegativeRateContextCard(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID, {
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
      makeNegativeRateContextCard(
        PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:negative-rate-context-aged-independent",
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
    ]);

    await expect(
      getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      title: NEGATIVE_RATE_CONTEXT_TITLE,
      status: "in_progress",
      readiness: "ready",
    });

    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh Example 4 practice families and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeNegativeRateContextCard(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID),
      makeNegativeRateContextCard(
        PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:negative-rate-context-independent",
        },
      ),
      makeNegativeRateContextCard(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:negative-rate-context-worked",
      }),
      makeNegativeRateContextCard(
        `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:negative-rate-context-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      title: NEGATIVE_RATE_CONTEXT_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });
});

describe("getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState", () => {
  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [
        makeQuadraticNegativeRateIntervalCard(
          PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "unrelated family",
      [
        makeQuadraticNegativeRateIntervalCard(
          `${PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "other node",
      [makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID)],
    ],
    [
      "foreign learner",
      [
        makeQuadraticNegativeRateIntervalCard(
          PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
          {
            studentId: "profiles:another-learner",
          },
        ),
      ],
    ],
  ] as const)("returns Example 5 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      title: QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it("returns in progress for one exact Example 5 practice family", async () => {
    const harness = createQueryHarness([
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
      ),
    ]);

    await expect(
      getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      title: QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      },
    ]);
    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh Example 5 practice families and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
      ),
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:quadratic-negative-rate-interval-independent",
        },
      ),
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
        {
          _id: "srs_cards:quadratic-negative-rate-interval-worked",
        },
      ),
      makeQuadraticNegativeRateIntervalCard(
        `${PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:quadratic-negative-rate-interval-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );
    const replay = await getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      title: QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("uses query time for live retention on aged Example 5 cards", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
        {
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:quadratic-negative-rate-interval-aged-independent",
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
    ]);

    await expect(
      getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      title: QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("uses stored elapsed days when lastReview is invalid", async () => {
    const harness = createQueryHarness([
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
        {
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
      makeQuadraticNegativeRateIntervalCard(
        PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:quadratic-negative-rate-interval-invalid-independent",
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
    ]);

    await expect(
      getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      title: QUADRATIC_NEGATIVE_RATE_INTERVAL_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });
});

describe("getPrecalculusTopic13RatePatternClassificationKnowledgeState", () => {
  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [
        makeRatePatternClassificationCard(
          PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "unrelated family",
      [
        makeRatePatternClassificationCard(
          `${PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "other node",
      [makePointwiseLeastRateCard(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID)],
    ],
    [
      "foreign learner",
      [
        makeRatePatternClassificationCard(
          PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
          {
            studentId: "profiles:another-learner",
          },
        ),
      ],
    ],
  ] as const)("returns Example 1 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      title: RATE_PATTERN_CLASSIFICATION_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["Guided", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID],
    ["Independent", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID],
  ] as const)("returns in progress for one exact %s family", async (_label, problemFamilyId) => {
    const harness = createQueryHarness([makeRatePatternClassificationCard(problemFamilyId)]);

    await expect(
      getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      title: RATE_PATTERN_CLASSIFICATION_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh families, ignores Worked and unrelated cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
      ),
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:rate-pattern-classification-independent",
        },
      ),
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
        {
          _id: "srs_cards:rate-pattern-classification-worked",
        },
      ),
      makeRatePatternClassificationCard(
        `${PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:rate-pattern-classification-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );
    const replay = await getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      title: RATE_PATTERN_CLASSIFICATION_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("uses query time for live retention on aged exact families", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
        {
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:rate-pattern-classification-aged-independent",
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
    ]);

    await expect(
      getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      title: RATE_PATTERN_CLASSIFICATION_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("uses stored elapsed days when lastReview is invalid", async () => {
    const harness = createQueryHarness([
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
        {
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
      makeRatePatternClassificationCard(
        PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:rate-pattern-classification-invalid-independent",
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
    ]);

    await expect(
      getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      title: RATE_PATTERN_CLASSIFICATION_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });
});

describe("getPrecalculusTopic13ConcavityKnowledgeState", () => {
  it.each([
    ["no card", []],
    ["Worked-only card", [makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID)]],
    [
      "unrelated family",
      [makeConcavityCard(`${PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID}.unrelated_variant`)],
    ],
    [
      "other node",
      [
        makeRatePatternClassificationCard(
          PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "foreign learner",
      [
        makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID, {
          studentId: "profiles:another-learner",
        }),
      ],
    ],
  ] as const)("returns Example 2 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      title: CONCAVITY_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["Guided", PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID],
    ["Independent", PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID],
  ] as const)("returns in progress for one exact %s family", async (_label, problemFamilyId) => {
    const harness = createQueryHarness([makeConcavityCard(problemFamilyId)]);

    await expect(
      getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      title: CONCAVITY_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh families, ignores Worked and unrelated cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID),
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:concavity-independent",
      }),
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:concavity-worked",
      }),
      makeConcavityCard(`${PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID}.unrelated_variant`, {
        _id: "srs_cards:concavity-unrelated",
      }),
    ]);

    const first = await getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      title: CONCAVITY_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("uses query time for live retention on aged exact families", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID, {
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:concavity-aged-independent",
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
    ]);

    await expect(
      getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      title: CONCAVITY_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("uses stored elapsed days when lastReview is invalid", async () => {
    const harness = createQueryHarness([
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID, {
        elapsedDays: 0,
        lastReview: "not-a-valid-review-time",
      }),
      makeConcavityCard(PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:concavity-invalid-independent",
        elapsedDays: 0,
        lastReview: "not-a-valid-review-time",
      }),
    ]);

    await expect(
      getPrecalculusTopic13ConcavityKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      title: CONCAVITY_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });
});

describe("getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState", () => {
  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [
        makePolynomialDegreeLeadingCoefficientCard(
          `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.worked_example`,
        ),
      ],
    ],
    [
      "unrelated family",
      [
        makePolynomialDegreeLeadingCoefficientCard(
          `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "other node",
      [
        makeRatePatternClassificationCard(
          PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "foreign learner",
      [
        makePolynomialDegreeLeadingCoefficientCard(
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
          {
            studentId: "profiles:another-learner",
          },
        ),
      ],
    ],
  ] as const)("returns Topic 1.4 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      title: POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["Guided", PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID],
    [
      "Independent",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
    ],
  ] as const)("returns in progress for one exact %s family", async (_label, problemFamilyId) => {
    const harness = createQueryHarness([
      makePolynomialDegreeLeadingCoefficientCard(problemFamilyId),
    ]);

    const result = await getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(result).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      title: POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(Object.keys(result).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh families, ignores Worked and unrelated cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      ),
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:polynomial-degree-leading-coefficient-independent",
        },
      ),
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
        {
          _id: "srs_cards:polynomial-degree-leading-coefficient-worked",
        },
      ),
      makePolynomialDegreeLeadingCoefficientCard(
        `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:polynomial-degree-leading-coefficient-unrelated",
        },
      ),
    ]);

    const first = await getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );
    const replay = await getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(
      harness.ctx,
      {
        learnerId: LEARNER_ID,
        now: NOW,
      },
    );

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      title: POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("uses query time for live retention on aged exact families", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
        {
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:polynomial-degree-leading-coefficient-aged-independent",
          stability: 1,
          elapsedDays: 0,
          lastReview: oldReview,
        },
      ),
    ]);

    await expect(
      getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      title: POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("uses stored elapsed days when lastReview is invalid", async () => {
    const harness = createQueryHarness([
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
        {
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
      makePolynomialDegreeLeadingCoefficientCard(
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
        {
          _id: "srs_cards:polynomial-degree-leading-coefficient-invalid-independent",
          elapsedDays: 0,
          lastReview: "not-a-valid-review-time",
        },
      ),
    ]);

    await expect(
      getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      title: POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });
});

describe("getPrecalculusTopic14PolynomialExtremaKnowledgeState", () => {
  it("uses the exact enabled node once and projects only the bounded state shape", () => {
    expect(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      ),
    ).toEqual([PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID]);
  });

  it.each([
    ["no card", []],
    [
      "Worked-only card",
      [makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID)],
    ],
    [
      "unrelated family",
      [
        makePolynomialExtremaCard(
          `${PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID}.unrelated_variant`,
        ),
      ],
    ],
    [
      "other node",
      [
        makePolynomialDegreeLeadingCoefficientCard(
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
        ),
      ],
    ],
    [
      "foreign learner",
      [
        makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID, {
          studentId: "profiles:another-learner",
        }),
      ],
    ],
  ] as const)("returns Topic 1.4 Example 2 as not started for %s", async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(
      getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      title: POLYNOMIAL_EXTREMA_TITLE,
      status: "not_started",
      readiness: "ready",
    });

    expect(harness.queryEvents).toEqual(["srs_cards:by_student_and_objective"]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(1);
    expect(harness.writes).toEqual([]);
  });

  it.each([
    ["Guided", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID],
    ["Independent", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID],
  ] as const)("returns in progress for one exact %s family", async (_label, problemFamilyId) => {
    const harness = createQueryHarness([makePolynomialExtremaCard(problemFamilyId)]);

    const result = await getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(result).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      title: POLYNOMIAL_EXTREMA_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(Object.keys(result).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.writes).toEqual([]);
  });

  it("returns mastered for both exact fresh families, ignores Worked and unrelated cards, and is replay-stable", async () => {
    const harness = createQueryHarness([
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID),
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:polynomial-extrema-independent",
      }),
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID, {
        _id: "srs_cards:polynomial-extrema-worked",
      }),
      makePolynomialExtremaCard(
        `${PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID}.unrelated_variant`,
        {
          _id: "srs_cards:polynomial-extrema-unrelated",
        },
      ),
    ]);

    const first = await getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      title: POLYNOMIAL_EXTREMA_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(replay).toStrictEqual(first);
    expect(Object.keys(first).sort()).toEqual(["nodeId", "readiness", "status", "title"]);
    expect(harness.queryEvents).toEqual([
      "srs_cards:by_student_and_objective",
      "srs_cards:by_student_and_objective",
    ]);
    expect(harness.queryConditions).toEqual([
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      },
      {
        studentId: LEARNER_ID,
        objectiveId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      },
    ]);
    expect(harness.collectCalls).toBe(2);
    expect(harness.writes).toEqual([]);
  });

  it("uses query time for live retention on aged exact families", async () => {
    const oldReview = "2025-08-21T12:00:00.000Z";
    const harness = createQueryHarness([
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID, {
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:polynomial-extrema-aged-independent",
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
    ]);

    await expect(
      getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      title: POLYNOMIAL_EXTREMA_TITLE,
      status: "in_progress",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });

  it("uses stored elapsed days when lastReview is invalid", async () => {
    const harness = createQueryHarness([
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID, {
        elapsedDays: 0,
        lastReview: "not-a-valid-review-time",
      }),
      makePolynomialExtremaCard(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID, {
        _id: "srs_cards:polynomial-extrema-invalid-independent",
        elapsedDays: 0,
        lastReview: "not-a-valid-review-time",
      }),
    ]);

    await expect(
      getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(harness.ctx, {
        learnerId: LEARNER_ID,
        now: NOW,
      }),
    ).resolves.toStrictEqual({
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      title: POLYNOMIAL_EXTREMA_TITLE,
      status: "mastered",
      readiness: "ready",
    });
    expect(harness.writes).toEqual([]);
  });
});

it("can master the two available interval variants and decays with elapsed time", async () => {
  const cards = [PILOT_VARIANT_KEY, PILOT_INDEPENDENT_VARIANT_KEY].map(
    (problemFamilyId, index) => ({
      ...makeReviewedPilotCard(),
      _id: `card-${index}`,
      problemFamilyId,
      stability: 30,
      reps: 20,
      elapsedDays: 0,
    }),
  );
  const harness = createQueryHarness(cards);
  const fresh = await getPrecalculusPilotKnowledgeStateHandler(harness.ctx, {
    learnerId: LEARNER_ID,
    now: NOW,
  });
  expect(fresh.status).toBe("mastered");
  const stale = await getPrecalculusPilotKnowledgeStateHandler(harness.ctx, {
    learnerId: LEARNER_ID,
    now: NOW + 365 * 86400000,
  });
  expect(stale.status).not.toBe("mastered");
});
