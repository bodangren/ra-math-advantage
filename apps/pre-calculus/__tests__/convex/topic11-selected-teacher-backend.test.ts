import { beforeEach, describe, expect, it, vi } from "vitest";
const N =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
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

import {
  createTopic11DailySubmission,
} from "@/convex/activities";
import { submitTopic11TeacherSubmission } from "@/convex/selectedLearningEvidence";
import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from "@/lib/learning-evidence/precalc-pilot";
import { evaluateLearningEvidenceV1 } from "@math-platform/practice-core";
const S = `${N}.worked_example`,
  h = (x: unknown) =>
    Reflect.get(x as object, "_handler") as (c: any, a: any) => Promise<any>;
function db() {
  const r: any = {
    profiles: [
      { _id: "t", username: "teacher", role: "teacher", organizationId: "org" },
      { _id: "o", username: "other", role: "teacher", organizationId: "org" },
      { _id: "s", username: "student", role: "student", organizationId: "org" },
    ],
    auth_credentials: [
      { _id: "ct", profileId: "t", username: "teacher", role: "teacher", organizationId: "org", isActive: true },
      { _id: "co", profileId: "o", username: "other", role: "teacher", organizationId: "org", isActive: true },
      { _id: "cs", profileId: "s", username: "student", role: "student", organizationId: "org", isActive: true },
    ],
    classes: [{ _id: "c", teacherId: "t", archived: false }],
    class_enrollments: [
      {
        _id: "e",
        classId: "c",
        studentId: "s",
        status: "active",
        enrolledAt: 1,
      },
    ],
    lessons: [{ _id: "l", unitNumber: 1, orderIndex: 1 }],
    class_lessons: [{ _id: "a", classId: "c", lessonId: "l", assignedAt: 1 }],
    lesson_versions: [{ _id: "lv", lessonId: "l", version: 1, status: "published", createdAt: 1 }],
    phase_versions: [{ _id: "pv", lessonVersionId: "lv", phaseType: "worked_example", createdAt: 1 }],
    phase_sections: [{
      _id: "ps",
      phaseVersionId: "pv",
      sectionType: "activity",
      createdAt: 1,
      content: { activityId: "x", componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY },
    }],
    activities: [
      {
        _id: "x",
        stableActivityId: S,
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description: "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
        approval: { status: "approved", reviewedAt: 1 },
        createdAt: 1,
        props: { nodeId: N, mode: "worked_example", source: "teacher_led" },
        gradingConfig: { variantSeed: 0 },
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const d: any = {
    get: async (...a: any[]) =>
      Object.values(r)
        .flat()
        .find((v: any) => v._id === a.at(-1)) ?? null,
    insert: async (t: string, v: any) => {
      const id = `${t}:${r[t].length + 1}`;
      r[t].push({ _id: id, ...v });
      return id;
    },
    query: (t: string) => {
      let a = [...r[t]],
        dir = "asc";
      const q: any = {
        eq(f: string, v: any) {
          a = a.filter((x: any) => x[f] === v);
          return q;
        },
        lte(f: string, v: any) {
          a = a.filter((x: any) => x[f] <= v);
          return q;
        },
      };
      const z: any = {
        unique: async () => {
          if (a.length > 1) throw new Error("duplicate");
          return a[0] ?? null;
        },
        collect: async () => a,
        first: async () =>
          dir === "desc" ? (a.at(-1) ?? null) : (a[0] ?? null),
        order: (x: string) => ((dir = x), z),
        take: async (limit: number) => a.slice(0, limit),
      };
      return { withIndex: (_n: string, f: any) => (f(q), z) };
    },
  };
  return { ctx: { db: d }, r };
}
const ack = {
  userId: "s",
  activityId: S,
  idempotencyKey: "k",
  submissionData: {
    contractVersion: "practice.v1",
    activityId: S,
    mode: "worked_example",
    status: "submitted",
    answers: {},
    parts: [],
  },
};
describe("trusted Topic 1.1 teacher flow", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(2);
    catalogs.nodes.nodes[0].reviewStatus = "approved";
  });
  it("ack then teacher then replay", async () => {
    const { ctx, r } = db(),
      m = await h(createTopic11DailySubmission)(ctx, ack);
    expect(r.learning_evidence).toHaveLength(0);
    const a = {
      teacherId: "t",
      learnerId: "s",
      classId: "c",
      submissionId: m.submissionId,
    };
    vi.mocked(Date.now).mockReturnValue(99);
    expect(await h(submitTopic11TeacherSubmission)(ctx, a)).toMatchObject({
      persisted: true,
    });
    expect(await h(submitTopic11TeacherSubmission)(ctx, a)).toMatchObject({
      delivery: "replay",
    });
    expect(r.learning_evidence).toHaveLength(1);
    expect(r.learning_evidence[0]).toMatchObject({
      origin: "teacher_led",
      mode: "teaching",
      occurredAt: 2,
    });
    expect(r.srs_cards).toHaveLength(0);
    expect(r.srs_review_log).toHaveLength(0);
  });

  it("authenticates the student acknowledgement and never creates evidence", async () => {
    const { ctx, r } = db();
    r.auth_credentials.find((row: any) => row.profileId === "s").isActive = false;
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/identity/i);
    expect(r.activity_submissions).toHaveLength(0);
    expect(r.learning_evidence).toHaveLength(0);
  });

  it("requires the exact source to be published before it stores the acknowledgement", async () => {
    const { ctx, r } = db();
    r.lesson_versions[0].status = "draft";
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/source is not published/);
    expect(r.activity_submissions).toHaveLength(0);
    expect(r.learning_evidence).toHaveLength(0);
    expect(r.srs_cards).toHaveLength(0);

    r.lesson_versions[0].status = "published";
    await expect(h(createTopic11DailySubmission)(ctx, ack)).resolves.toMatchObject({ attemptOrdinal: 1 });
    expect(r.activity_submissions).toHaveLength(1);
    expect(r.learning_evidence).toHaveLength(0);
    expect(r.srs_cards).toHaveLength(0);
  });

  it.each([
    ["nonempty parts", { ...ack, submissionData: { ...ack.submissionData, parts: [{}] } }],
    ["extra envelope key", { ...ack, submissionData: { ...ack.submissionData, submittedAt: "client" } }],
  ])("rejects a noncanonical acknowledgement: %s", async (_label, input) => {
    const { ctx, r } = db();
    await expect(h(createTopic11DailySubmission)(ctx, input)).rejects.toThrow(/acknowledgement/);
    expect(r.activity_submissions).toHaveLength(0);
  });

  it("preserves opaque idempotency key bytes", async () => {
    const { ctx, r } = db();
    const first = await h(createTopic11DailySubmission)(ctx, { ...ack, idempotencyKey: " key " });
    const second = await h(createTopic11DailySubmission)(ctx, { ...ack, idempotencyKey: "key" });
    expect(first.submissionId).not.toBe(second.submissionId);
    expect(r.activity_submissions.map((row: any) => row.createIdempotencyKey)).toEqual([" key ", "key"]);
  });

  it("rejects corrupt acknowledgement replay time and envelope parity", async () => {
    const { ctx, r } = db();
    await h(createTopic11DailySubmission)(ctx, ack);
    r.activity_submissions[0].submittedAt = Number.NaN;
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/idempotency_conflict/);
    r.activity_submissions[0].submittedAt = 2;
    r.activity_submissions[0].submissionData = { ...ack.submissionData, extra: true };
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/idempotency_conflict/);
    expect(r.activity_submissions).toHaveLength(1);
  });

  it("replays a canonical acknowledgement after physical approval withdrawal", async () => {
    const { ctx, r } = db();
    const first = await h(createTopic11DailySubmission)(ctx, ack);
    r.activities[0].approval.status = "needs_changes";
    await expect(h(createTopic11DailySubmission)(ctx, ack)).resolves.toEqual(first);
    expect(r.activity_submissions).toHaveLength(1);
  });

  it("keeps an authenticated replay after publication withdrawal", async () => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    const args = { teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId };
    await h(submitTopic11TeacherSubmission)(ctx, args);
    catalogs.nodes.nodes[0].reviewStatus = "draft";
    await expect(h(submitTopic11TeacherSubmission)(ctx, args)).resolves.toMatchObject({ delivery: "replay" });
    expect(r.learning_evidence).toHaveLength(1);
    catalogs.nodes.nodes[0].reviewStatus = "approved";
  });

  it("rejects an acknowledgement replay when its stored physical source identity changes", async () => {
    const { ctx, r } = db();
    await h(createTopic11DailySubmission)(ctx, ack);
    r.activities[0].props = { ...r.activities[0].props, source: "changed" };
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/idempotency_conflict/);
    expect(r.activity_submissions).toHaveLength(1);
    expect(r.learning_evidence).toHaveLength(0);
  });

  it("rejects a replay after teacher authority is withdrawn", async () => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    const args = { teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId };
    await h(submitTopic11TeacherSubmission)(ctx, args);
    r.auth_credentials.find((row: any) => row.profileId === "t").isActive = false;
    await expect(h(submitTopic11TeacherSubmission)(ctx, args)).rejects.toThrow(/unauthorized/);
    expect(r.learning_evidence).toHaveLength(1);
  });

  it("finds the complete latest published source without fixed row limits", async () => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    r.lesson_versions[0].status = "archived";
    for (let version = 2; version <= 25; version++) r.lesson_versions.push({ _id: `lv${version}`, lessonId: "l", version, status: version === 25 ? "published" : "draft", createdAt: 1 });
    r.phase_versions = Array.from({ length: 21 }, (_, index) => ({ _id: `pv${index}`, lessonVersionId: "lv25", phaseType: index === 20 ? "worked_example" : "learn", createdAt: 1 }));
    r.phase_sections = Array.from({ length: 51 }, (_, index) => ({ _id: `ps${index}`, phaseVersionId: "pv20", sectionType: index === 50 ? "activity" : "text", createdAt: 1, content: index === 50 ? { activityId: "x", componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } : {} }));
    await expect(h(submitTopic11TeacherSubmission)(ctx, { teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId })).resolves.toMatchObject({ delivery: "new" });
  });

  it("rejects a future stored acknowledgement without teacher evidence", async () => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    r.activity_submissions[0].submittedAt = 3;
    await expect(h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId,
    })).rejects.toThrow(/invalid_source_submission/);
    expect(r.learning_evidence).toHaveLength(0);
  });

  it.each([
    ["lesson version", (r: any) => (r.lesson_versions[0].createdAt = 3)],
    ["Worked phase", (r: any) => (r.phase_versions[0].createdAt = 3)],
    ["source section", (r: any) => (r.phase_sections[0].createdAt = 3)],
    ["physical activity", (r: any) => (r.activities[0].createdAt = 3)],
    ["physical approval", (r: any) => (r.activities[0].approval.reviewedAt = 3)],
    ["missing approval time", (r: any) => delete r.activities[0].approval.reviewedAt],
  ])("rejects %s created after the acknowledgement", async (_label, mutate) => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    mutate(r);
    await expect(h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId,
    })).rejects.toThrow(/invalid_source_(submission|assignment)/);
    expect(r.learning_evidence).toHaveLength(0);
    expect(r.srs_cards).toHaveLength(0);
  });

  it("fails closed while the selected graph publication is draft", async () => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    catalogs.nodes.nodes[0].reviewStatus = "draft";
    await expect(h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId,
    })).rejects.toThrow(/assignment/);
    expect(r.learning_evidence).toHaveLength(0);
  });
  it.each(["missing", "changed"])("rejects a %s selected Worked blueprint", async (kind) => {
    const { ctx, r } = db();
    const blueprint: any = catalogs.blueprints.blueprints[0];
    const original = blueprint.workedExampleSpec;
    blueprint.workedExampleSpec = kind === "missing"
      ? undefined
      : { ...original, prompt: "Changed source" };
    await expect(h(createTopic11DailySubmission)(ctx, ack)).rejects.toThrow(/curriculum.*approved/i);
    expect(r.activity_submissions).toHaveLength(0);
    blueprint.workedExampleSpec = original;
  });
  it("changes later independent eligibility", async () => {
    const { ctx, r } = db(),
      m = await h(createTopic11DailySubmission)(ctx, ack),
      e: any = {
        contractVersion: "learning-evidence.v1",
        nodeId: N,
        activityId: `${N}.independent_practice`,
        attemptOrdinal: 1,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: "2026-01-01T00:00:00.000Z",
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: "i",
      };
    expect(
      evaluateLearningEvidenceV1({
        evidence: e,
        acceptedEvidence: [],
        enabledNodeIds: [N],
      }).eligible,
    ).toBe(false);
    await h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t",
      learnerId: "s",
      classId: "c",
      submissionId: m.submissionId,
    });
    const a = r.learning_evidence.map(
      ({ occurredAt, _id, learnerId: _learnerId, createdAt: _createdAt, fingerprint: _fingerprint, ...x }: any) => ({
        contractVersion: "learning-evidence.v1",
        ...x,
        occurredAt: new Date(occurredAt).toISOString(),
      }),
    );
    expect(
      evaluateLearningEvidenceV1({
        evidence: e,
        acceptedEvidence: a,
        enabledNodeIds: [N],
      }).eligible,
    ).toBe(true);
  });
  it.each([
    ["wrong teacher", (_r: any) => {}, { teacherId: "o" }],
    ["wrong class", (_r: any) => {}, { classId: "z" }],
    [
      "inactive enrollment",
      (r: any) => (r.class_enrollments[0].status = "withdrawn"),
      {},
    ],
    ["missing assignment", (r: any) => (r.class_lessons = []), {}],
    [
      "late enrollment",
      (r: any) => (r.class_enrollments[0].enrolledAt = 3),
      {},
    ],
    ["late assignment", (r: any) => (r.class_lessons[0].assignedAt = 3), {}],
  ])("rejects %s", async (_n, mut, over) => {
    const { ctx, r } = db(),
      m = await h(createTopic11DailySubmission)(ctx, ack);
    mut(r);
    await expect(
      h(submitTopic11TeacherSubmission)(ctx, {
        teacherId: "t",
        learnerId: "s",
        classId: "c",
        submissionId: m.submissionId,
        ...over,
      }),
    ).rejects.toThrow(/unauthorized_exposure|invalid_source_assignment/);
  });

  it.each([
    ["inactive teacher credential", (r: any) => (r.auth_credentials.find((x: any) => x.profileId === "t").isActive = false)],
    ["wrong learner organization", (r: any) => (r.profiles.find((x: any) => x._id === "s").organizationId = "other")],
    ["withdrawn physical approval", (r: any) => (r.activities[0].approval.status = "unreviewed")],
    ["changed physical props", (r: any) => (r.activities[0].props.source = "student")],
    ["changed physical grading", (r: any) => (r.activities[0].gradingConfig.variantSeed = 1)],
    ["detached source section", (r: any) => (r.phase_sections = [])],
  ])("rejects %s before teacher evidence", async (_name, mutate) => {
    const { ctx, r } = db();
    const m = await h(createTopic11DailySubmission)(ctx, ack);
    mutate(r);
    await expect(h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t", learnerId: "s", classId: "c", submissionId: m.submissionId,
    })).rejects.toThrow();
    expect(r.learning_evidence).toHaveLength(0);
    expect(r.srs_cards).toHaveLength(0);
  });
});
