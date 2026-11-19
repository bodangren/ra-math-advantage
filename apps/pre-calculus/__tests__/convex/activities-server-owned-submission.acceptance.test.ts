import { describe, expect, it, vi } from "vitest";

vi.mock("@/curriculum/skill-graph/nodes.json", async (importOriginal) => {
  const source = await importOriginal<{ default: { nodes: Array<Record<string, unknown>> } }>();
  return {
    default: {
      ...source.default,
      nodes: source.default.nodes.map((node) =>
        node.id === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
          ? { ...node, kind: "skill", reviewStatus: "approved" }
          : node,
      ),
    },
  };
});
vi.mock("@/curriculum/skill-graph/blueprints.json", async (importOriginal) => {
  const source = await importOriginal<{
    default: { blueprints: Array<Record<string, unknown>> };
  }>();
  return {
    default: {
      ...source.default,
      blueprints: source.default.blueprints.map((blueprint) =>
        blueprint.nodeId ===
        "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
          ? { ...blueprint, reviewStatus: "approved" }
          : blueprint,
      ),
    },
  };
});
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import {
  PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";
import { generateTopic11PhysicalContextGraphChoice } from "@math-platform/math-content/knowledge-space";
import { gradeTopic11PhysicalContextGraphChoice } from "@/lib/practice/topic11-physical-context-graph-choice";
import { generateTopic12TableAverageRateChoice } from "@math-platform/math-content/knowledge-space";
import { generateTopic12GraphAverageRateChoice } from "@math-platform/math-content/knowledge-space";

const LEARNER_ID = "profiles:precalc-server-owned-student";
const PILOT_STABLE_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const INDEPENDENT_STABLE_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const PILOT_ACTIVITY_DOCUMENT_ID = "activities:precalc-server-owned-pilot";
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = "activities:precalc-server-owned-independent";
const LONG_OPAQUE_KEY = `opaque-key-${"x".repeat(245)}`;

type Row = Record<string, unknown> & { _id: string };

type ServerOwnedSubmissionHandler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    idempotencyKey: string;
  },
) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  attemptOrdinal: number;
}>;

type PhysicalWorkedSubmissionHandler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    idempotencyKey: string;
  },
) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;

type Topic12WorkedSubmissionHandler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    idempotencyKey: string;
  },
) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;

async function loadHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createServerOwnedSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error(
      "AP Precalculus must export internal createServerOwnedSubmission for the public pilot producer. " +
        `Available exports: ${Object.keys(importedModule).sort().join(", ") || "(none)"}.`,
    );
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error(
      "AP Precalculus createServerOwnedSubmission must expose a Convex mutation handler.",
    );
  }
  return handler as ServerOwnedSubmissionHandler;
}

async function loadPhysicalHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createPhysicalContextSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error(
      "AP Precalculus must export internal createPhysicalContextSubmission for physical graph-choice submissions. " +
        `Available exports: ${Object.keys(importedModule).sort().join(", ") || "(none)"}.`,
    );
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error(
      "AP Precalculus createPhysicalContextSubmission must expose a Convex mutation handler.",
    );
  }
  return handler as ServerOwnedSubmissionHandler;
}

async function loadPhysicalWorkedHandler(): Promise<PhysicalWorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createPhysicalContextWorkedSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error(
      "AP Precalculus must export internal createPhysicalContextWorkedSubmission for physical Worked submissions. " +
        `Available exports: ${Object.keys(importedModule).sort().join(", ") || "(none)"}.`,
    );
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error(
      "AP Precalculus createPhysicalContextWorkedSubmission must expose a Convex mutation handler.",
    );
  }
  return handler as PhysicalWorkedSubmissionHandler;
}

async function loadTopic12Handler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12TableAverageRateSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error("AP Precalculus must export createTopic12TableAverageRateSubmission.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("AP Precalculus Topic 1.2 mutation must expose its handler.");
  }
  return handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12GraphHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12GraphAverageRateSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error("AP Precalculus must export createTopic12GraphAverageRateSubmission.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("AP Precalculus Topic 1.2 graph mutation must expose its handler.");
  }
  return handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12WorkedHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12TableAverageRateWorkedSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error("AP Precalculus must export createTopic12TableAverageRateWorkedSubmission.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("AP Precalculus Topic 1.2 Worked mutation must expose its handler.");
  }
  return handler as Topic12WorkedSubmissionHandler;
}

async function loadTopic12GraphWorkedHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12GraphAverageRateWorkedSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error("AP Precalculus must export createTopic12GraphAverageRateWorkedSubmission.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("AP Precalculus graph Worked mutation must expose its handler.");
  }
  return handler as Topic12WorkedSubmissionHandler;
}

