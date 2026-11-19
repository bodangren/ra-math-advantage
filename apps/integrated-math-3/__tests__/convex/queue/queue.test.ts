import { describe, it, expect, vi } from "vitest";
import { getDailyPracticeQueueHandler, resolveDailyPracticeQueue } from "@/convex/queue/queue";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3PilotSeedDocuments,
} from "@/convex/seed/seed_lesson_1_1";
import type { Id } from "@/convex/_generated/dataModel";
import type { SrsCardState } from "@math-platform/srs-engine";
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
} from "@/lib/practice/learning-evidence-pilot";

function makeMockCtx(
  overrides: {
    cards?: SrsCardState[];
    policies?: Array<{
      _id: Id<"objective_policies">;
      standardId: Id<"competency_standards">;
      policy: string;
      courseKey: string;
      priority: number;
    }>;
    standards?: Record<string, { _id: Id<"competency_standards">; code: string }>;
    practiceItems?: Array<{
      _id: Id<"practice_items">;
      variantKey: string;
      activityId: Id<"activities">;
      practiceItemId: string;
      variantLabel: string;
    }>;
    activities?: Record<
      string,
      {
        _id: Id<"activities">;
        componentKey: string;
        props: Record<string, unknown>;
        displayName: string;
        stableActivityId?: string;
        masteryNodeId?: string;
        srsEligible?: boolean;
        approval?: { status: string };
      }
    >;
    teacherExposure?: boolean;
  } = {},
) {
  const {
    cards = [],
    policies = [],
    standards = {},
    practiceItems = [],
    activities = {},
    teacherExposure = false,
  } = overrides;

  const cardQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(
        cards.map((card) => ({
          _id: card.cardId as Id<"srs_cards">,
          studentId: card.studentId as Id<"profiles">,
          objectiveId: card.objectiveId,
          variantKey: card.variantKey,
          stability: card.stability,
          difficulty: card.difficulty,
          state: card.state,
          dueDate: card.dueDate,
          elapsedDays: card.elapsedDays,
          scheduledDays: card.scheduledDays,
          reps: card.reps,
          lapses: card.lapses,
          lastReview: card.lastReview ?? undefined,
          createdAt: new Date(card.createdAt).getTime(),
          updatedAt: new Date(card.updatedAt).getTime(),
        })),
      ),
      take: vi.fn().mockImplementation((n: number) => {
        const mapped = cards.map((card) => ({
          _id: card.cardId as Id<"srs_cards">,
          studentId: card.studentId as Id<"profiles">,
          objectiveId: card.objectiveId,
          variantKey: card.variantKey,
          stability: card.stability,
          difficulty: card.difficulty,
          state: card.state,
          dueDate: card.dueDate,
          elapsedDays: card.elapsedDays,
          scheduledDays: card.scheduledDays,
          reps: card.reps,
          lapses: card.lapses,
          lastReview: card.lastReview ?? undefined,
          createdAt: new Date(card.createdAt).getTime(),
          updatedAt: new Date(card.updatedAt).getTime(),
        }));
        return Promise.resolve(mapped.slice(0, n));
      }),
    }),
  };

  const policyQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(policies),
      take: vi.fn().mockResolvedValue(policies),
    }),
  };

  const practiceItemFirstQueries: string[] = [];
  const practiceItemCollectQueries: string[] = [];
  const practiceItemQueryMock = {
    withIndex: vi
      .fn()
      .mockImplementation(
        (
          _indexName: string,
          fn: (q: { eq: (field: string, value: string) => unknown }) => void,
        ) => {
          let capturedVariantKey: string | null = null;
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === "variantKey") {
                capturedVariantKey = value;
              }
              return {};
            }),
          };
          fn(mockQ);
          return {
            collect: vi.fn().mockImplementation(() => {
              if (capturedVariantKey !== null) {
                practiceItemCollectQueries.push(capturedVariantKey);
              }
              return Promise.resolve(
                practiceItems.filter((item) => item.variantKey === capturedVariantKey),
              );
            }),
            first: vi.fn().mockImplementation(() => {
              if (capturedVariantKey !== null) {
                practiceItemFirstQueries.push(capturedVariantKey);
              }
              const found = practiceItems.find((item) => item.variantKey === capturedVariantKey);
              return Promise.resolve(found ?? null);
            }),
            take: vi
              .fn()
              .mockImplementation((limit: number) =>
                Promise.resolve(
                  practiceItems
                    .filter((item) => item.variantKey === capturedVariantKey)
                    .slice(0, limit),
                ),
              ),
          };
        },
      ),
  };

  const mockGet = vi
    .fn()
    .mockImplementation((id: Id<"competency_standards"> | Id<"activities">) => {
      if (id in standards) return Promise.resolve(standards[id] ?? null);
      if (id in activities) return Promise.resolve(activities[id] ?? null);
      return Promise.resolve(null);
    });

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === "srs_cards") return cardQueryMock;
    if (tableName === "objective_policies") return policyQueryMock;
    if (tableName === "practice_items") return practiceItemQueryMock;
    if (tableName === "learning_evidence") {
      return {
        withIndex: vi.fn().mockReturnValue({
          take: vi.fn().mockResolvedValue(teacherExposure ? [{ origin: "teacher_led" }] : []),
        }),
      };
    }
    return { withIndex: vi.fn().mockReturnValue({ collect: vi.fn().mockResolvedValue([]) }) };
  });

  return {
    db: {
      query: mockQuery,
      get: mockGet,
    },
    cardQueryMock,
    policyQueryMock,
    practiceItemQueryMock,
    practiceItemFirstQueries,
    practiceItemCollectQueries,
    mockGet,
  };
}

