import { expect, it, vi } from "vitest";

const catalogs = vi.hoisted(() => ({
  nodes: {
    nodes: [
      {
        id: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        kind: "skill",
        reviewStatus: "approved",
      },
    ],
  },
  blueprints: {
    blueprints: [
      {
        nodeId:
          "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        reviewStatus: "approved",
        rendererKey: "interval-classification",
        rendererModeMap: {
          worked: "interval-classification",
          guidedPractice: "interval-classification",
          independentPractice: "interval-classification",
        },
        guidedPracticeSpec: {
          scaffoldedPrompt:
            "Identify the intervals where the graph increases, decreases, and stays constant.",
          stepPrompts: [
            "Mark the domain endpoints and the change points x=3 and x=7.",
            "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
            "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
          ],
          hints: [
            "Use the two change points to separate the graph into three segments.",
            "Read each segment from left to right.",
            "Enter none when no segment has the requested behavior.",
          ],
          checksPerStep: [
            {
              check:
                "The domain endpoints and both change points are identified.",
            },
            {
              check: "Each segment is classified as rising, falling, or flat.",
            },
            { check: "All three interval fields are completed." },
          ],
          revealPolicy: "one_at_a_time",
          rendererProps: {
            title: "Guided Practice: Classify Graph Intervals",
            prompt:
              "Identify the intervals where the graph increases, decreases, and stays constant.",
            domain: [0, 9],
            changePoints: [3, 7],
            points: [
              { x: 0, y: 1 },
              { x: 3, y: 7 },
              { x: 7, y: 2 },
              { x: 9, y: 6 },
            ],
            presentationMode: "guided_practice",
            guidedSteps: [
              "Mark the domain endpoints and the change points x=3 and x=7.",
              "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
              "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
            ],
            fieldHelp: {
              increasingIntervals: "Find every segment that rises.",
              decreasingIntervals: "Find every segment that falls.",
              constantIntervals: "Check whether any segment stays flat.",
            },
          },
        },
        independentPracticeSpec: {
          variantParameters: {
            seed: {
              type: "integer",
              min: 0,
              description:
                "Deterministic Topic 1.1 interval graph variant seed",
            },
          },
          answerSchema: {
            increasingIntervals: "string",
            decreasingIntervals: "string",
            constantIntervals: "string",
          },
          gradingRules: [
            { partId: "increasingIntervals", ruleType: "custom", maxScore: 1 },
            { partId: "decreasingIntervals", ruleType: "custom", maxScore: 1 },
            { partId: "constantIntervals", ruleType: "custom", maxScore: 1 },
          ],
          replayPolicy: "any_seed",
          rendererProps: {
            title: "Independent Practice: Classify Graph Intervals",
            prompt:
              "Identify the intervals where the graph increases, decreases, and stays constant.",
            domain: [0, 8],
            changePoints: [2, 4],
            points: [
              { x: 0, y: 5 },
              { x: 2, y: 8 },
              { x: 4, y: 8 },
              { x: 8, y: 6 },
            ],
            presentationMode: "independent_practice",
          },
        },
        generatorKey: "topic11-interval-graph",
        gradingSpec: {
          partIds: [
            "increasingIntervals",
            "decreasingIntervals",
            "constantIntervals",
          ],
          passingScore: 3,
          partialCredit: true,
          rubric: [
            {
              partId: "increasingIntervals",
              points: 1,
              criteria: "Correct increasing intervals",
            },
            {
              partId: "decreasingIntervals",
              points: 1,
              criteria: "Correct decreasing intervals",
            },
            {
              partId: "constantIntervals",
              points: 1,
              criteria: "Correct constant intervals",
            },
          ],
        },
      },
    ],
  },
}));
vi.mock("@/curriculum/skill-graph/nodes.json", () => ({
  default: catalogs.nodes,
}));
vi.mock("@/curriculum/skill-graph/blueprints.json", () => ({
  default: catalogs.blueprints,
}));

const NODE =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
const GUIDED = `${NODE}.guided_practice`;
const INDEPENDENT = `${NODE}.independent_practice`;
type Row = Record<string, any> & { _id: string };

function harness(
  stableActivityId = GUIDED,
  overrides: Record<string, unknown> = {},
) {
  const mode =
    stableActivityId === GUIDED ? "guided_practice" : "independent_practice";
  const rows: Record<string, Row[]> = {
    profiles: [
      {
        _id: "profiles:student",
        organizationId: "organizations:1",
        username: "student",
        role: "student",
      },
    ],
    auth_credentials: [
      {
        _id: "auth_credentials:1",
        profileId: "profiles:student",
        organizationId: "organizations:1",
        username: "student",
        role: "student",
        isActive: true,
      },
    ],
    activities: [
      {
        _id: `activities:${mode}`,
        stableActivityId,
        componentKey: "precalculus-mastery-advantage-pilot",
        displayName:
          mode === "guided_practice"
            ? "Mastery Advantage: Identify Graph Intervals"
            : "Independent Practice: Classify Graph Intervals",
        description:
          mode === "guided_practice"
            ? "Classify the increasing, decreasing, and constant intervals from a graph."
            : "Classify the increasing, decreasing, and constant intervals from a generated graph.",
        props: { nodeId: NODE, mode },
        gradingConfig: { variantSeed: mode === "guided_practice" ? 0 : 2 },
        approval: { status: "approved" },
        ...overrides,
      },
    ],
    activity_submissions: [],
  };
  const db = {
    get: async (_table: string, id: string) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === id) ?? null,
    insert: async (table: string, value: Record<string, unknown>) => {
      const row = { _id: `${table}:${rows[table].length + 1}`, ...value };
      rows[table].push(row);
      return row._id;
    },
    query: (table: string) => ({
      withIndex: (_index: string, configure: (q: any) => any) => {
        const conditions = new Map<string, unknown>();
        const upperBounds = new Map<string, number>();
        const q = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return q;
          },
          lte(field: string, value: number) {
            upperBounds.set(field, value);
            return q;
          },
        };
        configure(q);
        const selected = () =>
          rows[table].filter(
            (row) =>
              [...conditions].every(([key, value]) => row[key] === value) &&
              [...upperBounds].every(
                ([key, value]) =>
                  typeof row[key] === "number" && row[key] <= value,
              ),
          );
        return {
          unique: async () => {
            const found = selected();
            if (found.length > 1) throw new Error("duplicate");
            return found[0] ?? null;
          },
          order: () => ({
            first: async () =>
              selected().sort(
                (a, b) => (b.attemptOrdinal ?? 0) - (a.attemptOrdinal ?? 0),
              )[0] ?? null,
          }),
        };
      },
    }),
  };
  return { ctx: { db }, rows };
}

