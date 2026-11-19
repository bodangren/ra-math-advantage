import { beforeEach, describe, expect, it, vi } from "vitest";
const N = "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
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
  createTopic11DailySubmission,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
} from "@/convex/activities";
import { submitTopic11TeacherSubmission } from "@/convex/learningEvidence";
import { evaluateLearningEvidenceV1 } from "@math-platform/practice-core";
const S = `${N}.worked_example`,
  h = (x: unknown) => Reflect.get(x as object, "_handler") as (c: any, a: any) => Promise<any>;
function db() {
  const r: any = {
    profiles: [
      { _id: "t", role: "teacher", organizationId: "org" },
      { _id: "o", role: "teacher", organizationId: "org" },
      { _id: "s", role: "student", organizationId: "org" },
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
    lesson_versions: [{ _id: "lv", lessonId: "l", status: "published" }],
    phase_versions: [{ _id: "pv", lessonVersionId: "lv" }],
    phase_sections: [
      {
        _id: "ps",
        phaseVersionId: "pv",
        sectionType: "activity",
        content: { activityId: "x" },
      },
    ],
    activities: [
      {
        _id: "x",
        stableActivityId: S,
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        approval: { status: "approved" },
        props: { nodeId: N, mode: "worked_example", source: "teacher_led" },
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
        unique: async () => a[0] ?? null,
        collect: async () => a,
        first: async () => (dir === "desc" ? (a.at(-1) ?? null) : (a[0] ?? null)),
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
  beforeEach(() => vi.spyOn(Date, "now").mockReturnValue(2));
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
    expect(await h(submitTopic11TeacherSubmission)(ctx, a)).toMatchObject({
      persisted: true,
    });
    expect(await h(submitTopic11TeacherSubmission)(ctx, a)).toMatchObject({
      delivery: "replay",
    });
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
      ({ occurredAt, _id, learnerId: _learnerId, createdAt: _createdAt, ...x }: any) => ({
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
    ["inactive enrollment", (r: any) => (r.class_enrollments[0].status = "withdrawn"), {}],
    ["missing assignment", (r: any) => (r.class_lessons = []), {}],
    ["late enrollment", (r: any) => (r.class_enrollments[0].enrolledAt = 3), {}],
    ["late assignment", (r: any) => (r.class_lessons[0].assignedAt = 3), {}],
  ])("rejects %s", async (_n, mut, over) => {
    const { ctx, r } = db(),
      m = await h(createTopic11DailySubmission)(ctx, ack);
    mut(r);
    expect(
      await h(submitTopic11TeacherSubmission)(ctx, {
        teacherId: "t",
        learnerId: "s",
        classId: "c",
        submissionId: m.submissionId,
        ...over,
      }),
    ).toEqual({ accepted: false, reason: "submission_not_found" });
  });
});