const baseCard: SrsCardState = {
  cardId: "card-1",
  studentId: "student-1",
  objectiveId: "HSA-SSE.B.3",
  variantKey: "m1-qf-factoring-1",
  stability: 0,
  difficulty: 0,
  state: "new",
  dueDate: new Date().toISOString(),
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReview: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStudentId = "student-1" as Id<"profiles">;

describe("getDailyPracticeQueueHandler", () => {
  it("returns empty queue for student with no cards", async () => {
    const { db } = makeMockCtx({ cards: [] });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toEqual([]);
  });

  it("returns ordered queue items for a student with cards", async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: "card-1", state: "new", objectiveId: "HSA-SSE.B.3" },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-qf-factoring-1",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toHaveLength(1);
    expect(result[0].card.cardId).toBe("card-1");
    expect(result[0].card.variantKey).toBe("m1-qf-factoring-1");
    expect(result[0].objectivePriority).toBe("essential");
    expect(result[0].isOverdue).toBe(false);
  });

  it("joins card data with objective policy from competency_standards", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
      {
        ...baseCard,
        cardId: "card-2",
        variantKey: "m1-family-b",
        state: "review",
        dueDate: "2024-01-01T00:00:00.000Z",
        objectiveId: "HSA-REI.B.4",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
      {
        _id: "policy-2" as Id<"objective_policies">,
        standardId: "std-2" as Id<"competency_standards">,
        policy: "supporting",
        courseKey: "integrated-math-3",
        priority: 2,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
      "std-2": { _id: "std-2" as Id<"competency_standards">, code: "HSA-REI.B.4" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-a",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
      {
        _id: "pi-2" as Id<"practice_items">,
        variantKey: "m1-family-b",
        activityId: "act-2" as Id<"activities">,
        practiceItemId: "pi-b",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
      "act-2": {
        _id: "act-2" as Id<"activities">,
        componentKey: "graphing-explorer",
        props: { problemType: "graphing" },
        displayName: "Graphing Practice",
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: "2024-01-15T00:00:00.000Z" },
    );

    expect(result).toHaveLength(2);
    const newItem = result.find(
      (r: { card: { variantKey: string } }) => r.card.variantKey === "m1-family-a",
    );
    const reviewItem = result.find(
      (r: { card: { variantKey: string } }) => r.card.variantKey === "m1-family-b",
    );
    expect(newItem?.objectivePriority).toBe("essential");
    expect(reviewItem?.objectivePriority).toBe("supporting");
    expect(reviewItem?.isOverdue).toBe(true);
  });

  it("calls buildDailyQueue with correct arguments", async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: "card-1", state: "new", objectiveId: "HSA-SSE.B.3" },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-qf-factoring-1",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
    };

    const { db, cardQueryMock, policyQueryMock } = makeMockCtx({
      cards,
      policies,
      standards,
      practiceItems,
      activities,
    });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: "2024-01-15T00:00:00.000Z" },
    );

    expect(cardQueryMock.withIndex).toHaveBeenCalledWith("by_student", expect.any(Function));
    expect(policyQueryMock.withIndex).toHaveBeenCalledWith("by_courseKey", expect.any(Function));
  });
});