async function handler() {
  const activitiesModule = await import("@/convex/activities");
  return (activitiesModule.createServerOwnedSubmission as any)._handler as (
    ctx: any,
    args: any,
  ) => Promise<any>;
}

async function evidenceHandler() {
  const loadedModule = await import("@/convex/selectedLearningEvidence");
  return loadedModule.submitRoutedEvidenceHandler;
}

function addEvidenceTables(h: ReturnType<typeof harness>) {
  Object.assign(h.rows, {
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  });
  const originalQuery = h.ctx.db.query;
  h.ctx.db.query = (table: string) => {
    const query = originalQuery(table);
    const originalWithIndex = query.withIndex;
    query.withIndex = (index: string, configure: (q: any) => any) => {
      const result = originalWithIndex(index, configure);
      const selected = async () => {
        const all = h.rows[table] ?? [];
        const conditions = new Map<string, unknown>();
        const upperBounds = new Map<string, number>();
        const q: any = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return q;
          },
          lte(field: string, value: number) {
            upperBounds.set(field, value);
            return q;
          },
        };
        configure(q);
        return all.filter(
          (row: Row) =>
            [...conditions].every(([key, value]) => row[key] === value) &&
            [...upperBounds].every(
              ([key, value]) =>
                typeof row[key] === "number" && row[key] <= value,
            ),
        );
      };
      return { ...result, collect: selected };
    };
    return query;
  };
  (h.ctx.db as any).patch = async (
    id: string,
    value: Record<string, unknown>,
  ) => {
    const row = Object.values(h.rows)
      .flat()
      .find((item) => item._id === id);
    if (!row) throw new Error("missing row");
    Object.assign(row, value);
  };
  return h;
}

function addTeacherExposure(h: ReturnType<typeof harness>, occurredAt: number) {
  h.rows.learning_evidence.push({
    _id: "learning_evidence:teacher",
    learnerId: "profiles:student" as any,
    nodeId: NODE,
    activityId: "topic11-worked-source",
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "worked_example",
    occurredAt,
    idempotencyKey: "teacher:verified-source",
    fingerprint: "existing",
    createdAt: occurredAt,
  });
}

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import { createPrecalculusPilotSubmissionRoute } from "@/app/api/activities/precalculus-pilot/submissions/route";
import { createPrecalculusPilotRoute } from "@/app/api/learning-evidence/precalculus-pilot/route";
import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

afterEach(() => vi.unstubAllGlobals());

function fill(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values))
    fireEvent.change(
      screen.getByRole("textbox", { name: new RegExp(name, "i") }),
      { target: { value } },
    );
  fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
}

it.each([GUIDED, INDEPENDENT])(
  "drives %s through both actual routes and real stores",
  async (stableActivityId) => {
    const h = addEvidenceTables(harness(stableActivityId));
    addTeacherExposure(h, Date.now() - 1);
    const create = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission: async (input) => (await handler())(h.ctx as any, input),
    });
    const consume = createPrecalculusPilotRoute({
      getServerSession: async () => ({
        user: { id: "profiles:student", role: "student" },
      }),
      submitLearningEvidence: async (input) =>
        (await evidenceHandler())(h.ctx as any, input as never),
    });
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      const request = new Request(`http://local.test${url}`, init);
      return url.includes("/activities/")
        ? create.POST(request)
        : consume.POST(request);
    });
    const mode =
      stableActivityId === GUIDED ? "guided_practice" : "independent_practice";
    render(
      <PrecalculusMasteryAdvantagePilot
        mode={mode}
        seed={mode === "guided_practice" ? 0 : 2}
        stableActivityId={stableActivityId}
      />,
    );
    const generated = (
      await import("@/lib/practice/topic11-interval-graph")
    ).generateTopic11IntervalGraph(mode === "guided_practice" ? 0 : 2);
    const answer = (value: readonly (readonly [number, number])[]) =>
      value.length ? value.map(([a, b]) => `[${a},${b}]`).join("U") : "none";
    fill({
      increasing: answer(generated.increasingIntervals),
      decreasing: answer(generated.decreasingIntervals),
      constant: answer(generated.constantIntervals),
    });
    await waitFor(() =>
      expect(screen.getByText("Start new attempt")).toBeInTheDocument(),
    );
    expect(h.rows.activity_submissions).toHaveLength(1);
    expect(h.rows.learning_evidence_receipts).toHaveLength(1);
    expect(h.rows.srs_review_log).toHaveLength(
      mode === "guided_practice" ? 0 : 1,
    );
    expect(h.rows.srs_cards).toHaveLength(mode === "guided_practice" ? 0 : 1);
  },
);
