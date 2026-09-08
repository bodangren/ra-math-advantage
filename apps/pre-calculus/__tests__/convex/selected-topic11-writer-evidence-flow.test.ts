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
        workedExampleSpec: {
          prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
          givens: ["Domain: 0 <= x <= 9", "Change points: x=3 and x=7"],
          target: { increasingIntervals: "[0,3] and [7,9].", decreasingIntervals: "[3,7].", constantIntervals: "none." },
          steps: [
            { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
            { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
            { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
            { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
            { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
          ],
          explanation: "Read the graph from left to right. It rises on [0,3] and [7,9]. It falls on [3,7]. It has no constant interval.",
          rendererProps: {
            title: "Worked Example: Classify Graph Intervals",
            prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
            domain: [0, 9], changePoints: [3, 7],
            points: [{ x: 0, y: 1 }, { x: 3, y: 7 }, { x: 7, y: 2 }, { x: 9, y: 6 }],
            presentationMode: "worked_example",
            steps: [
              { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
              { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
              { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
              { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
              { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
            ],
            finalAnswer: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.",
          },
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
const SOURCE = `${NODE}.worked_example`;
type Row = Record<string, any> & { _id: string };

function harness(
  stableActivityId = GUIDED,
  overrides: Record<string, unknown> = {},
  ready = true,
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
      {
        _id: "activities:worked", stableActivityId: SOURCE,
        componentKey: "precalculus-topic-1-1-daily-curriculum",
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description: "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
        props: { nodeId: NODE, mode: "worked_example", source: "teacher_led" },
        gradingConfig: { variantSeed: 0 }, approval: { status: "approved", reviewedAt: 1 }, createdAt: 1,
      },
    ],
    lessons: [{ _id: "lessons:1", unitNumber: 1, orderIndex: 1 }],
    lesson_versions: [{ _id: "lesson_versions:1", lessonId: "lessons:1", version: 1, status: "published", createdAt: 1 }],
    phase_versions: [{ _id: "phase_versions:1", lessonVersionId: "lesson_versions:1", phaseNumber: 4, phaseType: "worked_example", createdAt: 1 }],
    phase_sections: [{ _id: "phase_sections:1", phaseVersionId: "phase_versions:1", sequenceOrder: 2, sectionType: "activity", createdAt: 1, content: { activityId: "activities:worked", componentKey: "precalculus-topic-1-1-daily-curriculum" } }],
    activity_submissions: [],
    learning_evidence: [],
  };
  const authorityRows: Record<string, Row[]> = {
    activity_submissions: ready ? [{
      _id: "activity_submissions:ack", userId: "profiles:student", activityId: "activities:worked",
      stableActivityId: SOURCE, masteryContractVersion: "learning-evidence.v1",
      submissionData: { contractVersion: "practice.v1", activityId: SOURCE, mode: "worked_example", status: "submitted", answers: {}, parts: [] },
      attemptOrdinal: 1, submittedAt: 2, createdAt: 2, updatedAt: 2,
    }] : [],
    learning_evidence: ready ? [{
      _id: "learning_evidence:confirmation", learnerId: "profiles:student", nodeId: NODE,
      activityId: SOURCE, attemptOrdinal: 1, origin: "teacher_led", mode: "teaching",
      occurredAt: 2, idempotencyKey: "precalc:teacher-led:submission:activity_submissions:ack", createdAt: 2,
    }] : [],
  };
  const db = {
    get: async (_table: string, id: string) =>
      [...Object.values(rows).flat(), ...Object.values(authorityRows).flat()]
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
          [...rows[table], ...(authorityRows[table] ?? [])].filter((row) =>
            [...conditions].every(([key, value]) => row[key] === value),
          );
        return {
          collect: async () => selected(),
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
  return { ctx: { db }, rows, authorityRows };
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


async function evidenceHandler() {
  const loadedModule = await import('@/convex/selectedLearningEvidence');
  return loadedModule.submitSelectedEvidenceHandler;
}

function addEvidenceTables(h: ReturnType<typeof harness>) {
  Object.assign(h.rows, {
    learning_evidence: [], learning_evidence_receipts: [], srs_cards: [], srs_review_log: [],
  });
  const originalQuery = h.ctx.db.query;
  h.ctx.db.query = (table: string) => {
    const query = originalQuery(table);
    const originalWithIndex = query.withIndex;
    query.withIndex = (index: string, configure: (q: any) => any) => {
      const result = originalWithIndex(index, configure);
      const selected = async () => {
        const all = [...(h.rows[table] ?? []), ...(h.authorityRows[table] ?? [])];
        const conditions = new Map<string, unknown>();
        const q: any = { eq(field: string, value: unknown) { conditions.set(field, value); return q; } };
        configure(q);
        return all.filter((row: Row) => [...conditions].every(([key, value]) => row[key] === value));
      };
      return { ...result, collect: selected };
    };
    return query;
  };
  (h.ctx.db as any).patch = async (id: string, value: Record<string, unknown>) => {
    const row = Object.values(h.rows).flat().find((item) => item._id === id);
    if (!row) throw new Error('missing row');
    Object.assign(row, value);
  };
  return h;
}

async function createStored(h: ReturnType<typeof harness>, activityId: string, body: any, key: string) {
  return (await handler())(h.ctx as any, {
    userId: 'profiles:student', activityId, submissionData: body, idempotencyKey: key,
  });
}

describe('selected Topic 1.1 writer to actual evidence stores', () => {
  it('stores Guided participation without an SRS row', async () => {
    const h = addEvidenceTables(harness());
    const created = await createStored(h, GUIDED, envelope(), 'guided-flow');
    await expect((await evidenceHandler())(h.ctx as any, {
      learnerId: 'profiles:student' as any, submissionId: created.submissionId,
    })).resolves.toMatchObject({ persisted: true, masteryApplied: false, decision: { reason: 'ungraded_evidence' } });
    expect(h.rows.learning_evidence.at(-1)).not.toHaveProperty('gradedEvidence');
    expect(h.rows.srs_cards).toHaveLength(0);
    expect(h.rows.learning_evidence_receipts).toHaveLength(1);
  });

  it('creates one Independent SRS effect and replays its receipt', async () => {
    const h = addEvidenceTables(harness(INDEPENDENT));
    const generated = (await import('@/lib/practice/topic11-interval-graph')).generateTopic11IntervalGraph(2);
    const answer = (value: readonly (readonly [number, number])[]) => value.length ? value.map(([a,b]) => `[${a},${b}]`).join('U') : 'none';
    const body = envelope(INDEPENDENT, 'independent_practice');
    body.answers = { increasingIntervals: answer(generated.increasingIntervals), decreasingIntervals: answer(generated.decreasingIntervals), constantIntervals: answer(generated.constantIntervals) };
    body.parts = Object.entries(body.answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer, hintsUsed: 1 }));
    const created = await createStored(h, INDEPENDENT, body, 'independent-flow');
    const consume = await evidenceHandler();
    await expect(consume(h.ctx as any, { learnerId: 'profiles:student' as any, submissionId: created.submissionId }))
      .resolves.toMatchObject({ persisted: true, masteryApplied: true, delivery: 'new' });
    await expect(consume(h.ctx as any, { learnerId: 'profiles:student' as any, submissionId: created.submissionId }))
      .resolves.toMatchObject({ persisted: true, delivery: 'replay' });
    expect(h.rows.learning_evidence_receipts).toHaveLength(1);
    expect(h.rows.srs_review_log).toHaveLength(1);
    expect(h.rows.srs_review_log[0]).toMatchObject({
      rating: 'Hard',
      evidence: {
        baseRating: 'Hard',
      },
    });
  });

  it('rejects a new submission while the learner has no teacher introduction', async () => {
    const h = addEvidenceTables(harness(INDEPENDENT, {}, false));
    const body = envelope(INDEPENDENT, 'independent_practice');
    body.answers = { increasingIntervals: '[0,2]', decreasingIntervals: '[4,8]', constantIntervals: '[2,4]' };
    body.parts = Object.entries(body.answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer }));
    await expect(createStored(h, INDEPENDENT, body, 'awaiting-flow'))
      .rejects.toThrow('practice_unavailable');
    expect(h.rows.activity_submissions).toHaveLength(0);
    expect(h.rows.learning_evidence).toHaveLength(0);
    expect(h.rows.learning_evidence_receipts).toHaveLength(0);
    expect(h.rows.srs_cards).toHaveLength(0);
  });

  it('rejects inactive learner authority before receipt replay', async () => {
    const h = addEvidenceTables(harness());
    const created = await createStored(h, GUIDED, envelope(), 'inactive-flow');
    const consume = await evidenceHandler();
    await expect(consume(h.ctx as any, {
      learnerId: 'profiles:student' as any, submissionId: created.submissionId,
    })).resolves.toMatchObject({ persisted: true, delivery: 'new' });
    expect(h.rows.learning_evidence_receipts).toHaveLength(1);
    h.rows.auth_credentials[0].isActive = false;
    await expect(consume(h.ctx as any, { learnerId: 'profiles:student' as any, submissionId: created.submissionId }))
      .rejects.toThrow(/identity/i);
    expect(h.rows.learning_evidence_receipts).toHaveLength(1);
  });

  it('uses an incorrect assisted Independent server grade', async () => {
    const h = addEvidenceTables(harness(INDEPENDENT));
    const body = envelope(INDEPENDENT, 'independent_practice');
    body.answers = { increasingIntervals: 'none', decreasingIntervals: '[4,8]', constantIntervals: '[2,4]' };
    body.parts = Object.entries(body.answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer, hintsUsed: 2 }));
    const created = await createStored(h, INDEPENDENT, body, 'wrong-assisted');
    expect(created.score).toBe(2);
    await expect((await evidenceHandler())(h.ctx as any, { learnerId: 'profiles:student' as any, submissionId: created.submissionId }))
      .resolves.toMatchObject({ persisted: true, masteryApplied: true });
    expect(h.rows.learning_evidence.at(-1)?.gradedEvidence).toEqual({ isCorrect: false, score: 2, maxScore: 3 });
    expect(h.rows.activity_submissions[0].submissionData.parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ hintsUsed: 2 }),
        expect.objectContaining({ hintsUsed: 2 }),
        expect.objectContaining({ hintsUsed: 2 }),
      ]),
    );
    expect(h.rows.srs_review_log).toHaveLength(1);
    expect(h.rows.srs_review_log[0]).toMatchObject({
      rating: 'Again',
      evidence: { baseRating: 'Again' },
    });
  });

  it('fails closed when the approved physical source changes after grading', async () => {
    const h = addEvidenceTables(harness());
    const created = await createStored(h, GUIDED, envelope(), 'changed-source');
    h.rows.activities[0].description = 'Changed content';
    await expect((await evidenceHandler())(h.ctx as any, { learnerId: 'profiles:student' as any, submissionId: created.submissionId }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(h.rows.learning_evidence_receipts).toHaveLength(0);
  });
});
