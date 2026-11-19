import { describe, expect, it, vi } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import { createServerOwnedSubmissionHandler, submitActivity } from "@/convex/activities";
import {
  recordIm3GraphTeacherExposureHandler,
  submitIm3PublishedEvidenceHandler,
} from "@/convex/learningEvidence";
import { buildIm3PilotSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const publication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};
const workedWriter = Reflect.get(submitActivity as object, "_handler") as (
  context: MutationCtx,
  args: Record<string, unknown>,
) => Promise<{ submissionId: string }>;

function memoryDb() {
  const independent = buildIm3PilotSeedDocuments("independent" as never, 1).activity;
  const tables: Record<string, Array<Record<string, any>>> = {
    profiles: [
      { _id: "teacher", role: "teacher", organizationId: "org" },
      { _id: "student", username: "student", role: "student", organizationId: "org" },
    ],
    auth_credentials: [
      {
        _id: "credential",
        profileId: "student",
        username: "student",
        role: "student",
        organizationId: "org",
        isActive: true,
      },
    ],
    classes: [{ _id: "class", teacherId: "teacher", name: "IM3", archived: false }],
    class_enrollments: [
      {
        _id: "enrollment",
        classId: "class",
        studentId: "student",
        status: "active",
        enrolledAt: 1,
      },
    ],
    lessons: [{ _id: "lesson", slug: "module-1-lesson-1", title: "Quadratic Functions" }],
    class_lessons: [{ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 1 }],
    lesson_versions: [{ _id: "version", lessonId: "lesson", version: 1, status: "published" }],
    phase_versions: [{ _id: "phase", lessonVersionId: "version", phaseType: "worked_example" }],
    phase_sections: [
      {
        _id: "section",
        phaseVersionId: "phase",
        sectionType: "activity",
        content: { activityId: "worked", componentKey: "graphing-explorer" },
      },
    ],
    activities: [
      {
        _id: "worked",
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        learningEvidenceMode: "worked_example",
        srsEligible: false,
        approval: { status: "approved" },
        props: { variant: "plot_from_equation", equation: "f(x) = x^2" },
        gradingConfig: { autoGrade: false, partialCredit: false },
      },
      { _id: "independent", ...independent, srsEligible: true, approval: { status: "approved" } },
    ],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
    student_competency: [],
  };
  const query = (table: string) => {
    let rows = [...(tables[table] ?? [])];
    const index = {
      eq(field: string, value: unknown) {
        rows = rows.filter((row) => row[field] === value);
        return index;
      },
      lte(field: string, value: unknown) {
        rows = rows.filter((row) => Number(row[field]) <= Number(value));
        return index;
      },
    };
    let direction = "asc";
    const result = {
      unique: async () => rows[0] ?? null,
      first: async () => (direction === "desc" ? (rows.at(-1) ?? null) : (rows[0] ?? null)),
      collect: async () => rows,
      take: async (limit: number) => rows.slice(0, limit),
      order(next: string) {
        direction = next;
        return result;
      },
    };
    return {
      withIndex: (_name: string, configure: (query: typeof index) => unknown) => {
        configure(index);
        return result;
      },
    };
  };
  const get = async (...args: unknown[]) =>
    Object.values(tables)
      .flat()
      .find((row) => row._id === args.at(-1)) ?? null;
  const insert = async (table: string, value: Record<string, unknown>) => {
    const target = tables[table] ?? (tables[table] = []);
    const id = `${table}:${target.length + 1}`;
    target.push({ _id: id, ...value });
    return id;
  };
  const patch = async (...args: unknown[]) => {
    const id = args.length === 3 ? args[1] : args[0];
    const row = Object.values(tables)
      .flat()
      .find((candidate) => candidate._id === id);
    if (!row) throw new Error(`Missing row ${String(id)}`);
    Object.assign(row, args.at(-1));
  };
  const replace = async (...args: unknown[]) => {
    const id = args.length === 3 ? args[1] : args[0];
    const target = Object.values(tables).find((rows) =>
      rows.some((candidate) => candidate._id === id),
    );
    const index = target?.findIndex((candidate) => candidate._id === id) ?? -1;
    if (!target || index < 0) throw new Error(`Missing row ${String(id)}`);
    target[index] = { _id: id, ...(args.at(-1) as Record<string, unknown>) };
  };
  const runQuery = async (_reference: unknown, args: { studentId: string; variantKey: string }) => {
    const row = tables.srs_cards.find(
      (candidate) =>
        candidate.studentId === args.studentId &&
        (candidate.variantKey === args.variantKey ||
          candidate.legacyProblemFamilyId === args.variantKey ||
          candidate.problemFamilyId === args.variantKey),
    );
    if (!row) return null;
    return {
      cardId: row._id,
      studentId: row.studentId,
      objectiveId: row.objectiveId,
      variantKey: row.variantKey,
      stability: row.stability,
      difficulty: row.difficulty,
      state: row.state,
      dueDate: row.dueDate,
      elapsedDays: row.elapsedDays,
      scheduledDays: row.scheduledDays,
      reps: row.reps,
      lapses: row.lapses,
      lastReview: row.lastReview ?? null,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    };
  };
  const ctx = {
    db: { query, get, insert, patch, replace },
    runQuery,
    scheduler: { runAfter: vi.fn(async () => undefined) },
  } as unknown as MutationCtx;
  return { ctx, tables };
}