describe("getDailyPracticeQueueHandler - Phase 2: Queue Item Resolution", () => {
  it("resolves queue item to practice activity with componentKey and props", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-a",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring", difficulty: "easy" },
        displayName: "Factoring Practice",
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("componentKey", "step-by-step-solver");
    expect(result[0]).toHaveProperty("props");
    expect(result[0].props).toEqual({
      problemType: "factoring",
      difficulty: "easy",
      activityId: "act-1",
    });
  });

  it("keeps one exact pilot offer after its first review and injects its immutable DB activity ID", async () => {
    const pilotStableActivityId = IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
    const pilotNodeId = IM3_PILOT_NODE;
    const seededPilotActivity = buildIm3PilotSeedDocuments(
      "pilot-activity-document-1" as never,
      0,
    ).activity;
    const activityProps = seededPilotActivity.props;
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "pilot-card-1",
        variantKey: pilotStableActivityId,
        state: "review",
        objectiveId: pilotNodeId,
        reps: 1,
        elapsedDays: 1,
        scheduledDays: 1,
        lastReview: "2026-08-18T12:00:00.000Z",
      },
    ];
    const policies = [
      {
        _id: "pilot-policy-1" as Id<"objective_policies">,
        standardId: "pilot-standard-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "pilot-standard-1": {
        _id: "pilot-standard-1" as Id<"competency_standards">,
        code: pilotNodeId,
      },
    };
    const practiceItems = [
      {
        _id: "pilot-practice-item-1" as Id<"practice_items">,
        variantKey: pilotStableActivityId,
        activityId: "pilot-activity-document-1" as Id<"activities">,
        practiceItemId: "pilot-practice-item",
        variantLabel: "Pilot",
      },
    ];
    const activities = {
      "pilot-activity-document-1": {
        _id: "pilot-activity-document-1" as Id<"activities">,
        ...seededPilotActivity,
        srsEligible: true,
        approval: { status: "approved" },
        displayName: "Graph Quadratic Functions",
      },
    };

    const { db } = makeMockCtx({
      cards,
      policies,
      standards,
      practiceItems,
      activities,
      teacherExposure: true,
    });

    const result = await resolveDailyPracticeQueue(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
      {
        nodes: [{ id: pilotNodeId, kind: "skill", reviewStatus: "approved" }],
        blueprints: [{ nodeId: pilotNodeId, reviewStatus: "approved" }],
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.card).toMatchObject({
      variantKey: pilotStableActivityId,
      state: "review",
      reps: 1,
    });
    expect(result[0]?.props).toEqual({
      ...activityProps,
      activityId: "pilot-activity-document-1",
      stableActivityId: pilotStableActivityId,
      masteryNodeId: pilotNodeId,
      srsEligible: true,
      practiceMode: "independent_practice",
    });
    expect(activityProps).toEqual({
      equation: "y = -x^2 - 1",
      variant: "plot_from_equation",
      responseVariant: "table_graph",
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(result[0]?.props).not.toHaveProperty("answerSchema");
    expect(result[0]?.props).not.toHaveProperty("vertex_x");
    expect(result[0]?.props).not.toHaveProperty("vertex_y");
    expect(result[0]?.props).not.toHaveProperty("direction");
    expect(result[0]?.props).not.toHaveProperty("y_intercept");
  });

  it("excludes a selected-node card that points to a generic activity", async () => {
    const { db } = makeMockCtx({
      cards: [{ ...baseCard, objectiveId: IM3_PILOT_NODE, variantKey: "generic-family" }],
      policies: [
        {
          _id: "policy" as Id<"objective_policies">,
          standardId: "standard" as Id<"competency_standards">,
          policy: "essential",
          courseKey: "integrated-math-3",
          priority: 1,
        },
      ],
      standards: {
        standard: { _id: "standard" as Id<"competency_standards">, code: IM3_PILOT_NODE },
      },
      practiceItems: [
        {
          _id: "item" as Id<"practice_items">,
          variantKey: "generic-family",
          activityId: "activity" as Id<"activities">,
          practiceItemId: "item",
          variantLabel: "Generic",
        },
      ],
      activities: {
        activity: {
          _id: "activity" as Id<"activities">,
          componentKey: "comprehension-quiz",
          props: {},
          displayName: "Generic",
        },
      },
    });
    const result = await resolveDailyPracticeQueue(
      { db } as never,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
      {
        nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
        blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
      },
    );
    expect(result).toEqual([]);
  });

  it("excludes a generic card whose activity claims the selected node", async () => {
    const { db } = makeMockCtx({
      cards: [{ ...baseCard, objectiveId: "HSA-SSE.B.3", variantKey: "generic-family" }],
      policies: [
        {
          _id: "policy" as Id<"objective_policies">,
          standardId: "standard" as Id<"competency_standards">,
          policy: "essential",
          courseKey: "integrated-math-3",
          priority: 1,
        },
      ],
      standards: {
        standard: { _id: "standard" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
      },
      practiceItems: [
        {
          _id: "item" as Id<"practice_items">,
          variantKey: "generic-family",
          activityId: "activity" as Id<"activities">,
          practiceItemId: "item",
          variantLabel: "Generic",
        },
      ],
      activities: {
        activity: {
          _id: "activity" as Id<"activities">,
          componentKey: "comprehension-quiz",
          props: {},
          displayName: "Generic",
          masteryNodeId: IM3_PILOT_NODE,
        },
      },
    });
    const result = await resolveDailyPracticeQueue(
      { db } as never,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
      {
        nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
        blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
      },
    );
    expect(result).toEqual([]);
  });

  it("does not exempt a malformed seed-2 claim from the selected-node guard", async () => {
    const { db } = makeMockCtx({
      cards: [
        {
          ...baseCard,
          objectiveId: IM3_PILOT_NODE,
          variantKey: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        },
      ],
      policies: [
        {
          _id: "policy" as Id<"objective_policies">,
          standardId: "standard" as Id<"competency_standards">,
          policy: "essential",
          courseKey: "integrated-math-3",
          priority: 1,
        },
      ],
      standards: {
        standard: { _id: "standard" as Id<"competency_standards">, code: IM3_PILOT_NODE },
      },
      practiceItems: [
        {
          _id: "item" as Id<"practice_items">,
          variantKey: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
          activityId: "activity" as Id<"activities">,
          practiceItemId: "item",
          variantLabel: "Seed 2",
        },
      ],
      activities: {
        activity: {
          _id: "activity" as Id<"activities">,
          componentKey: "graphing-explorer",
          props: {},
          displayName: "Malformed",
          stableActivityId: "generic-family",
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: true,
        },
      },
    });
    const result = await resolveDailyPracticeQueue(
      { db } as never,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
      {
        nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
        blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
      },
    );
    expect(result).toEqual([]);
  });

  it.each(["props", "grading"] as const)("excludes changed selected %s", async (changedField) => {
    const generated = buildIm3GuidedPilotSeedDocuments("activity" as never, 1).activity;
    const changed =
      changedField === "props"
        ? { ...generated, props: { ...generated.props, equation: "y = x^2" } }
        : { ...generated, gradingConfig: { ...generated.gradingConfig, passingScore: 1 } };
    const { db } = makeMockCtx({
      cards: [
        { ...baseCard, objectiveId: IM3_PILOT_NODE, variantKey: IM3_GUIDED_PRACTICE_ACTIVITY_ID },
      ],
      policies: [
        {
          _id: "policy" as Id<"objective_policies">,
          standardId: "standard" as Id<"competency_standards">,
          policy: "essential",
          courseKey: "integrated-math-3",
          priority: 1,
        },
      ],
      standards: {
        standard: { _id: "standard" as Id<"competency_standards">, code: IM3_PILOT_NODE },
      },
      practiceItems: [
        {
          _id: "item" as Id<"practice_items">,
          variantKey: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
          activityId: "activity" as Id<"activities">,
          practiceItemId: "item",
          variantLabel: "Guided",
        },
      ],
      activities: {
        activity: {
          _id: "activity" as Id<"activities">,
          ...changed,
          approval: { status: "approved" },
          srsEligible: true,
        },
      },
      teacherExposure: true,
    });
    const result = await resolveDailyPracticeQueue(
      { db } as never,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
      {
        nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
        blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
      },
    );
    expect(result).toEqual([]);
  });

  it("skips card when no practice item exists for its problem family", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-no-practice-item",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems: Array<{
      _id: Id<"practice_items">;
      variantKey: string;
      activityId: Id<"activities">;
      practiceItemId: string;
      variantLabel: string;
    }> = [];
    const activities = {};

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toHaveLength(0);
  });

  it("skips card gracefully when practice item has no activity", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-no-activity",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-no-activity",
        activityId: "act-nonexistent" as Id<"activities">,
        practiceItemId: "pi-no-act",
        variantLabel: "variant-1",
      },
    ];
    const activities = {};

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toHaveLength(0);
  });

  it("presents due reviews before new cards after resolving activities", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
      {
        ...baseCard,
        cardId: "card-2",
        variantKey: "m1-family-b",
        state: "review",
        dueDate: "2024-01-01T00:00:00.000Z",
        objectiveId: "HSA-REI.B.4",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "supporting",
        courseKey: "integrated-math-3",
        priority: 1,
      },
      {
        _id: "policy-2" as Id<"objective_policies">,
        standardId: "std-2" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
      "std-2": { _id: "std-2" as Id<"competency_standards">, code: "HSA-REI.B.4" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-a",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
      {
        _id: "pi-2" as Id<"practice_items">,
        variantKey: "m1-family-b",
        activityId: "act-2" as Id<"activities">,
        practiceItemId: "pi-b",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring",
      },
      "act-2": {
        _id: "act-2" as Id<"activities">,
        componentKey: "graphing-explorer",
        props: { problemType: "quadratic" },
        displayName: "Graphing",
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: "2024-01-15T00:00:00.000Z" },
    );

    expect(result).toHaveLength(2);
    expect(result[0].componentKey).toBe("graphing-explorer");
    expect(result[1].componentKey).toBe("step-by-step-solver");
    expect(result[0].props).toEqual({ problemType: "quadratic", activityId: "act-2" });
    expect(result[1].props).toEqual({ problemType: "factoring", activityId: "act-1" });
  });
});

