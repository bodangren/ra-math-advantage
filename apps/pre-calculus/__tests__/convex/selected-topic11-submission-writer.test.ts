import { describe, expect, it, vi } from "vitest";

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
        const q = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return q;
          },
        };
        configure(q);
        const selected = () =>
          rows[table].filter((row) =>
            [...conditions].every(([key, value]) => row[key] === value),
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

function envelope(activityId = GUIDED, mode = "guided_practice") {
  return {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2020-01-01T00:00:00.000Z",
    answers: {
      increasingIntervals: "[0,3]U[7,9]",
      decreasingIntervals: "[3,7]",
      constantIntervals: "none",
    },
    parts: [
      { partId: "increasingIntervals", rawAnswer: "[0,3]U[7,9]", hintsUsed: 1 },
      { partId: "decreasingIntervals", rawAnswer: "[3,7]" },
      { partId: "constantIntervals", rawAnswer: "none" },
    ],
  };
}

async function handler() {
  const activitiesModule = await import("@/convex/activities");
  return (activitiesModule.createServerOwnedSubmission as any)._handler as (
    ctx: any,
    args: any,
  ) => Promise<any>;
}

describe("selected Topic 1.1 physical submission writer", () => {
  it("rejects an approved source-only blueprint", async () => {
    const h = harness();
    const blueprint = catalogs.blueprints.blueprints[0] as Record<
      string,
      unknown
    >;
    const complete = { ...blueprint };
    delete blueprint.guidedPracticeSpec;
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: envelope(),
        idempotencyKey: "source-only",
      }),
    ).rejects.toThrow(/curriculum/i);
    Object.assign(blueprint, complete);
  });

  it("requires exact selected mode geometry and grading parts", async () => {
    const { isPrecalculusPilotPublished } = await import("@/convex/activities");
    const publication = () =>
      structuredClone({
        nodes: catalogs.nodes.nodes,
        blueprints: catalogs.blueprints.blueprints,
      });
    const emptyPrompt = publication();
    emptyPrompt.blueprints[0].guidedPracticeSpec.scaffoldedPrompt = "";
    expect(isPrecalculusPilotPublished(emptyPrompt)).toBe(false);
    const wrongGeometry = publication();
    wrongGeometry.blueprints[0].independentPracticeSpec.rendererProps.points[0].y = 99;
    expect(isPrecalculusPilotPublished(wrongGeometry)).toBe(false);
    const wrongParts = publication();
    wrongParts.blueprints[0].gradingSpec.partIds = [];
    expect(isPrecalculusPilotPublished(wrongParts)).toBe(false);
    const arbitraryRules = publication();
    arbitraryRules.blueprints[0].independentPracticeSpec.gradingRules = [
      { partId: "wrong", ruleType: "custom", maxScore: 1 },
      { partId: "wrong-2", ruleType: "custom", maxScore: 1 },
      { partId: "wrong-3", ruleType: "custom", maxScore: 1 },
    ];
    expect(isPrecalculusPilotPublished(arbitraryRules)).toBe(false);
    const wrongAnswerType = publication();
    wrongAnswerType.blueprints[0].independentPracticeSpec.answerSchema.constantIntervals =
      "number";
    expect(isPrecalculusPilotPublished(wrongAnswerType)).toBe(false);
    const wrongGuidedSteps = publication();
    wrongGuidedSteps.blueprints[0].guidedPracticeSpec.rendererProps.guidedSteps =
      ["An unrelated step."];
    expect(isPrecalculusPilotPublished(wrongGuidedSteps)).toBe(false);
    const wrongFieldHelp = publication();
    wrongFieldHelp.blueprints[0].guidedPracticeSpec.rendererProps.fieldHelp.constantIntervals =
      "An unrelated instruction.";
    expect(isPrecalculusPilotPublished(wrongFieldHelp)).toBe(false);
    const wrongPassingScore = publication();
    wrongPassingScore.blueprints[0].gradingSpec.passingScore = 2;
    expect(isPrecalculusPilotPublished(wrongPassingScore)).toBe(false);
  });

  it("uses the server grade and stores a durable physical ID", async () => {
    const h = harness();
    const result = await (
      await handler()
    )(h.ctx, {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "create-1",
    });
    expect(result).toMatchObject({
      submissionId: "activity_submissions:1",
      score: 3,
      maxScore: 3,
      attemptOrdinal: 1,
    });
    expect(h.rows.activity_submissions[0]).toMatchObject({
      stableActivityId: GUIDED,
      masteryContractVersion: "learning-evidence.v1",
      score: 3,
      maxScore: 3,
    });
    expect(
      h.rows.activity_submissions[0].submissionData.parts[0],
    ).toMatchObject({ isCorrect: true, score: 1, maxScore: 1, hintsUsed: 1 });
  });

  it("supports the exact Independent activity and seed", async () => {
    const h = harness(INDEPENDENT);
    const generated = (
      await import("@/lib/practice/topic11-interval-graph")
    ).generateTopic11IntervalGraph(2);
    const answer = (value: readonly (readonly [number, number])[]) =>
      value.length ? value.map(([a, b]) => `[${a},${b}]`).join("U") : "none";
    const body = envelope(INDEPENDENT, "independent_practice");
    body.answers = {
      increasingIntervals: answer(generated.increasingIntervals),
      decreasingIntervals: answer(generated.decreasingIntervals),
      constantIntervals: answer(generated.constantIntervals),
    };
    body.parts = Object.entries(body.answers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
    }));
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: INDEPENDENT,
        submissionData: body,
        idempotencyKey: "independent-1",
      }),
    ).resolves.toMatchObject({ score: 3, maxScore: 3 });
  });

  it.each([
    [
      "wrong node props",
      {
        props: { nodeId: "math.precalc.skill.wrong", mode: "guided_practice" },
      },
    ],
    [
      "mutated props",
      { props: { nodeId: NODE, mode: "guided_practice", answer: "private" } },
    ],
    ["unapproved activity", { approval: { status: "unreviewed" } }],
  ])("rejects %s", async (_label, overrides) => {
    const h = harness(GUIDED, overrides);
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: envelope(),
        idempotencyKey: "bad",
      }),
    ).rejects.toThrow();
    expect(h.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects inactive and mismatched learner authority", async () => {
    const h = harness();
    h.rows.auth_credentials[0].isActive = false;
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: envelope(),
        idempotencyKey: "inactive",
      }),
    ).rejects.toThrow(/identity/i);
  });

  it("rejects malformed raw answers and browser score fields", async () => {
    const h = harness();
    const body: any = envelope();
    body.score = 3;
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: body,
        idempotencyKey: "score",
      }),
    ).rejects.toThrow();
    const forgedPart = envelope();
    Object.assign(forgedPart.parts[0], {
      isCorrect: true,
      score: 1,
      maxScore: 1,
    });
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: forgedPart,
        idempotencyKey: "part-score",
      }),
    ).rejects.toThrow();
    const mismatch = envelope();
    mismatch.parts[0].rawAnswer = "none";
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: mismatch,
        idempotencyKey: "raw",
      }),
    ).rejects.toThrow();
  });

  it("replays one semantic request and rejects an ambiguous changed replay", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "same",
    };
    const first = await write(h.ctx, input);
    const replay = await write(h.ctx, {
      ...input,
      submissionData: { ...envelope(), parts: [...envelope().parts].reverse() },
    });
    expect(replay.submissionId).toBe(first.submissionId);
    expect(h.rows.activity_submissions).toHaveLength(1);
    const changed = envelope();
    changed.answers.constantIntervals = "[1,2]";
    changed.parts[2].rawAnswer = "[1,2]";
    await expect(
      write(h.ctx, { ...input, submissionData: changed }),
    ).rejects.toThrow(/idempotency_conflict/);
    const changedAssistance = envelope();
    changedAssistance.parts[0].hintsUsed = 2;
    await expect(
      write(h.ctx, { ...input, submissionData: changedAssistance }),
    ).rejects.toThrow(/idempotency_conflict/);
    h.rows.activity_submissions[0].score = 0;
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });

  it("preserves canonical raw-answer parity", async () => {
    const h = harness();
    const body = envelope();
    body.answers.increasingIntervals = " [0,3] ∪ [7,9] ";
    body.parts[0].rawAnswer = body.answers.increasingIntervals;
    await (
      await handler()
    )(h.ctx, {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: body,
      idempotencyKey: "canonical-raw",
    });
    const stored = h.rows.activity_submissions[0].submissionData;
    expect(stored.parts[0].rawAnswer).toBe(stored.answers.increasingIntervals);
    expect(stored.answers.increasingIntervals).toBe("[0,3]∪[7,9]");
  });

  it.each([
    ["contractVersion", "practice.v0"],
    ["status", "submitted"],
    ["activityId", "wrong"],
  ])("rejects corrupt stored %s on replay", async (field, value) => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: `corrupt-${field}`,
    };
    await write(h.ctx, input);
    h.rows.activity_submissions[0].submissionData[field] = value;
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });

  it("rejects duplicate stored parts on replay", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "corrupt-parts",
    };
    await write(h.ctx, input);
    const stored = h.rows.activity_submissions[0].submissionData;
    stored.parts[1] = { ...stored.parts[0] };
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });

  it("rejects a stored server timestamp mismatch on replay", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "corrupt-server-time",
    };
    await write(h.ctx, input);
    h.rows.activity_submissions[0].submissionData.submittedAt =
      "2020-01-01T00:00:00.000Z";
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });

  it.each(["missing", "raw-mismatch"])(
    "rejects %s stored part data on replay",
    async (corruption) => {
      const h = harness();
      const write = await handler();
      const input = {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: envelope(),
        idempotencyKey: `corrupt-${corruption}`,
      };
      await write(h.ctx, input);
      const stored = h.rows.activity_submissions[0].submissionData;
      if (corruption === "missing") stored.parts.pop();
      else stored.parts[0].rawAnswer = "[0,3]";
      await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
    },
  );

  it("replays after current publication and activity withdrawal", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "withdrawn-replay",
    };
    const first = await write(h.ctx, input);
    catalogs.nodes.nodes[0].reviewStatus = "draft";
    h.rows.activities[0].approval = { status: "unreviewed" };
    const replay = await write(h.ctx, input);
    expect(replay.submissionId).toBe(first.submissionId);
    expect(h.rows.activity_submissions).toHaveLength(1);
    catalogs.nodes.nodes[0].reviewStatus = "approved";
  });

  it("returns the durable replay after the original activity is deleted or reseeded", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "deleted-source-replay",
    };
    const first = await write(h.ctx, input);
    h.rows.activities = [
      {
        ...h.rows.activities[0],
        _id: "activities:replacement",
        approval: { status: "unreviewed" },
      },
    ];
    await expect(write(h.ctx, input)).resolves.toMatchObject({
      submissionId: first.submissionId,
    });
    h.rows.activities = [];
    await expect(write(h.ctx, input)).resolves.toMatchObject({
      submissionId: first.submissionId,
    });
    expect(h.rows.activity_submissions).toHaveLength(1);
  });

  it("rejects replay when an existing original activity has changed identity", async () => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "changed-source-replay",
    };
    await write(h.ctx, input);
    h.rows.activities[0].props = { nodeId: "wrong", mode: "guided_practice" };
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });

  it.each([0, 1.5])(
    "rejects invalid attempt number %s",
    async (attemptNumber) => {
      const h = harness();
      const body = { ...envelope(), attemptNumber };
      await expect(
        (await handler())(h.ctx, {
          userId: "profiles:student",
          activityId: GUIDED,
          submissionData: body,
          idempotencyKey: `attempt-${attemptNumber}`,
        }),
      ).rejects.toThrow(/envelope/i);
    },
  );

  it("rejects an invalid submitted timestamp", async () => {
    const h = harness();
    await expect(
      (await handler())(h.ctx, {
        userId: "profiles:student",
        activityId: GUIDED,
        submissionData: { ...envelope(), submittedAt: "not-a-date" },
        idempotencyKey: "bad-time",
      }),
    ).rejects.toThrow(/envelope/i);
  });

  it("accepts standard optional fields through the route and real writer", async () => {
    const h = harness();
    const write = await handler();
    const { createPrecalculusPilotSubmissionRoute } =
      await import("@/app/api/activities/precalculus-pilot/submissions/route");
    const route = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission: (input) => write(h.ctx, input),
    });
    const payload = {
      ...envelope(),
      interactionHistory: [{ event: "answer_changed" }],
      timing: {
        startedAt: "2026-09-08T00:00:00.000Z",
        submittedAt: "2026-09-08T00:00:01.200Z",
        wallClockMs: 1200,
        activeMs: 1000,
        idleMs: 200,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: "high",
      },
    };
    const response = await route.POST(
      new Request("http://local/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "optional-fields",
        },
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(200);
    expect(h.rows.activity_submissions[0].submissionData).toMatchObject({
      interactionHistory: payload.interactionHistory,
      timing: payload.timing,
    });
    const retry = {
      ...payload,
      interactionHistory: [{ event: "retry_metadata" }],
      timing: { ...payload.timing, wallClockMs: 1500 },
    };
    const retryResponse = await route.POST(
      new Request("http://local/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "optional-fields",
        },
        body: JSON.stringify(retry),
      }),
    );
    expect(retryResponse.status).toBe(200);
    expect(h.rows.activity_submissions).toHaveLength(1);
    expect(h.rows.activity_submissions[0].submissionData).toMatchObject({
      interactionHistory: payload.interactionHistory,
      timing: payload.timing,
    });
  });

  it.each([
    ["timing", { wallClockMs: -1 }],
    ["analytics", "not-a-record"],
    ["studentFeedback", { private: "wrong-shape" }],
  ])(
    "rejects malformed optional %s through the route and real writer",
    async (field, value) => {
      const h = harness();
      const write = await handler();
      const { createPrecalculusPilotSubmissionRoute } =
        await import("@/app/api/activities/precalculus-pilot/submissions/route");
      const route = createPrecalculusPilotSubmissionRoute({
        requireStudentSession: async () => ({ sub: "profiles:student" }),
        createSubmission: (input) => write(h.ctx, input),
      });
      const response = await route.POST(
        new Request("http://local/submissions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": `invalid-${field}`,
          },
          body: JSON.stringify({ ...envelope(), [field]: value }),
        }),
      );
      expect(response.status).toBe(500);
      expect(h.rows.activity_submissions).toHaveLength(0);
    },
  );
  it.each([
    [
      "extra answer key",
      (row: Row) => {
        row.submissionData.answers.extra = "unrelated";
      },
    ],
    [
      "invalid stored timing",
      (row: Row) => {
        row.submissionData.timing = { elapsedMs: 1200 };
      },
    ],
  ])("parent rejects replay with %s", async (_name, corrupt) => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "parent-stored",
    };
    await write(h.ctx, input);
    corrupt(h.rows.activity_submissions[0]);
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
    expect(h.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "wrong grading rule",
      (blueprint: any) => {
        blueprint.independentPracticeSpec.gradingRules[0].ruleType =
          "exact_match";
      },
    ],
    [
      "wrong part score",
      (blueprint: any) => {
        blueprint.independentPracticeSpec.gradingRules[0].maxScore = 99;
      },
    ],
    [
      "duplicate rubric parts",
      (blueprint: any) => {
        blueprint.gradingSpec.rubric[1].partId =
          blueprint.gradingSpec.rubric[0].partId;
      },
    ],
  ])("parent rejects publication with %s", async (_name, corrupt) => {
    const original = structuredClone(catalogs.blueprints.blueprints[0]);
    try {
      corrupt(catalogs.blueprints.blueprints[0]);
      const h = harness();
      const write = await handler();
      await expect(
        write(h.ctx, {
          userId: "profiles:student",
          activityId: GUIDED,
          submissionData: envelope(),
          idempotencyKey: "parent-blueprint",
        }),
      ).rejects.toThrow(/curriculum is not approved/);
      expect(h.rows.activity_submissions).toHaveLength(0);
    } finally {
      catalogs.blueprints.blueprints[0] = original;
    }
  });
  it.each([
    [
      "unexpected top-level field",
      (row: Row) => {
        row.submissionData.unexpected = true;
      },
    ],
    [
      "unowned part metadata",
      (row: Row) => {
        row.submissionData.parts[0].misconceptionTags = ["corrupt"];
      },
    ],
  ])("parent v3 rejects %s", async (_name, corrupt) => {
    const h = harness();
    const write = await handler();
    const input = {
      userId: "profiles:student",
      activityId: GUIDED,
      submissionData: envelope(),
      idempotencyKey: "parent-v3-stored",
    };
    await write(h.ctx, input);
    corrupt(h.rows.activity_submissions[0]);
    await expect(write(h.ctx, input)).rejects.toThrow(/idempotency_conflict/);
  });
  it("parent v3 rejects empty variant parameters", async () => {
    const original = structuredClone(catalogs.blueprints.blueprints[0]);
    try {
      (
        catalogs.blueprints.blueprints[0].independentPracticeSpec as any
      ).variantParameters = {};
      const h = harness();
      const write = await handler();
      await expect(
        write(h.ctx, {
          userId: "profiles:student",
          activityId: GUIDED,
          submissionData: envelope(),
          idempotencyKey: "parent-v3-variant",
        }),
      ).rejects.toThrow(/curriculum is not approved/);
    } finally {
      catalogs.blueprints.blueprints[0] = original;
    }
  });
  it.each([
    [
      "non-integer seed type",
      {
        seed: {
          type: "number",
          min: 0,
          description: "Deterministic Topic 1.1 interval graph variant seed",
        },
      },
    ],
    [
      "negative seed minimum",
      {
        seed: {
          type: "integer",
          min: -1,
          description: "Deterministic Topic 1.1 interval graph variant seed",
        },
      },
    ],
    [
      "unrelated variant",
      { difficulty: { type: "integer", min: 0, description: "Unrelated" } },
    ],
  ])(
    "rejects %s in the selected variant contract",
    async (_name, variantParameters) => {
      const original = structuredClone(catalogs.blueprints.blueprints[0]);
      try {
        (
          catalogs.blueprints.blueprints[0].independentPracticeSpec as {
            variantParameters: unknown;
          }
        ).variantParameters = variantParameters;
        const h = harness();
        await expect(
          (await handler())(h.ctx, {
            userId: "profiles:student",
            activityId: GUIDED,
            submissionData: envelope(),
            idempotencyKey: `variant-${_name}`,
          }),
        ).rejects.toThrow(/curriculum is not approved/);
      } finally {
        catalogs.blueprints.blueprints[0] = original;
      }
    },
  );
});

it.each(["correctAnswer", "answers", "finalAnswer"])("parent v5 rejects Independent renderer extra %s", async (key) => {
 const original = structuredClone(catalogs.blueprints.blueprints[0]);
 try {
  (catalogs.blueprints.blueprints[0].independentPracticeSpec.rendererProps as any)[key] = "[0,2]";
  const h = harness(); const write = await handler();
  await expect(write(h.ctx, { userId: "profiles:student", activityId: GUIDED, submissionData: envelope(), idempotencyKey: "parent-v5-props" })).rejects.toThrow(/curriculum is not approved/);
 } finally { catalogs.blueprints.blueprints[0] = original; }
});