describe("IM3 graph real production flow", () => {
  it.each([
    [
      "withdrawn physical approval",
      (activity: Record<string, any>) => {
        activity.approval = { status: "unreviewed" };
      },
    ],
    [
      "changed physical mode",
      (activity: Record<string, any>) => {
        activity.learningEvidenceMode = "worked_example";
      },
    ],
    [
      "changed selected content",
      (activity: Record<string, any>) => {
        activity.props = { ...activity.props, equation: "f(x) = x^2 + 1" };
      },
    ],
    [
      "changed selected grading",
      (activity: Record<string, any>) => {
        activity.gradingConfig = { ...activity.gradingConfig, passingScore: 1 };
      },
    ],
  ])("rejects %s after a valid grade without later effects", async (_label, change) => {
    const { ctx, tables } = memoryDb();
    const points = [-2, -1, 0, 1, 2].map((x) => ({ x, y: -x * x - 1 }));
    const stored = await createServerOwnedSubmissionHandler(
      ctx,
      {
        userId: "student",
        activityId: "independent",
        idempotencyKey: "stored-before-change",
        submissionData: {
          contractVersion: "practice.v1",
          activityId: "independent",
          mode: "independent_practice",
          status: "submitted",
          attemptNumber: 1,
          submittedAt: new Date(30).toISOString(),
          answers: { table_values: points, placed_points: points },
          parts: [
            { partId: "table_values", rawAnswer: points },
            { partId: "placed_points", rawAnswer: points },
          ],
        },
      } as never,
      publication,
    );
    change(tables.activities[1]);
    await expect(
      submitIm3PublishedEvidenceHandler(
        ctx,
        {
          learnerId: "student",
          submissionId: stored.submissionId,
        } as never,
        publication,
      ),
    ).resolves.toEqual({ accepted: false, reason: "submission_not_found" });
    expect(tables.learning_evidence).toHaveLength(0);
    expect(tables.learning_evidence_receipts).toHaveLength(0);
    expect(tables.srs_cards).toHaveLength(0);
    expect(tables.srs_review_log).toHaveLength(0);
  });

  it("uses both production writers, teacher attestation, production evidence wrapper, and SRS", async () => {
    vi.spyOn(Date, "now")
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(20)
      .mockReturnValueOnce(30)
      .mockReturnValue(40);
    const { ctx, tables } = memoryDb();
    const workedInput = {
      userId: "student",
      activityId: "worked",
      idempotencyKey: "worked-key",
      submissionData: {
        contractVersion: "practice.v1",
        activityId: "worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: new Date(10).toISOString(),
        answers: {},
        parts: [],
      },
    };
    const worked = await workedWriter(ctx, workedInput);
    expect(await workedWriter(ctx, workedInput)).toEqual(worked);
    expect(tables.learning_evidence).toHaveLength(0);
    const teacherInput = {
      teacherId: "teacher",
      studentId: "student",
      classId: "class",
      submissionId: worked.submissionId,
      idempotencyKey: "teacher-key",
    } as const;
    const teacher = await recordIm3GraphTeacherExposureHandler(
      ctx,
      teacherInput as never,
      publication,
    );
    expect(
      await recordIm3GraphTeacherExposureHandler(ctx, teacherInput as never, publication),
    ).toEqual({ evidenceId: teacher.evidenceId, replay: true });

    const solvedPoints = [
      { x: -2, y: -5 },
      { x: -1, y: -2 },
      { x: 0, y: -1 },
      { x: 1, y: -2 },
      { x: 2, y: -5 },
    ];
    const wrong = await createServerOwnedSubmissionHandler(
      ctx,
      {
        userId: "student",
        activityId: "independent",
        idempotencyKey: "wrong-key",
        submissionData: {
          contractVersion: "practice.v1",
          activityId: "independent",
          mode: "independent_practice",
          status: "submitted",
          attemptNumber: 1,
          submittedAt: new Date(30).toISOString(),
          answers: { table_values: [], placed_points: [] },
          parts: [
            { partId: "table_values", rawAnswer: [] },
            { partId: "placed_points", rawAnswer: [] },
          ],
        },
      } as never,
      publication,
    );
    expect(wrong).toMatchObject({ score: 0, maxScore: 2 });

    const independentInput = {
      userId: "student",
      activityId: "independent",
      idempotencyKey: "independent-key",
      submissionData: {
        contractVersion: "practice.v1",
        activityId: "independent",
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: new Date(30).toISOString(),
        answers: { table_values: solvedPoints, placed_points: solvedPoints },
        parts: [
          { partId: "table_values", rawAnswer: solvedPoints },
          { partId: "placed_points", rawAnswer: solvedPoints },
        ],
      },
    };
    const independent = await createServerOwnedSubmissionHandler(
      ctx,
      independentInput as never,
      publication,
    );
    expect(
      await createServerOwnedSubmissionHandler(ctx, independentInput as never, publication),
    ).toEqual(independent);
    expect(independent).toMatchObject({ score: 2, maxScore: 2 });
    const result = await submitIm3PublishedEvidenceHandler(
      ctx,
      {
        learnerId: "student",
        submissionId: independent.submissionId,
      } as never,
      publication,
    );
    const replay = await submitIm3PublishedEvidenceHandler(
      ctx,
      {
        learnerId: "student",
        submissionId: independent.submissionId,
      } as never,
      publication,
    );

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: { eligible: true },
    });
    expect(replay).toEqual({ ...result, delivery: "replay" });
    expect(tables.activity_submissions).toHaveLength(3);
    expect(tables.learning_evidence.map((row) => row.origin)).toEqual([
      "teacher_led",
      "mastery_advantage",
    ]);
    expect(tables.srs_cards).toHaveLength(1);
    expect(tables.srs_review_log).toHaveLength(1);
  });
});
