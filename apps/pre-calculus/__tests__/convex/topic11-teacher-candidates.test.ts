import { beforeEach, describe, expect, it, vi } from "vitest";
import nodesDocument from "@/curriculum/skill-graph/nodes.json";
import blueprintsDocument from "@/curriculum/skill-graph/blueprints.json";
import { createTopic11DailySubmission } from "@/convex/activities";
import { getTopic11TeacherCandidatesHandler } from "@/convex/course";
import { submitTopic11TeacherSubmission } from "@/convex/learningEvidence";
import {
  PRECALCULUS_PILOT_NODE_ID as N,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID as S,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY as K,
} from "@/lib/learning-evidence/precalc-pilot";
const h = (value: unknown) =>
  Reflect.get(value as object, "_handler") as (ctx: any, args: any) => Promise<any>;
function publication(status: "approved" | "draft" = "approved") {
  const nodes = structuredClone(nodesDocument.nodes),
    blueprints = structuredClone(blueprintsDocument.blueprints);
  nodes.find((x) => x.id === N)!.reviewStatus = status;
  blueprints.find((x) => x.nodeId === N)!.reviewStatus = status;
  return { nodes, blueprints };
}
function fixture() {
  const r: any = {
    profiles: [
      { _id: "t", username: "teacher", role: "teacher", organizationId: "org" },
      {
        _id: "s",
        username: "student",
        displayName: "Student One",
        role: "student",
        organizationId: "org",
      },
    ],
    auth_credentials: [
      {
        _id: "ct",
        profileId: "t",
        username: "teacher",
        role: "teacher",
        organizationId: "org",
        isActive: true,
      },
      {
        _id: "cs",
        profileId: "s",
        username: "student",
        role: "student",
        organizationId: "org",
        isActive: true,
      },
    ],
    classes: [{ _id: "c", teacherId: "t", name: "Period 1", archived: false }],
    class_enrollments: [
      { _id: "e", classId: "c", studentId: "s", status: "active", enrolledAt: 1 },
    ],
    lessons: [{ _id: "l", unitNumber: 1, orderIndex: 1, title: "Change in Tandem" }],
    class_lessons: [{ _id: "a", classId: "c", lessonId: "l", assignedAt: 1 }],
    lesson_versions: [
      {
        _id: "lv",
        lessonId: "l",
        version: 1,
        status: "published",
        title: "Change in Tandem",
        createdAt: 1,
      },
    ],
    phase_versions: [
      {
        _id: "pv",
        lessonVersionId: "lv",
        phaseNumber: 4,
        phaseType: "worked_example",
        createdAt: 1,
      },
    ],
    phase_sections: [
      {
        _id: "ps",
        phaseVersionId: "pv",
        sequenceOrder: 2,
        sectionType: "activity",
        createdAt: 1,
        content: { activityId: "x", componentKey: K },
      },
    ],
    activities: [
      {
        _id: "x",
        stableActivityId: S,
        componentKey: K,
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description:
          "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
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
  const db: any = {
    get: async (...a: any[]) =>
      Object.values(r)
        .flat()
        .find((x: any) => x._id === a.at(-1)) ?? null,
    insert: async (t: string, v: any) => {
      const id = `${t}:${r[t].length + 1}`;
      r[t].push(structuredClone({ _id: id, ...v }));
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
        collect: async () => a,
        unique: async () => {
          if (a.length > 1) throw Error("duplicate");
          return a[0] ?? null;
        },
        first: async () => (dir === "desc" ? (a.at(-1) ?? null) : (a[0] ?? null)),
        order: (v: string) => ((dir = v), z),
        take: async (n: number) => a.slice(0, n),
      };
      return { withIndex: (_n: string, f: any) => (f(q), z) };
    },
  };
  return { ctx: { db }, r };
}
const ack = {
  userId: "s",
  activityId: S,
  idempotencyKey: "ack",
  submissionData: {
    contractVersion: "practice.v1",
    activityId: S,
    mode: "worked_example",
    status: "submitted",
    answers: {},
    parts: [],
  },
};
const add = (ctx: any) => h(createTopic11DailySubmission)(ctx, ack);
describe("Topic 1.1 teacher candidates", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(2);
    nodesDocument.nodes.find((x) => x.id === N)!.reviewStatus = "approved";
    blueprintsDocument.blueprints.find((x) => x.nodeId === N)!.reviewStatus = "approved";
  });
  it("uses the real acknowledgement and removes the candidate after the real teacher action", async () => {
    const { ctx } = fixture();
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
    const s = await add(ctx);
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([
      {
        learnerId: "s",
        learnerName: "Student One",
        submissionId: s.submissionId,
        acknowledgedAt: 2,
        lessonLabel: "Change in Tandem",
        classChoices: [{ classId: "c", className: "Period 1" }],
      },
    ]);
    await h(submitTopic11TeacherSubmission)(ctx, {
      teacherId: "t",
      learnerId: "s",
      classId: "c",
      submissionId: s.submissionId,
    });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it("finds the exact acknowledgement after 125 unrelated submissions and returns two classes", async () => {
    const { ctx, r } = fixture();
    const s = await add(ctx);
    r.activity_submissions.push(
      ...Array.from({ length: 125 }, (_, i) => ({
        _id: `u${i}`,
        userId: "s",
        activityId: `u${i}`,
        submittedAt: i + 3,
      })),
    );
    r.classes.push({ _id: "c2", teacherId: "t", name: "Period 2", archived: false });
    r.class_enrollments.push({
      _id: "e2",
      classId: "c2",
      studentId: "s",
      status: "active",
      enrolledAt: 1,
    });
    r.class_lessons.push({ _id: "a2", classId: "c2", lessonId: "l", assignedAt: 1 });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toMatchObject([
      {
        submissionId: s.submissionId,
        classChoices: [
          { classId: "c", className: "Period 1" },
          { classId: "c2", className: "Period 2" },
        ],
      },
    ]);
  });
  it("removes an ambiguous class choice but preserves a second class with one active enrollment", async () => {
    const { ctx, r } = fixture();
    await add(ctx);
    r.class_enrollments.push({
      _id: "duplicate",
      classId: "c",
      studentId: "s",
      status: "withdrawn",
      enrolledAt: 1,
    });
    r.classes.push({ _id: "c2", teacherId: "t", name: "Period 2", archived: false });
    r.class_enrollments.push({
      _id: "e2",
      classId: "c2",
      studentId: "s",
      status: "active",
      enrolledAt: 1,
    });
    r.class_lessons.push({ _id: "a2", classId: "c2", lessonId: "l", assignedAt: 1 });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toMatchObject([{ classChoices: [{ classId: "c2", className: "Period 2" }] }]);
  });
  it("rejects inactive teacher credentials and excludes mismatched learner credentials", async () => {
    const a = fixture();
    a.r.auth_credentials[0].isActive = false;
    await expect(
      getTopic11TeacherCandidatesHandler(
        a.ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).rejects.toThrow("Forbidden");
    const b = fixture();
    await add(b.ctx);
    b.r.auth_credentials[1].organizationId = "wrong";
    expect(
      await getTopic11TeacherCandidatesHandler(
        b.ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it.each([
    ["archived class", (r: any) => (r.classes[0].archived = true)],
    ["inactive enrollment", (r: any) => (r.class_enrollments[0].status = "withdrawn")],
    ["late enrollment", (r: any) => (r.class_enrollments[0].enrolledAt = 3)],
    ["missing assignment", (r: any) => (r.class_lessons = [])],
    ["late assignment", (r: any) => (r.class_lessons[0].assignedAt = 3)],
    [
      "cross organization",
      (r: any) => {
        r.profiles[1].organizationId = "other";
        r.auth_credentials[1].organizationId = "other";
      },
    ],
  ])("excludes %s", async (_n, alter) => {
    const { ctx, r } = fixture();
    await add(ctx);
    alter(r);
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it.each([
    ["nonempty answer", (r: any) => (r.activity_submissions[0].submissionData.answers = { x: 1 })],
    ["future time", (r: any) => (r.activity_submissions[0].submittedAt = 3)],
    ["invalid ordinal", (r: any) => (r.activity_submissions[0].attemptOrdinal = 0)],
    ["late approval", (r: any) => (r.activities[0].approval.reviewedAt = 3)],
    ["changed source", (r: any) => (r.activities[0].props.mode = "guided_practice")],
    ["changed phase", (r: any) => (r.phase_sections[0].sequenceOrder = 3)],
  ])("excludes %s", async (_n, alter) => {
    const { ctx, r } = fixture();
    await add(ctx);
    alter(r);
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it("does not let unrelated evidence hide the candidate", async () => {
    const { ctx, r } = fixture();
    const s = await add(ctx);
    r.learning_evidence.push({
      _id: "z",
      learnerId: "s",
      submissionId: s.submissionId,
      nodeId: N,
      activityId: "other",
      origin: "teacher_led",
    });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toHaveLength(1);
  });
  it("does not let an altered confirmation hide the candidate", async () => {
    const { ctx, r } = fixture();
    const s = await add(ctx);
    r.learning_evidence.push({
      _id: "z",
      learnerId: "s",
      submissionId: s.submissionId,
      nodeId: N,
      activityId: S,
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "teaching",
      occurredAt: 2,
      gradedEvidence: undefined,
      idempotencyKey: `precalc:teacher-led:submission:${s.submissionId}:altered`,
    });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toHaveLength(1);
  });
  it("rejects a duplicate selected physical source", async () => {
    const { ctx, r } = fixture();
    await add(ctx);
    r.activities.push({ ...structuredClone(r.activities[0]), _id: "x2" });
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it("does not offer a class owned by another teacher", async () => {
    const { ctx, r } = fixture();
    await add(ctx);
    r.classes[0].teacherId = "other-teacher";
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication(),
      ),
    ).toEqual([]);
  });
  it("fails closed for the production catalog after approval is withdrawn", async () => {
    const { ctx } = fixture();
    await add(ctx);
    nodesDocument.nodes.find((x) => x.id === N)!.reviewStatus = "draft";
    blueprintsDocument.blueprints.find((x) => x.nodeId === N)!.reviewStatus = "draft";
    expect(
      await getTopic11TeacherCandidatesHandler(ctx as never, { teacherId: "t" } as never),
    ).toEqual([]);
    expect(
      await getTopic11TeacherCandidatesHandler(
        ctx as never,
        { teacherId: "t" } as never,
        publication("draft"),
      ),
    ).toEqual([]);
  });
});