describe("getDailyPracticeQueueHandler - batch resolution performance", () => {
  it("batches standard lookups instead of one per policy record", async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: "card-1", state: "new", objectiveId: "HSA-SSE.B.3" },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
      {
        _id: "policy-2" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
      {
        _id: "policy-3" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-qf-factoring-1",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
    };

    const { db, mockGet } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    const standardGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith("std-"),
    );
    expect(standardGetCalls).toHaveLength(1);
  });

  it("batches queue lookups by unique problem family plus one fixed pilot-candidate check", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
      {
        ...baseCard,
        cardId: "card-2",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
      {
        ...baseCard,
        cardId: "card-3",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-a",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
    };

    const { db, practiceItemFirstQueries, practiceItemCollectQueries, mockGet } = makeMockCtx({
      cards,
      policies,
      standards,
      practiceItems,
      activities,
    });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(practiceItemFirstQueries).toEqual(["m1-family-a"]);
    expect(practiceItemCollectQueries.every((key) => key === IM3_PILOT_VARIANT_KEY)).toBe(true);

    const activityGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith("act-"),
    );
    expect(activityGetCalls).toHaveLength(1);
  });

  it("resolves multiple unique problem families in parallel", async () => {
    const cards: SrsCardState[] = [
      {
        ...baseCard,
        cardId: "card-1",
        variantKey: "m1-family-a",
        state: "new",
        objectiveId: "HSA-SSE.B.3",
      },
      {
        ...baseCard,
        cardId: "card-2",
        variantKey: "m1-family-b",
        state: "new",
        objectiveId: "HSA-REI.B.4",
      },
      {
        ...baseCard,
        cardId: "card-3",
        variantKey: "m1-family-c",
        state: "new",
        objectiveId: "HSA-REI.B.4",
      },
    ];
    const policies = [
      {
        _id: "policy-1" as Id<"objective_policies">,
        standardId: "std-1" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
      {
        _id: "policy-2" as Id<"objective_policies">,
        standardId: "std-2" as Id<"competency_standards">,
        policy: "essential",
        courseKey: "integrated-math-3",
        priority: 1,
      },
    ];
    const standards = {
      "std-1": { _id: "std-1" as Id<"competency_standards">, code: "HSA-SSE.B.3" },
      "std-2": { _id: "std-2" as Id<"competency_standards">, code: "HSA-REI.B.4" },
    };
    const practiceItems = [
      {
        _id: "pi-1" as Id<"practice_items">,
        variantKey: "m1-family-a",
        activityId: "act-1" as Id<"activities">,
        practiceItemId: "pi-a",
        variantLabel: "variant-1",
      },
      {
        _id: "pi-2" as Id<"practice_items">,
        variantKey: "m1-family-b",
        activityId: "act-2" as Id<"activities">,
        practiceItemId: "pi-b",
        variantLabel: "variant-1",
      },
      {
        _id: "pi-3" as Id<"practice_items">,
        variantKey: "m1-family-c",
        activityId: "act-3" as Id<"activities">,
        practiceItemId: "pi-c",
        variantLabel: "variant-1",
      },
    ];
    const activities = {
      "act-1": {
        _id: "act-1" as Id<"activities">,
        componentKey: "step-by-step-solver",
        props: { problemType: "factoring" },
        displayName: "Factoring Practice",
      },
      "act-2": {
        _id: "act-2" as Id<"activities">,
        componentKey: "graphing-explorer",
        props: { problemType: "quadratic" },
        displayName: "Graphing Practice",
      },
      "act-3": {
        _id: "act-3" as Id<"activities">,
        componentKey: "comprehension-quiz",
        props: { topic: "sampling" },
        displayName: "Comprehension Quiz",
      },
    };

    const { db, practiceItemFirstQueries, practiceItemCollectQueries, mockGet } = makeMockCtx({
      cards,
      policies,
      standards,
      practiceItems,
      activities,
    });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import("@/convex/_generated/server").QueryCtx,
      { studentId: mockStudentId, asOfDate: new Date().toISOString() },
    );

    expect(result).toHaveLength(3);

    expect(practiceItemFirstQueries).toEqual(["m1-family-a", "m1-family-b", "m1-family-c"]);
    expect(practiceItemCollectQueries.every((key) => key === IM3_PILOT_VARIANT_KEY)).toBe(true);

    const activityGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith("act-"),
    );
    expect(activityGetCalls).toHaveLength(3);
    expect(new Set(activityGetCalls.map((call) => String(call[0])))).toEqual(
      new Set(["act-1", "act-2", "act-3"]),
    );
  });
});
