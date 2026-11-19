import { beforeEach, describe, expect, it } from "vitest";
import { generateIM1VerbalToNumericalOutput } from "@math-platform/math-content/knowledge-space";
import {
  getApprovedTranslationPilotHandler,
  IM1_TRANSLATION_NODE_ID,
  recordTeacherTranslationExposureHandler,
  submitTranslationPilotHandler,
} from "@/convex/activities";

const studentId = "profiles_student";
const activityId = "activities_guided";

function context(overrides: Record<string, unknown> = {}) {
  const tables: Record<string, Array<Record<string, unknown>>> = {
    profiles: [{ _id: studentId, role: "student" }],
    auth_credentials: [{ _id: "credential", profileId: studentId, isActive: true }],
    activities: [
      {
        _id: activityId,
        stableActivityId: `${IM1_TRANSLATION_NODE_ID}.guided_practice`,
        masteryNodeId: IM1_TRANSLATION_NODE_ID,
        learningEvidenceMode: "guided_practice",
        componentKey: "fill-in-the-blank",
        generatorSeed: 1110,
        generatorDifficulty: 1,
        srsEligible: true,
        approval: { status: "approved" },
        ...overrides,
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
    srs_cards: [],
    srs_review_log: [],
    classes: [],
    class_enrollments: [],
    class_lessons: [],
    lessons: [],
  };
  let sequence = 0;
  const db = {
    get: async (id: string) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: string) => {
      let selected = [...tables[table]];
      const chain = {
        eq(field: string, value: unknown) {
          selected = selected.filter((row) => row[field] === value);
          return chain;
        },
      };
      const result = {
        unique: async () => selected[0] ?? null,
        first: async () => selected[0] ?? null,
        collect: async () => selected,
        order() {
          return result;
        },
      };
      return {
        withIndex(_name: string, callback: (q: typeof chain) => unknown) {
          callback(chain);
          return result;
        },
      };
    },
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}_${++sequence}`;
      tables[table].push({ _id: id, ...value });
      return id;
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const row = Object.values(tables)
        .flat()
        .find((item) => item._id === id);
      if (row) Object.assign(row, value);
    },
  };
  return { ctx: { db }, tables };
}

const args = (rawResponse: string, extra: Record<string, unknown> = {}) => ({
  userId: studentId,
  activityId,
  idempotencyKey: "attempt-1",
  rawResponse,
  hintsUsed: 0,
  revealStepsSeen: 0,
  ...extra,
});
const approvedPublication = {
  nodes: [
    {
      id: IM1_TRANSLATION_NODE_ID,
      kind: "skill",
      reviewStatus: "approved",
      independentPracticeReady: true,
    },
  ],
  blueprints: [{ nodeId: IM1_TRANSLATION_NODE_ID, reviewStatus: "approved" }],
};
const submit = (
  ctx: unknown,
  input: unknown,
  publication: Parameters<typeof submitTranslationPilotHandler>[2] = approvedPublication,
) => submitTranslationPilotHandler(ctx as never, input as never, publication);

describe("IM1 translation pilot durable submission", () => {
  let correct: string;
  beforeEach(() => {
    correct = (
      generateIM1VerbalToNumericalOutput({
        nodeId: IM1_TRANSLATION_NODE_ID,
        seed: 1110,
        difficulty: 1,
      }).data.acceptedExpressions as string[]
    )[0];
  });

  it("records one trusted teacher exposure and rejects an unrelated teacher", async () => {
    const { ctx, tables } = context();
    tables.profiles.push(
      { _id: "teacher", role: "teacher" },
      { _id: "other-teacher", role: "teacher" },
    );
    tables.classes.push({ _id: "class", teacherId: "teacher", archived: false });
    tables.class_enrollments.push({
      _id: "enrollment",
      classId: "class",
      studentId,
      status: "active",
      enrolledAt: 0,
    });
    tables.lessons.push({ _id: "lesson", slug: "module-1-lesson-1" });
    tables.class_lessons.push({
      _id: "assignment",
      classId: "class",
      lessonId: "lesson",
      assignedAt: 0,
    });
    tables.activity_submissions.push({
      _id: "source",
      userId: studentId,
      activityId,
      attemptOrdinal: 1,
      gradedAt: 1,
      submittedAt: 1,
    });
    tables.learning_evidence.push({
      _id: "guided-history",
      learnerId: studentId,
      nodeId: IM1_TRANSLATION_NODE_ID,
      submissionId: "source",
      activityId: "guided",
      attemptOrdinal: 1,
      origin: "mastery_advantage",
      mode: "guided_practice",
      occurredAt: "2026-01-01T00:00:00.000Z",
      idempotencyKey: "guided",
    });
    const input = {
      teacherId: "teacher",
      studentId,
      classId: "class",
      submissionId: "source",
      idempotencyKey: "exposure",
    };
    const first = await recordTeacherTranslationExposureHandler(
      ctx as never,
      input as never,
      approvedPublication,
    );
    const replay = await recordTeacherTranslationExposureHandler(
      ctx as never,
      input as never,
      approvedPublication,
    );
    expect(first.replay).toBe(false);
    expect(replay).toMatchObject({ evidenceId: first.evidenceId, replay: true });
    expect(tables.learning_evidence).toHaveLength(2);
    expect(tables.learning_evidence[1]).toMatchObject({
      learnerId: studentId,
      nodeId: IM1_TRANSLATION_NODE_ID,
      origin: "teacher_led",
      masteryBearing: false,
    });
    await expect(
      recordTeacherTranslationExposureHandler(
        ctx as never,
        { ...input, teacherId: "other-teacher", idempotencyKey: "other" } as never,
        approvedPublication,
      ),
    ).rejects.toThrow("unauthorized_exposure");
  });

  it("grades from the server seed and writes exact-node evidence once", async () => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
      learningEvidenceMode: "independent_practice",
    });
    const first = await submit(ctx, args(correct));
    const replay = await submit(ctx, args(correct));
    expect(first).toMatchObject({ score: 1, maxScore: 1, evidencePersisted: true });
    expect(replay).toEqual(first);
    expect(tables.activity_submissions).toHaveLength(1);
    expect(tables.learning_evidence).toHaveLength(1);
    expect(tables.learning_evidence[0]).toMatchObject({
      learnerId: studentId,
      nodeId: IM1_TRANSLATION_NODE_ID,
      origin: "mastery_advantage",
      mode: "independent_practice",
    });
    expect(tables.srs_cards).toEqual([]);
    expect(tables.srs_review_log).toEqual([]);
  });

  it("keeps pre-exposure grades historical and permits later same-node teacher exposure", async () => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
      learningEvidenceMode: "independent_practice",
    });
    const first = await submit(ctx, args(correct));
    expect(first).toMatchObject({ evidencePersisted: true, masteryBearing: false });
    tables.learning_evidence.push({
      learnerId: studentId,
      nodeId: IM1_TRANSLATION_NODE_ID,
      activityId: "teacher-source",
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "teaching",
      occurredAt: "2020-01-01T00:00:00.000Z",
      idempotencyKey: "teacher-exposure",
    });
    const later = await submit(ctx, args("wrong grouping", { idempotencyKey: "attempt-2" }));
    expect(later).toMatchObject({ score: 0, evidencePersisted: true, masteryBearing: true });
    expect(tables.learning_evidence.at(-1)).toMatchObject({
      gradedEvidence: { isCorrect: false, score: 0 },
      masteryBearing: true,
    });
    expect(tables.srs_cards).toHaveLength(1);
    expect(tables.srs_review_log).toHaveLength(1);
    expect(tables.srs_review_log[0]).toMatchObject({ rating: "Again" });
    const correctLater = await submit(ctx, args(correct, { idempotencyKey: "attempt-3" }));
    expect(correctLater).toMatchObject({ score: 1, masteryBearing: true });
    expect(tables.srs_cards).toHaveLength(1);
    expect(tables.srs_review_log).toHaveLength(2);
    expect(tables.srs_review_log[1]).not.toMatchObject({ rating: "Again" });
  });

  it.each([
    ["another node", "math.im1.skill.other", "2020-01-01T00:00:00.000Z", studentId],
    ["future exposure", IM1_TRANSLATION_NODE_ID, "2999-01-01T00:00:00.000Z", studentId],
    ["another learner", IM1_TRANSLATION_NODE_ID, "2020-01-01T00:00:00.000Z", "other-student"],
  ])("does not grant eligibility from %s", async (_label, nodeId, occurredAt, learnerId) => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
      learningEvidenceMode: "independent_practice",
    });
    tables.learning_evidence.push({
      learnerId,
      nodeId,
      activityId: "teacher-source",
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "teaching",
      occurredAt,
      idempotencyKey: "teacher-exposure",
    });
    expect(await submit(ctx, args(correct))).toMatchObject({ masteryBearing: false });
  });

  it.each([{ hintsUsed: 1 }, { revealStepsSeen: 1 }])(
    "keeps assisted Independent work historical after teacher exposure: %j",
    async (assistance) => {
      const { ctx, tables } = context({
        stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
        learningEvidenceMode: "independent_practice",
      });
      tables.learning_evidence.push({
        learnerId: studentId,
        nodeId: IM1_TRANSLATION_NODE_ID,
        activityId: "teacher-source",
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "teaching",
        occurredAt: "2020-01-01T00:00:00.000Z",
        idempotencyKey: "teacher-exposure",
      });
      expect(await submit(ctx, args(correct, assistance))).toMatchObject({
        score: 1,
        evidencePersisted: true,
        masteryBearing: false,
      });
    },
  );

  it("does not infer graph readiness from an approved activity", async () => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
      learningEvidenceMode: "independent_practice",
    });
    const notReady = {
      ...approvedPublication,
      nodes: approvedPublication.nodes.map((node) => ({
        ...node,
        independentPracticeReady: false,
      })),
    };
    const result = await submit(ctx, args(correct), notReady);
    expect(result).toMatchObject({ score: 1, evidencePersisted: true, masteryBearing: false });
    expect(tables.activity_submissions).toHaveLength(1);
    expect(tables.learning_evidence).toHaveLength(1);
    expect(tables.learning_evidence[0]).toMatchObject({ masteryBearing: false });
  });

  it("stores assisted guided work without clean evidence", async () => {
    const { ctx, tables } = context();
    const result = await submit(ctx, args(correct, { hintsUsed: 1 }));
    expect(result).toMatchObject({ evidencePersisted: true, masteryBearing: false });
    expect(tables.activity_submissions).toHaveLength(1);
    expect(tables.learning_evidence).toHaveLength(1);
    expect(tables.learning_evidence[0]).toMatchObject({ masteryBearing: false });
  });

  it("stores Worked as an acknowledgement without a false grade", async () => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.worked_example`,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    const submission = args("");
    const first = await submit(ctx, submission);
    const replay = await submit(ctx, submission);
    expect(first).toMatchObject({ kind: "acknowledged", evidencePersisted: false });
    expect(replay).toEqual(first);
    expect(tables.activity_submissions).toHaveLength(1);
    expect(tables.activity_submissions[0]).not.toHaveProperty("score");
    expect(tables.activity_submissions[0]).not.toHaveProperty("maxScore");
    expect(tables.activity_submissions[0]).not.toHaveProperty("gradedAt");
    expect(tables.learning_evidence).toEqual([]);
  });

  it("stores an incorrect independent response without mastery evidence", async () => {
    const { ctx, tables } = context({
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.independent_practice`,
      learningEvidenceMode: "independent_practice",
    });
    const result = await submit(ctx, args("wrong grouping"));
    expect(result).toMatchObject({ score: 0, evidencePersisted: true, masteryBearing: false });
    expect(tables.activity_submissions).toHaveLength(1);
    expect(tables.learning_evidence).toHaveLength(1);
    expect(tables.learning_evidence[0]).toMatchObject({ masteryBearing: false });
  });

  it.each([
    ["inactive learner", { credential: false }],
    ["unapproved activity", { approval: { status: "needs_changes" } }],
    ["mismatched node", { masteryNodeId: "math.im1.skill.forged" }],
    ["mismatched mode identity", { learningEvidenceMode: "independent_practice" }],
  ])("rejects %s", async (_label, change) => {
    const options = change as Record<string, unknown>;
    const { ctx, tables } = context(options.credential === false ? {} : options);
    if (options.credential === false) tables.auth_credentials[0].isActive = false;
    await expect(submit(ctx, args(correct))).rejects.toThrow();
    expect(tables.activity_submissions).toEqual([]);
  });

  it("rejects a changed retry and does not add a second write", async () => {
    const { ctx, tables } = context();
    await submit(ctx, args(correct));
    await expect(submit(ctx, args(`(${correct})`))).rejects.toThrow("idempotency_conflict");
    expect(tables.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "draft node",
      {
        nodes: [{ id: IM1_TRANSLATION_NODE_ID, kind: "skill", reviewStatus: "draft" }],
        blueprints: approvedPublication.blueprints,
      },
    ],
    [
      "rejected blueprint",
      {
        nodes: approvedPublication.nodes,
        blueprints: [{ nodeId: IM1_TRANSLATION_NODE_ID, reviewStatus: "rejected" }],
      },
    ],
  ])("does not let an approved activity bypass a %s", async (_label, publication) => {
    const { ctx, tables } = context();
    await expect(submit(ctx, args(correct), publication)).rejects.toThrow("unpublished_curriculum");
    expect(
      await getApprovedTranslationPilotHandler(ctx as never, { studentId } as never, publication),
    ).toEqual([]);
    expect(tables.activity_submissions).toEqual([]);
  });

  it("returns all three activities when curriculum and activity reviews are approved", async () => {
    const { ctx, tables } = context();
    tables.activities = (
      ["worked_example", "guided_practice", "independent_practice"] as const
    ).map((mode, index) => ({
      _id: `activity-${index}`,
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.${mode}`,
      masteryNodeId: IM1_TRANSLATION_NODE_ID,
      learningEvidenceMode: mode,
      componentKey: "fill-in-the-blank",
      generatorSeed: [1101, 1110, 1103][index],
      generatorDifficulty: 1,
      approval: { status: "approved" },
    }));
    const rows = await getApprovedTranslationPilotHandler(
      ctx as never,
      { studentId } as never,
      approvedPublication,
    );
    expect(rows.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
  });

  it("skips the first exposure after a correct current Independent submission", async () => {
    const { ctx, tables } = context();
    tables.activities = (
      ["worked_example", "guided_practice", "independent_practice"] as const
    ).map((mode, index) => ({
      _id: `activity-${index}`,
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.${mode}`,
      masteryNodeId: IM1_TRANSLATION_NODE_ID,
      learningEvidenceMode: mode,
      componentKey: "fill-in-the-blank",
      generatorSeed: [1101, 1110, 1103][index],
      generatorDifficulty: 1,
      approval: { status: "approved" },
    }));
    tables.activity_submissions.push({
      _id: "submission",
      userId: studentId,
      activityId: "activity-2",
      score: 1,
      maxScore: 1,
      submissionData: { seed: 1103, mode: "independent_practice" },
    });
    expect(
      await getApprovedTranslationPilotHandler(
        ctx as never,
        { studentId } as never,
        approvedPublication,
      ),
    ).toEqual([]);
  });

  it("shows the first exposure again when the Independent seed changes", async () => {
    const { ctx, tables } = context();
    tables.activities = (
      ["worked_example", "guided_practice", "independent_practice"] as const
    ).map((mode, index) => ({
      _id: `activity-${index}`,
      stableActivityId: `${IM1_TRANSLATION_NODE_ID}.${mode}`,
      masteryNodeId: IM1_TRANSLATION_NODE_ID,
      learningEvidenceMode: mode,
      componentKey: "fill-in-the-blank",
      generatorSeed: [1101, 1110, 1103][index],
      generatorDifficulty: 1,
      approval: { status: "approved" },
    }));
    tables.activity_submissions.push({
      _id: "submission",
      userId: studentId,
      activityId: "activity-2",
      score: 1,
      maxScore: 1,
      submissionData: { seed: 999, mode: "independent_practice" },
    });
    expect(
      await getApprovedTranslationPilotHandler(
        ctx as never,
        { studentId } as never,
        approvedPublication,
      ),
    ).toHaveLength(3);
  });
});