function createHarness(
  options: {
    stableActivityId?: string;
    activityDocumentId?: string;
    variantSeed?: number;
    approvalStatus?: "unreviewed" | "approved" | "needs_changes" | "rejected";
  } = {},
) {
  const stableActivityId = options.stableActivityId ?? PILOT_STABLE_ACTIVITY_ID;
  const activityDocumentId = options.activityDocumentId ?? PILOT_ACTIVITY_DOCUMENT_ID;
  const variantSeed = options.variantSeed ?? 0;
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: activityDocumentId,
        stableActivityId,
        componentKey: "precalculus-mastery-advantage-pilot",
        displayName:
          stableActivityId === PILOT_STABLE_ACTIVITY_ID
            ? "Mastery Advantage: Identify Graph Intervals"
            : "Independent Practice: Classify Graph Intervals",
        description:
          stableActivityId === PILOT_STABLE_ACTIVITY_ID
            ? "Classify the increasing, decreasing, and constant intervals from a graph."
            : "Classify the increasing, decreasing, and constant intervals from a generated graph.",
        props: {
          nodeId: PRECALCULUS_PILOT_NODE_ID,
          mode:
            stableActivityId === PILOT_STABLE_ACTIVITY_ID
              ? "guided_practice"
              : "independent_practice",
        },
        approval: { status: options.approvalStatus ?? "approved" },
        gradingConfig: {
          variantSeed,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    profiles: [
      { _id: LEARNER_ID, organizationId: "organizations:1", username: "student", role: "student" },
    ],
    auth_credentials: [
      {
        _id: "auth_credentials:1",
        profileId: LEARNER_ID,
        organizationId: "organizations:1",
        username: "student",
        role: "student",
        isActive: true,
      },
    ],
    activity_submissions: [],
  };

  function selectedRows(tableName: string, conditions: ReadonlyMap<string, unknown>) {
    return (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  }

  const ctx = {
    db: {
      get: async (...args: unknown[]) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === args.at(-1)) ?? null,
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        const result = {
          unique: async () => selectedRows(tableName, conditions)[0] ?? null,
          first: async () => selectedRows(tableName, conditions)[0] ?? null,
          collect: async () => selectedRows(tableName, conditions),
          take: async (limit: number) => selectedRows(tableName, conditions).slice(0, limit),
          order: () => result,
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
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows };
}

function makeRawEnvelope(
  constantInterval = "none",
  overrides: Partial<{
    increasingIntervals: string;
    decreasingIntervals: string;
    constantIntervals: string;
  }> = {},
) {
  const answers = {
    increasingIntervals: "[0, 3] U [7, 9]",
    decreasingIntervals: "[3, 7]",
    constantIntervals: constantInterval,
    ...overrides,
  };
  return {
    contractVersion: "practice.v1",
    activityId: PILOT_STABLE_ACTIVITY_ID,
    mode: "guided_practice",
    status: "submitted",
    // The server must replace this browser number with its own ordinal.
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers,
    // The server computes all grades from these raw answers.
    parts: [
      { partId: "increasingIntervals", rawAnswer: answers.increasingIntervals },
      { partId: "decreasingIntervals", rawAnswer: answers.decreasingIntervals },
      { partId: "constantIntervals", rawAnswer: answers.constantIntervals },
    ],
  };
}

function makeIndependentRawEnvelope() {
  const variant = generateTopic11IntervalGraph(2);
  const formatIntervals = (intervals: readonly (readonly [number, number])[]) =>
    intervals.map(([start, end]) => `[${start},${end}]`).join(" U ");
  const answers = {
    increasingIntervals: formatIntervals(variant.increasingIntervals),
    decreasingIntervals: formatIntervals(variant.decreasingIntervals),
    constantIntervals: formatIntervals(variant.constantIntervals) || "none",
  };
  return {
    contractVersion: "practice.v1",
    activityId: INDEPENDENT_STABLE_ACTIVITY_ID,
    mode: "independent_practice",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers,
    parts: [
      { partId: "increasingIntervals", rawAnswer: answers.increasingIntervals },
      { partId: "decreasingIntervals", rawAnswer: answers.decreasingIntervals },
      { partId: "constantIntervals", rawAnswer: answers.constantIntervals },
    ],
  };
}

type PhysicalMode = "guided_practice" | "independent_practice";

function createPhysicalHarness(mode: PhysicalMode) {
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
      : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  const variantSeed = mode === "guided_practice" ? 1 : 2;
  const activityDocumentId = `activities:physical-context-${mode}`;
  const harness = createHarness({
    stableActivityId,
    activityDocumentId,
    variantSeed,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId,
    componentKey: PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
    gradingConfig:
      mode === "guided_practice"
        ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG
        : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG,
  };
  return { ...harness, activityDocumentId, stableActivityId, variantSeed };
}

function createPhysicalWorkedHarness() {
  const activityDocumentId = "activities:physical-context-worked-example";
  const harness = createHarness({
    stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
    activityDocumentId,
    variantSeed: 0,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
    componentKey: PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
    props: { presentationMode: "worked_example" },
    gradingConfig: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
  };
  return { ...harness, activityDocumentId };
}

function makePhysicalRawEnvelope(mode: PhysicalMode, selectedOptionId: string) {
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
      : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  return {
    contractVersion: "practice.v1",
    activityId: stableActivityId,
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

function makePhysicalWorkedRawEnvelope(selectedOptionId = "D") {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

type Topic12Mode = "guided_practice" | "independent_practice";

function createTopic12Harness(mode: Topic12Mode) {
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID;
  const variantSeed =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG.variantSeed
      : PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG.variantSeed;
  const harness = createHarness({
    stableActivityId,
    activityDocumentId: `activities:topic-1-2-${mode}`,
    variantSeed,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId,
    componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
    gradingConfig:
      mode === "guided_practice"
        ? PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG
        : PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
  };
  return { ...harness, stableActivityId, variantSeed };
}

function createTopic12WorkedHarness() {
  const activityDocumentId = "activities:topic-1-2-worked";
  const harness = createHarness({
    stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    activityDocumentId,
    variantSeed: PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG.variantSeed,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
    props: { presentationMode: "worked_example" },
    gradingConfig: PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
  };
  return { ...harness, activityDocumentId };
}

function createTopic12GraphWorkedHarness() {
  const activityDocumentId = "activities:topic-1-2-graph-worked";
  const harness = createHarness({
    stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    activityDocumentId,
    variantSeed: 0,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
    props: { presentationMode: "worked_example" },
    gradingConfig: {
      generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
      variantSeed: 0,
    },
  };
  return { ...harness, activityDocumentId };
}

function makeTopic12RawEnvelope(mode: Topic12Mode, selectedOptionId: string) {
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID;
  return {
    contractVersion: "practice.v1",
    activityId: stableActivityId,
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

type Topic12GraphMode = "guided_practice" | "independent_practice";

function createTopic12GraphHarness(mode: Topic12GraphMode) {
  const stableActivityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
  const gradingConfig =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG;
  const harness = createHarness({
    stableActivityId,
    activityDocumentId: `activities:topic-1-2-graph-${mode}`,
    variantSeed: gradingConfig.variantSeed,
  });
  harness.rows.activities[0] = {
    ...harness.rows.activities[0]!,
    stableActivityId,
    componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
  return { ...harness, stableActivityId, gradingConfig };
}

function makeTopic12GraphRawEnvelope(mode: Topic12GraphMode, selectedOptionId: string) {
  const activityId =
    mode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
  return {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

function makeTopic12WorkedRawEnvelope(selectedOptionId = "C") {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

function makeTopic12GraphWorkedRawEnvelope(
  selectedOptionId = generateTopic12GraphAverageRateChoice(0).correctOptionId,
) {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

describe("AP Precalculus server-owned pilot submission", () => {
  it("requires an approved activity with the exact Topic 1.1 identity", async () => {
    const handler = await loadHandler();
    const unapproved = createHarness({ approvalStatus: "unreviewed" });
    await expect(
      handler(unapproved.ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        submissionData: makeRawEnvelope(),
        idempotencyKey: "unapproved-boundary",
      }),
    ).rejects.toThrow(/approved/i);

    const mismatched = createHarness();
    mismatched.rows.activities[0]!.props = {
      nodeId: "math.precalc.skill.other",
      mode: "guided_practice",
    };
    await expect(
      handler(mismatched.ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        submissionData: makeRawEnvelope(),
        idempotencyKey: "identity-boundary",
      }),
    ).rejects.toThrow(/identity/i);
  });

  it.each([
    [
      "an unapproved activity ID",
      {
        activityId: "math.precalc.skill.1.1.unapproved.guided_practice",
        idempotencyKey: "precalc-invalid-activity",
      },
      /Invalid Precalculus pilot activity/,
    ],
    [
      "an empty idempotency key",
      {
        activityId: PILOT_STABLE_ACTIVITY_ID,
        idempotencyKey: "   ",
      },
      /idempotency key/,
    ],
  ])("rejects %s before creating a stored submission", async (_label, input, error) => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: input.activityId,
        submissionData: makeRawEnvelope(),
        idempotencyKey: input.idempotencyKey,
      }),
    ).rejects.toThrow(error);
    expect(rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "an unprovisioned activity",
      (rows: Record<string, Row[]>) => {
        rows.activities = [];
      },
      /approved|identity/,
    ],
    [
      "a mismatched pilot component",
      (rows: Record<string, Row[]>) => {
        rows.activities[0]!.componentKey = "step-by-step-solver";
      },
      /approved|identity/,
    ],
  ])("rejects %s before accepting raw answers", async (_label, mutate, error) => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    mutate(rows);

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        submissionData: makeRawEnvelope(),
        idempotencyKey: "precalc-invalid-provisioning",
      }),
    ).rejects.toThrow(error);
    expect(rows.activity_submissions).toHaveLength(0);
  });

  it("rejects malformed raw submission fields at the server-owned boundary", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        submissionData: {
          ...makeRawEnvelope(),
          unexpectedClientField: true,
        },
        idempotencyKey: "precalc-invalid-fields",
      }),
    ).rejects.toThrow(/submission fields/);
    expect(rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a duplicate canonical part ID",
      (envelope: ReturnType<typeof makeRawEnvelope>) => ({
        ...envelope,
        parts: [envelope.parts[0], envelope.parts[1], { ...envelope.parts[0] }],
      }),
    ],
    [
      "a missing canonical part ID despite three submitted parts",
      (envelope: ReturnType<typeof makeRawEnvelope>) => ({
        ...envelope,
        parts: [envelope.parts[0], envelope.parts[1], { ...envelope.parts[1] }],
      }),
    ],
    [
      "an unknown part ID",
      (envelope: ReturnType<typeof makeRawEnvelope>) => ({
        ...envelope,
        parts: [
          envelope.parts[0],
          envelope.parts[1],
          { partId: "unknownIntervals", rawAnswer: "[3,5]" },
        ],
      }),
    ],
    [
      "a raw part answer that disagrees with the named answer",
      (envelope: ReturnType<typeof makeRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], rawAnswer: "[0,1]" }, ...envelope.parts.slice(1)],
      }),
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        submissionData: mutate(makeRawEnvelope()),
        idempotencyKey: `precalc-invalid-parts-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/part|interval|raw answer/i);
    expect(rows.activity_submissions).toHaveLength(0);
  });

  it("fails closed when a replay row is missing authoritative result fields", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope(),
      idempotencyKey: "precalc-incomplete-replay",
    };

    await handler(ctx, input);
    rows.activity_submissions[0]!.feedback = undefined;

    await expect(handler(ctx, input)).rejects.toThrow(/idempotency_conflict/);
    expect(rows.activity_submissions).toHaveLength(1);
  });

  it("accepts a long opaque key while it grades all three Topic 1.1 intervals on the server", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();

    const result = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope(),
      idempotencyKey: LONG_OPAQUE_KEY,
    });

    expect(result).toStrictEqual({
      submissionId: expect.any(String),
      score: 3,
      maxScore: 3,
      feedback: "3/3 interval classifications matched the server rubric.",
      attemptOrdinal: 1,
    });
    expect(rows.activity_submissions).toEqual([
      expect.objectContaining({
        _id: result.submissionId,
        userId: LEARNER_ID,
        activityId: PILOT_ACTIVITY_DOCUMENT_ID,
        stableActivityId: PILOT_STABLE_ACTIVITY_ID,
        score: 3,
        maxScore: 3,
        feedback: "3/3 interval classifications matched the server rubric.",
        attemptOrdinal: 1,
        createIdempotencyKey: LONG_OPAQUE_KEY,
        submittedAt: expect.any(Number),
        gradedAt: expect.any(Number),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        submissionData: expect.objectContaining({
          activityId: PILOT_STABLE_ACTIVITY_ID,
          mode: "guided_practice",
          status: "graded",
          attemptNumber: 1,
          answers: {
            increasingIntervals: "[0,3]U[7,9]",
            decreasingIntervals: "[3,7]",
            constantIntervals: "none",
          },
          parts: expect.arrayContaining([
            expect.objectContaining({
              partId: "increasingIntervals",
              rawAnswer: "[0,3]U[7,9]",
              isCorrect: true,
              score: 1,
              maxScore: 1,
            }),
            expect.objectContaining({
              partId: "decreasingIntervals",
              rawAnswer: "[3,7]",
              isCorrect: true,
              score: 1,
              maxScore: 1,
            }),
            expect.objectContaining({
              partId: "constantIntervals",
              rawAnswer: "none",
              isCorrect: true,
              score: 1,
              maxScore: 1,
            }),
          ]),
        }),
      }),
    ]);
    expect(result.feedback).not.toContain("[0,3]U[7,9]");
    expect(result.feedback).not.toContain("[3,7]");
    expect(result.feedback).not.toContain("none");
  });

  it("replays the same create, rejects a key-body conflict, and assigns a new ordinal to a new key", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const firstInput = {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope(),
      idempotencyKey: "precalc-server-owned-replay",
    };

    const first = await handler(ctx, firstInput);
    const replay = await handler(ctx, firstInput);

    expect(first).toStrictEqual({
      submissionId: "activity_submissions:1",
      score: 3,
      maxScore: 3,
      feedback: "3/3 interval classifications matched the server rubric.",
      attemptOrdinal: 1,
    });
    expect(replay).toStrictEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(ctx, {
        ...firstInput,
        submissionData: makeRawEnvelope("[4, 5]"),
      }),
    ).rejects.toThrow(/idempotency|conflict/i);
    expect(rows.activity_submissions).toHaveLength(1);

    const second = await handler(ctx, {
      ...firstInput,
      idempotencyKey: "precalc-server-owned-second-attempt",
    });
    expect(second).toStrictEqual({
      submissionId: "activity_submissions:2",
      score: 3,
      maxScore: 3,
      feedback: "3/3 interval classifications matched the server rubric.",
      attemptOrdinal: 2,
    });
    expect(rows.activity_submissions).toHaveLength(2);
  });

  it("uses the raw constant classification for server grading", async () => {
    const handler = await loadHandler();
    const { ctx } = createHarness();

    const result = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope("[4, 5]"),
      idempotencyKey: "precalc-server-owned-wrong-constant",
    });

    expect(result).toStrictEqual({
      submissionId: "activity_submissions:1",
      score: 2,
      maxScore: 3,
      feedback: "2/3 interval classifications matched the server rubric.",
      attemptOrdinal: 1,
    });
  });

  it("grades the stored seed-0 graph and rejects the old answers", async () => {
    const handler = await loadHandler();
    const { ctx } = createHarness();

    const correct = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope(),
      idempotencyKey: "precalc-generated-seed-zero",
    });
    expect(correct.score).toBe(3);
    expect(correct.maxScore).toBe(3);

    const { ctx: wrongCtx } = createHarness();
    const oldAnswers = await handler(wrongCtx, {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope("[3, 5]", {
        increasingIntervals: "[-3, -1]",
        decreasingIntervals: "[-1, 3]",
      }),
      idempotencyKey: "precalc-rejected-old-answers",
    });
    expect(oldAnswers.score).toBeLessThan(oldAnswers.maxScore);

    const { ctx: partialCtx } = createHarness();
    const oneWrong = await handler(partialCtx, {
      userId: LEARNER_ID,
      activityId: PILOT_STABLE_ACTIVITY_ID,
      submissionData: makeRawEnvelope("[1, 2]"),
      idempotencyKey: "precalc-one-wrong-answer",
    });
    expect(oneWrong.score).toBe(2);
    expect(oneWrong.maxScore).toBe(3);
  });

  it("grades generated seed-2 Independent answers and replays one stored row", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness({
      stableActivityId: INDEPENDENT_STABLE_ACTIVITY_ID,
      activityDocumentId: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      variantSeed: 2,
    });
    const input = {
      userId: LEARNER_ID,
      activityId: INDEPENDENT_STABLE_ACTIVITY_ID,
      submissionData: makeIndependentRawEnvelope(),
      idempotencyKey: "precalc-independent-replay",
    };

    const first = await handler(ctx, input);
    const replay = await handler(ctx, input);

    expect(first).toMatchObject({ score: 3, maxScore: 3, attemptOrdinal: 1 });
    expect(replay).toStrictEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).toMatchObject({
      activityId: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: INDEPENDENT_STABLE_ACTIVITY_ID,
      submissionData: expect.objectContaining({ mode: "independent_practice" }),
    });

    const { ctx: seedZeroCtx } = createHarness({
      stableActivityId: INDEPENDENT_STABLE_ACTIVITY_ID,
      activityDocumentId: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      variantSeed: 2,
    });
    const seedZeroAnswers = makeRawEnvelope().answers;
    const seedZeroResult = await handler(seedZeroCtx, {
      ...input,
      submissionData: {
        ...makeIndependentRawEnvelope(),
        answers: seedZeroAnswers,
        parts: [
          { partId: "increasingIntervals", rawAnswer: seedZeroAnswers.increasingIntervals },
          { partId: "decreasingIntervals", rawAnswer: seedZeroAnswers.decreasingIntervals },
          { partId: "constantIntervals", rawAnswer: seedZeroAnswers.constantIntervals },
        ],
      },
      idempotencyKey: "precalc-independent-seed-zero-answers",
    });
    expect(seedZeroResult.score).toBeLessThan(seedZeroResult.maxScore);
  });

  it("grades physical Guided and Independent submissions from their stored variants", async () => {
    const handler = await loadPhysicalHandler();
    const guidedVariant = generateTopic11PhysicalContextGraphChoice(1);
    expect(guidedVariant.correctOptionId).toBe("C");
    const guided = createPhysicalHarness("guided_practice");
    const guidedResult = await handler(guided.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: "physical-guided-correct",
    });
    expect(guidedResult).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(guided.rows.activity_submissions[0]).toMatchObject({
      userId: LEARNER_ID,
      activityId: guided.activityDocumentId,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      attemptOrdinal: 1,
      score: 1,
      maxScore: 1,
      feedback: "1/1 graph selections matched the server rubric.",
      masteryContractVersion: "learning-evidence.v1",
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        status: "graded",
        attemptNumber: 1,
        answers: { selectedOptionId: "C" },
        parts: [
          { partId: "selectedOptionId", rawAnswer: "C", isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });

    const guidedWrong = createPhysicalHarness("guided_practice");
    const guidedWrongResult = await handler(guidedWrong.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "D"),
      idempotencyKey: "physical-guided-wrong",
    });
    expect(guidedWrongResult).toMatchObject({ score: 0, maxScore: 1 });

    const independentVariant = generateTopic11PhysicalContextGraphChoice(2);
    expect(independentVariant.correctOptionId).toBe("B");
    expect(
      gradeTopic11PhysicalContextGraphChoice(2, {
        selectedOptionId: independentVariant.correctOptionId,
      }).score,
    ).toBe(1);
    const independent = createPhysicalHarness("independent_practice");
    const independentResult = await handler(independent.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("independent_practice", "B"),
      idempotencyKey: "physical-independent-correct",
    });
    expect(independentResult).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });

    const independentWrong = createPhysicalHarness("independent_practice");
    const independentWrongResult = await handler(independentWrong.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("independent_practice", "C"),
      idempotencyKey: "physical-independent-seed-one-answer",
    });
    expect(independentWrongResult).toMatchObject({ score: 0, maxScore: 1 });
  });

  it("stores physical submissions with replay and attempt protection", async () => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: "physical-replay",
    };

    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makePhysicalRawEnvelope("guided_practice", "D"),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "physical-second-attempt",
    });
    expect(second).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it("stores the server timestamp in nested physical submission data", async () => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: "physical-server-timestamp",
    };

    await handler(harness.ctx, input);

    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(typeof storedData.submittedAt).toBe("string");
    const nestedSubmittedAt = Date.parse(storedData.submittedAt as string);
    expect(nestedSubmittedAt).toBe(stored.submittedAt);
    expect(nestedSubmittedAt).not.toBe(Date.parse(input.submissionData.submittedAt));
  });

  it.each([
    [
      "a wrong activity document identity",
      (row: Row) => {
        row.activityId = "activities:physical-context-other-document";
      },
    ],
    [
      "a non-graded physical submission",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).status = "submitted";
      },
    ],
    [
      "a non-learning-evidence physical submission",
      (row: Row) => {
        row.masteryContractVersion = "practice.v1";
      },
    ],
  ] as const)("rejects replay of %s", async (_label, corrupt) => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: `physical-corrupt-replay-${_label.replaceAll(" ", "-")}`,
    };

    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow(/incomplete|conflict/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "isCorrect",
      (part: Record<string, unknown>) => {
        part.isCorrect = false;
      },
    ],
    [
      "score",
      (part: Record<string, unknown>) => {
        part.score = 0;
      },
    ],
    [
      "maxScore",
      (part: Record<string, unknown>) => {
        part.maxScore = 2;
      },
    ],
  ] as const)(
    "rejects replay when the stored physical part %s disagrees with the server grade",
    async (_field, corruptPart) => {
      const handler = await loadPhysicalHandler();
      const harness = createPhysicalHarness("guided_practice");
      const input = {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
        idempotencyKey: "physical-corrupt-grade-replay",
      };

      await handler(harness.ctx, input);

      const expectedGrade = gradeTopic11PhysicalContextGraphChoice(1, {
        selectedOptionId: "C",
      });
      expect(expectedGrade).toStrictEqual({
        score: 1,
        maxScore: 1,
        parts: [
          { partId: "selectedOptionId", rawAnswer: "C", isCorrect: true, score: 1, maxScore: 1 },
        ],
      });
      const stored = harness.rows.activity_submissions[0]!;
      const storedData = stored.submissionData as Record<string, unknown>;
      const storedPart = storedData.parts as Array<Record<string, unknown>>;
      corruptPart(storedPart[0]!);

      expect(stored.score).toBe(expectedGrade.score);
      expect(stored.maxScore).toBe(expectedGrade.maxScore);
      expect(storedPart).not.toStrictEqual(expectedGrade.parts);
      await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
    },
  );

  it("rejects replay when the stored top-level score disagrees with the server grade", async () => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: "physical-corrupt-top-level-score-replay",
    };

    await handler(harness.ctx, input);

    const expectedGrade = gradeTopic11PhysicalContextGraphChoice(1, {
      selectedOptionId: "C",
    });
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(storedData.parts).toStrictEqual(expectedGrade.parts);
    expect(stored.score).toBe(expectedGrade.score);
    stored.score = 0;
    expect(stored.score).not.toBe(expectedGrade.score);
    expect(storedData.parts).toStrictEqual(expectedGrade.parts);

    await expect(handler(harness.ctx, input)).rejects.toThrow(/incomplete|idempotency_conflict/);
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it("rejects replay when the stored attempt ordinal is below one", async () => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
      idempotencyKey: "physical-zero-ordinal-replay",
    };

    await handler(harness.ctx, input);
    harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
    expect(harness.rows.activity_submissions[0]!.attemptOrdinal).toBe(0);
    expect(harness.rows.activity_submissions[0]!.attemptOrdinal).toBeLessThan(1);

    await expect(handler(harness.ctx, input)).rejects.toThrow(/incomplete|conflict/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makePhysicalRawEnvelope>) => ({ ...envelope, clientScore: 1 }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makePhysicalRawEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, score: 1 },
      }),
    ],
    [
      "a forged client grade part field",
      (envelope: ReturnType<typeof makePhysicalRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], isCorrect: true }],
      }),
    ],
    [
      "a mismatched raw part",
      (envelope: ReturnType<typeof makePhysicalRawEnvelope>) => ({
        ...envelope,
        parts: [{ partId: "selectedOptionId", rawAnswer: "D" }],
      }),
    ],
  ] as const)("rejects %s before physical persistence", async (_label, mutate) => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        submissionData: mutate(makePhysicalRawEnvelope("guided_practice", "C")),
        idempotencyKey: `physical-invalid-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/physical|submission|part|answer/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "wrong component",
      (harness: ReturnType<typeof createPhysicalHarness>) => {
        harness.rows.activities[0]!.componentKey = "precalculus-mastery-advantage-pilot";
      },
    ],
    [
      "wrong grading seed",
      (harness: ReturnType<typeof createPhysicalHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
          variantSeed: 2,
        };
      },
    ],
    [
      "missing grading config",
      (harness: ReturnType<typeof createPhysicalHarness>) => {
        harness.rows.activities[0]!.gradingConfig = undefined;
      },
    ],
    [
      "extra grading config field",
      (harness: ReturnType<typeof createPhysicalHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
          variantSeed: 1,
          extra: true,
        };
      },
    ],
  ] as const)("rejects %s before physical persistence", async (_label, mutate) => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    mutate(harness);
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
        idempotencyKey: `physical-invalid-config-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/provisioned|configuration/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "wrong activity and mode pair",
      {
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
        submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
        idempotencyKey: "physical-invalid-wrong-activity",
      },
    ],
    [
      "wrong mode for the activity",
      {
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        submissionData: {
          ...makePhysicalRawEnvelope("guided_practice", "C"),
          mode: "independent_practice",
        },
        idempotencyKey: "physical-invalid-wrong-mode",
      },
    ],
    [
      "blank idempotency key",
      {
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        submissionData: makePhysicalRawEnvelope("guided_practice", "C"),
        idempotencyKey: "  ",
      },
    ],
  ] as const)("rejects %s before physical persistence", async (_label, input) => {
    const handler = await loadPhysicalHandler();
    const harness = createPhysicalHarness("guided_practice");
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: input.activityId,
        submissionData: input.submissionData,
        idempotencyKey: input.idempotencyKey,
      }),
    ).rejects.toThrow(/physical|activity|idempotency/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("stores and replays an ungraded physical Worked exposure", async () => {
    const handler = await loadPhysicalWorkedHandler();
    const harness = createPhysicalWorkedHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      submissionData: makePhysicalWorkedRawEnvelope(),
      idempotencyKey: "physical-worked-replay",
    };

    const first = await handler(harness.ctx, input);
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(first).toMatchObject({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: harness.activityDocumentId,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        answers: { selectedOptionId: "D" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "D" }],
      },
    });
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(first.submittedAt).toBe(storedData.submittedAt);
    for (const field of ["masteryContractVersion", "score", "maxScore", "feedback", "gradedAt"]) {
      expect(stored).not.toHaveProperty(field);
    }

    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "physical-worked-second-attempt",
    });
    expect(second).toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makePhysicalWorkedRawEnvelope>) => ({
        ...envelope,
        clientScore: 1,
      }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makePhysicalWorkedRawEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, score: 1 },
      }),
    ],
    [
      "a client grade part field",
      (envelope: ReturnType<typeof makePhysicalWorkedRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], isCorrect: true }],
      }),
    ],
  ] as const)("rejects %s for a physical Worked exposure", async (_label, mutate) => {
    const handler = await loadPhysicalWorkedHandler();
    const harness = createPhysicalWorkedHarness();

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        submissionData: mutate(makePhysicalWorkedRawEnvelope()),
        idempotencyKey: `physical-worked-invalid-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/physical|submission|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "wrong component",
      (harness: ReturnType<typeof createPhysicalWorkedHarness>) => {
        harness.rows.activities[0]!.componentKey = "precalculus-mastery-advantage-pilot";
      },
    ],
    [
      "wrong grading config",
      (harness: ReturnType<typeof createPhysicalWorkedHarness>) => {
        harness.rows.activities[0]!.gradingConfig = { variantSeed: 1 };
      },
    ],
    [
      "wrong Worked presentation mode",
      (harness: ReturnType<typeof createPhysicalWorkedHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
    ],
  ] as const)("rejects %s before storing a physical Worked exposure", async (_label, mutate) => {
    const handler = await loadPhysicalWorkedHandler();
    const harness = createPhysicalWorkedHarness();
    mutate(harness);

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        submissionData: makePhysicalWorkedRawEnvelope(),
        idempotencyKey: `physical-worked-invalid-provisioning-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/provisioned|configuration|presentation/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a wrong activity document identity",
      (row: Row) => {
        row.activityId = "activities:physical-context-other-document";
      },
    ],
    [
      "a wrong stable activity ID",
      (row: Row) => {
        row.stableActivityId = `${PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID}.other`;
      },
    ],
    [
      "a mismatched stored mode",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).mode = "guided_practice";
      },
    ],
    [
      "a mismatched stored raw answer",
      (row: Row) => {
        const data = row.submissionData as Record<string, unknown>;
        (data.answers as Record<string, unknown>).selectedOptionId = "A";
      },
    ],
    [
      "an extra stored submissionData field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).extra = true;
      },
    ],
    [
      "an extra stored answer field",
      (row: Row) => {
        const data = row.submissionData as Record<string, unknown>;
        data.answers = { ...(data.answers as Record<string, unknown>), extra: true };
      },
    ],
    [
      "an ordinal below one",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "a graded stored status",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).status = "graded";
      },
    ],
    [
      "a stored grade field",
      (row: Row) => {
        row.score = 1;
      },
    ],
  ] as const)("rejects replay of %s for a physical Worked exposure", async (_label, corrupt) => {
    const handler = await loadPhysicalWorkedHandler();
    const harness = createPhysicalWorkedHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      submissionData: makePhysicalWorkedRawEnvelope(),
      idempotencyKey: `physical-worked-corrupt-${_label.replaceAll(" ", "-")}`,
    };

    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow(/incomplete|conflict/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ["guided_practice", PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID, 1],
    ["independent_practice", PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID, 2],
  ] as const)(
    "stores and replays the Topic 1.2 %s submission from its stored seed",
    async (mode, activityId, seed) => {
      const handler = await loadTopic12Handler();
      const harness = createTopic12Harness(mode);
      const correctOptionId = generateTopic12TableAverageRateChoice(seed).correctOptionId;
      const input = {
        userId: LEARNER_ID,
        activityId,
        submissionData: makeTopic12RawEnvelope(mode, correctOptionId),
        idempotencyKey: `topic12-${mode}-first`,
      };

      const first = await handler(harness.ctx, input);
      expect(first).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.activity_submissions[0]).toMatchObject({
        userId: LEARNER_ID,
        activityId: `activities:topic-1-2-${mode}`,
        stableActivityId: activityId,
        attemptOrdinal: 1,
        score: 1,
        maxScore: 1,
        masteryContractVersion: "learning-evidence.v1",
      });
      expect(
        (harness.rows.activity_submissions[0]?.submissionData as Record<string, unknown>).mode,
      ).toBe(mode);
      expect(
        (harness.rows.activity_submissions[0]?.submissionData as Record<string, unknown>)
          .attemptNumber,
      ).toBe(1);

      const replay = await handler(harness.ctx, input);
      expect(replay).toStrictEqual(first);
      expect(harness.rows.activity_submissions).toHaveLength(1);

      await expect(
        handler(harness.ctx, {
          ...input,
          submissionData: makeTopic12RawEnvelope(mode, correctOptionId === "A" ? "B" : "A"),
        }),
      ).rejects.toThrow("idempotency_conflict");

      const second = await handler(harness.ctx, {
        ...input,
        idempotencyKey: `topic12-${mode}-second`,
      });
      expect(second).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 2 });
      expect(harness.rows.activity_submissions).toHaveLength(2);
    },
  );

  it("rejects forged or extra Topic 1.2 submission fields before persistence", async () => {
    const handler = await loadTopic12Handler();
    const harness = createTopic12Harness("guided_practice");
    const correctOptionId = generateTopic12TableAverageRateChoice(1).correctOptionId;
    const envelope = makeTopic12RawEnvelope("guided_practice", correctOptionId);
    const invalidEnvelopes = [
      { ...envelope, score: 1 },
      { ...envelope, answers: { ...envelope.answers, isCorrect: true } },
      { ...envelope, parts: [{ ...envelope.parts[0], score: 1 }] },
    ];

    for (const [index, submissionData] of invalidEnvelopes.entries()) {
      await expect(
        handler(harness.ctx, {
          userId: LEARNER_ID,
          activityId: PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
          submissionData,
          idempotencyKey: `topic12-invalid-${index}`,
        }),
      ).rejects.toThrow(/invalid|physical-context|submission/i);
    }
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("stores and replays the ungraded Topic 1.2 Worked review without grading fields", async () => {
    const handler = await loadTopic12WorkedHandler();
    const harness = createTopic12WorkedHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12WorkedRawEnvelope(),
      idempotencyKey: "topic12-worked-replay",
    };

    const first = await handler(harness.ctx, input);
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(first).toMatchObject({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: harness.activityDocumentId,
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        answers: { selectedOptionId: "C" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "C" }],
      },
    });
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(first.submittedAt).toBe(storedData.submittedAt);
    for (const field of ["masteryContractVersion", "score", "maxScore", "feedback", "gradedAt"]) {
      expect(stored).not.toHaveProperty(field);
    }

    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeTopic12WorkedRawEnvelope("D"),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "topic12-worked-second-attempt",
    });
    expect(second).toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makeTopic12WorkedRawEnvelope>) => ({ ...envelope, score: 1 }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makeTopic12WorkedRawEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, score: 1 },
      }),
    ],
    [
      "a client grade part field",
      (envelope: ReturnType<typeof makeTopic12WorkedRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], isCorrect: true }],
      }),
    ],
  ] as const)("rejects %s for a Topic 1.2 Worked review", async (_label, mutate) => {
    const handler = await loadTopic12WorkedHandler();
    const harness = createTopic12WorkedHarness();

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
        submissionData: mutate(makeTopic12WorkedRawEnvelope()),
        idempotencyKey: `topic12-worked-invalid-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/invalid|submission|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "wrong component",
      (harness: ReturnType<typeof createTopic12WorkedHarness>) => {
        harness.rows.activities[0]!.componentKey = "precalculus-mastery-advantage-pilot";
      },
    ],
    [
      "wrong grading config",
      (harness: ReturnType<typeof createTopic12WorkedHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "topic12-table-average-rate-choice",
          variantSeed: 1,
        };
      },
    ],
    [
      "wrong Worked presentation mode",
      (harness: ReturnType<typeof createTopic12WorkedHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
    ],
  ] as const)("rejects %s before storing a Topic 1.2 Worked review", async (_label, mutate) => {
    const handler = await loadTopic12WorkedHandler();
    const harness = createTopic12WorkedHarness();
    mutate(harness);

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
        submissionData: makeTopic12WorkedRawEnvelope(),
        idempotencyKey: `topic12-worked-invalid-provisioning-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/provisioned|configuration|presentation/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("stores and replays an ungraded graph average-rate Worked review", async () => {
    const handler = await loadTopic12GraphWorkedHandler();
    const harness = createTopic12GraphWorkedHarness();
    const sourceVariant = generateTopic12GraphAverageRateChoice(0);
    expect(sourceVariant.correctOptionId).toBe("C");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12GraphWorkedRawEnvelope(sourceVariant.correctOptionId),
      idempotencyKey: "topic12-graph-worked-replay",
    };

    const first = await handler(harness.ctx, input);
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(first).toMatchObject({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: harness.activityDocumentId,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        answers: { selectedOptionId: "C" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "C" }],
      },
    });
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(first.submittedAt).toBe(storedData.submittedAt);
    expect(first.submittedAt).not.toBe(input.submissionData.submittedAt);
    for (const field of ["masteryContractVersion", "score", "maxScore", "feedback", "gradedAt"]) {
      expect(stored).not.toHaveProperty(field);
    }
    expect(harness.rows.learning_evidence ?? []).toHaveLength(0);

    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeTopic12GraphWorkedRawEnvelope("D"),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "topic12-graph-worked-second-attempt",
    });
    expect(second).toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.learning_evidence ?? []).toHaveLength(0);
  });

  it("rejects same-user graph and table Worked activity reuse of one idempotency key", async () => {
    const graphHandler = await loadTopic12GraphWorkedHandler();
    const tableHandler = await loadTopic12WorkedHandler();
    const harness = createTopic12GraphWorkedHarness();
    harness.rows.activities.push({
      _id: "activities:topic-1-2-table-worked",
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: "Topic 1.2 table average-rate Worked example",
      props: { presentationMode: "worked_example" },
      gradingConfig: PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    });
    const idempotencyKey = "topic12-graph-worked-cross-activity";

    await graphHandler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12GraphWorkedRawEnvelope(),
      idempotencyKey,
    });
    await expect(
      tableHandler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
        submissionData: makeTopic12WorkedRawEnvelope(),
        idempotencyKey,
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makeTopic12GraphWorkedRawEnvelope>) => ({
        ...envelope,
        clientScore: 1,
      }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makeTopic12GraphWorkedRawEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, score: 1 },
      }),
    ],
    [
      "an extra part field",
      (envelope: ReturnType<typeof makeTopic12GraphWorkedRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], isCorrect: true }],
      }),
    ],
    [
      "a mismatched part answer",
      (envelope: ReturnType<typeof makeTopic12GraphWorkedRawEnvelope>) => ({
        ...envelope,
        parts: [{ partId: "selectedOptionId", rawAnswer: "D" }],
      }),
    ],
  ] as const)("rejects %s before graph Worked persistence", async (_label, mutate) => {
    const handler = await loadTopic12GraphWorkedHandler();
    const harness = createTopic12GraphWorkedHarness();

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
        submissionData: mutate(makeTopic12GraphWorkedRawEnvelope()),
        idempotencyKey: "topic12-graph-worked-invalid-" + _label.replaceAll(" ", "-"),
      }),
    ).rejects.toThrow(/invalid|submission|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a wrong activity ID",
      (_harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {},
      "math.precalc.other.worked_example",
    ],
    [
      "a wrong mode",
      (_harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {},
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "a missing activity",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities = [];
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "a wrong component",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities[0]!.componentKey = "table-average-rate-choice";
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "a wrong presentation mode",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "a wrong generator key",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "topic12-table-average-rate-choice",
          variantSeed: 0,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "an extra grading config key",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
          variantSeed: 0,
          extra: true,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
    [
      "a wrong seed",
      (harness: ReturnType<typeof createTopic12GraphWorkedHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
          variantSeed: 1,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    ],
  ] as const)("rejects %s before graph Worked persistence", async (_label, mutate, activityId) => {
    const handler = await loadTopic12GraphWorkedHandler();
    const harness = createTopic12GraphWorkedHarness();
    mutate(harness);
    const envelope = makeTopic12GraphWorkedRawEnvelope();
    const submissionData =
      _label === "a wrong mode"
        ? { ...envelope, mode: "guided_practice" }
        : _label === "a wrong activity ID"
          ? { ...envelope, activityId }
          : envelope;

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId,
        submissionData,
        idempotencyKey: "topic12-graph-worked-provisioning-" + _label.replaceAll(" ", "-"),
      }),
    ).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects a blank graph Worked idempotency key", async () => {
    const handler = await loadTopic12GraphWorkedHandler();
    const harness = createTopic12GraphWorkedHarness();

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
        submissionData: makeTopic12GraphWorkedRawEnvelope(),
        idempotencyKey: "  ",
      }),
    ).rejects.toThrow("Invalid create idempotency key");
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a wrong activity document identity",
      (row: Row) => {
        row.activityId = "activities:wrong-graph-worked";
      },
    ],
    [
      "a wrong stable activity ID",
      (row: Row) => {
        row.stableActivityId = PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID;
      },
    ],
    [
      "a mismatched stored mode",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).mode = "guided_practice";
      },
    ],
    [
      "an extra stored envelope field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).extra = true;
      },
    ],
    [
      "an extra stored answer field",
      (row: Row) => {
        const data = row.submissionData as Record<string, unknown>;
        data.answers = { ...(data.answers as Record<string, unknown>), extra: true };
      },
    ],
    [
      "an extra stored part field",
      (row: Row) => {
        const data = row.submissionData as Record<string, unknown>;
        data.parts = [{ ...(data.parts as Array<Record<string, unknown>>)[0], extra: true }];
      },
    ],
    [
      "an invalid stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "a stored timestamp mismatch",
      (row: Row) => {
        row.submittedAt = 1;
      },
    ],
    [
      "a stored grade field",
      (row: Row) => {
        row.score = 1;
      },
    ],
    [
      "a stored nested grade field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).score = 1;
      },
    ],
  ] as const)("rejects replay of %s for a graph Worked review", async (_label, corrupt) => {
    const handler = await loadTopic12GraphWorkedHandler();
    const harness = createTopic12GraphWorkedHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12GraphWorkedRawEnvelope(),
      idempotencyKey: "topic12-graph-worked-corrupt-" + _label.replaceAll(" ", "-"),
    };

    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow(/conflict|incomplete/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence ?? []).toHaveLength(0);
  });

  it("grades graph Guided and Independent submissions from their stored seeds", async () => {
    const handler = await loadTopic12GraphHandler();
    const guided = createTopic12GraphHarness("guided_practice");
    const guidedVariant = generateTopic12GraphAverageRateChoice(1);
    expect(guidedVariant.correctOptionId).toBe("C");
    const guidedInput = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      submissionData: makeTopic12GraphRawEnvelope("guided_practice", guidedVariant.correctOptionId),
      idempotencyKey: "topic12-graph-guided-correct",
    };

    const guidedResult = await handler(guided.ctx, guidedInput);
    const guidedStored = guided.rows.activity_submissions[0]!;
    const guidedData = guidedStored.submissionData as Record<string, unknown>;
    expect(guidedResult).toMatchObject({
      submissionId: guidedStored._id,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: "1/1 graph selections matched the server rubric.",
    });
    expect(guidedStored).toMatchObject({
      userId: LEARNER_ID,
      activityId: "activities:topic-1-2-graph-guided_practice",
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      attemptOrdinal: 1,
      score: 1,
      maxScore: 1,
      masteryContractVersion: "learning-evidence.v1",
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        status: "graded",
        attemptNumber: 1,
        answers: { selectedOptionId: "C" },
        parts: [
          { partId: "selectedOptionId", rawAnswer: "C", isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });
    expect(Date.parse(guidedData.submittedAt as string)).toBe(guidedStored.submittedAt);
    expect(guidedData.attemptNumber).toBe(1);
    expect(guidedData.submittedAt).not.toBe(guidedInput.submissionData.submittedAt);
    expect(guided.rows.learning_evidence ?? []).toHaveLength(0);

    const guidedWrong = createTopic12GraphHarness("guided_practice");
    const wrongResult = await handler(guidedWrong.ctx, {
      ...guidedInput,
      submissionData: makeTopic12GraphRawEnvelope("guided_practice", "D"),
      idempotencyKey: "topic12-graph-guided-wrong",
    });
    expect(wrongResult).toMatchObject({ score: 0, maxScore: 1 });

    const independent = createTopic12GraphHarness("independent_practice");
    const independentVariant = generateTopic12GraphAverageRateChoice(2);
    expect(independentVariant.correctOptionId).toBe("C");
    const independentResult = await handler(independent.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
      submissionData: makeTopic12GraphRawEnvelope(
        "independent_practice",
        independentVariant.correctOptionId,
      ),
      idempotencyKey: "topic12-graph-independent-correct",
    });
    expect(independentResult).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    const independentWrong = createTopic12GraphHarness("independent_practice");
    const seedOneAnswerResult = await handler(independentWrong.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
      submissionData: makeTopic12GraphRawEnvelope("independent_practice", "D"),
      idempotencyKey: "topic12-graph-independent-wrong",
    });
    expect(seedOneAnswerResult).toMatchObject({ score: 0, maxScore: 1 });
  });

  it("protects graph idempotency, server ownership, and replay state", async () => {
    const handler = await loadTopic12GraphHandler();
    const harness = createTopic12GraphHarness("guided_practice");
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      submissionData: makeTopic12GraphRawEnvelope("guided_practice", "C"),
      idempotencyKey: "topic12-graph-replay",
    };

    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeTopic12GraphRawEnvelope("guided_practice", "D"),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "topic12-graph-second-attempt",
    });
    expect(second).toMatchObject({ score: 1, attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    const crossActivity = createTopic12GraphHarness("guided_practice");
    crossActivity.rows.activities.push({
      ...crossActivity.rows.activities[0]!,
      _id: "activities:topic-1-2-graph-independent_practice",
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
      props: { presentationMode: "independent_practice" },
    });
    await handler(crossActivity.ctx, input);
    await expect(
      handler(crossActivity.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
        submissionData: makeTopic12GraphRawEnvelope("independent_practice", "C"),
        idempotencyKey: input.idempotencyKey,
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(crossActivity.rows.activity_submissions).toHaveLength(1);

    const corrupt = createTopic12GraphHarness("guided_practice");
    await handler(corrupt.ctx, input);
    (corrupt.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).unexpected =
      true;
    await expect(handler(corrupt.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(corrupt.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makeTopic12GraphRawEnvelope>) => ({ ...envelope, score: 1 }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makeTopic12GraphRawEnvelope>) => ({
        ...envelope,
        answers: { ...envelope.answers, score: 1 },
      }),
    ],
    [
      "a forged grade part field",
      (envelope: ReturnType<typeof makeTopic12GraphRawEnvelope>) => ({
        ...envelope,
        parts: [{ ...envelope.parts[0], isCorrect: true }],
      }),
    ],
    [
      "a mismatched raw part",
      (envelope: ReturnType<typeof makeTopic12GraphRawEnvelope>) => ({
        ...envelope,
        parts: [{ partId: "selectedOptionId", rawAnswer: "D" }],
      }),
    ],
  ] as const)("rejects %s before graph persistence", async (_label, mutate) => {
    const handler = await loadTopic12GraphHandler();
    const harness = createTopic12GraphHarness("guided_practice");
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
        submissionData: mutate(makeTopic12GraphRawEnvelope("guided_practice", "C")),
        idempotencyKey: `topic12-graph-invalid-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/invalid|submission|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a wrong activity ID",
      (_harness: ReturnType<typeof createTopic12GraphHarness>): void => {},
      "math.precalc.skill.1.2.other.guided_practice",
    ],
    [
      "a missing activity",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities = [];
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
    [
      "a wrong component",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities[0]!.componentKey = "table-average-rate-choice";
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
    [
      "a wrong presentation mode",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "independent_practice" };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
    [
      "a wrong generator key",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "topic12-table-average-rate-choice",
          variantSeed: 1,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
    [
      "an extra grading config key",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
          extra: true,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
    [
      "a wrong stored seed",
      (harness: ReturnType<typeof createTopic12GraphHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
          variantSeed: 2,
        };
      },
      PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    ],
  ] as const)("rejects %s before graph persistence", async (_label, mutate, activityId) => {
    const handler = await loadTopic12GraphHandler();
    const harness = createTopic12GraphHarness("guided_practice");
    mutate(harness);
    const envelope = makeTopic12GraphRawEnvelope("guided_practice", "C");
    const input = {
      userId: LEARNER_ID,
      activityId,
      submissionData:
        activityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
          ? envelope
          : { ...envelope, activityId },
      idempotencyKey: `topic12-graph-provisioning-${_label.replaceAll(" ", "-")}`,
    };
    await expect(handler(harness.ctx, input)).rejects.toThrow(
      /invalid|provisioned|configuration|activity/i,
    );
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects a graph activity and mode pair mismatch", async () => {
    const handler = await loadTopic12GraphHandler();
    const harness = createTopic12GraphHarness("guided_practice");

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
        submissionData: makeTopic12GraphRawEnvelope("independent_practice", "C"),
        idempotencyKey: "topic12-graph-mode-mismatch",
      }),
    ).rejects.toThrow(/invalid/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects a blank graph idempotency key", async () => {
    const handler = await loadTopic12GraphHandler();
    const harness = createTopic12GraphHarness("guided_practice");

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
        submissionData: makeTopic12GraphRawEnvelope("guided_practice", "C"),
        idempotencyKey: "   ",
      }),
    ).rejects.toThrow("Invalid create idempotency key");
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });
});
