import { describe, expect, it, vi } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import { createServerOwnedSubmissionHandler } from "@/convex/activities";
import {
  recordIm3GraphTeacherExposureHandler,
  submitIm3PublishedEvidenceHandler,
} from "@/convex/learningEvidence";
import { buildIm3GuidedPilotSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const publication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};

function memoryContext() {
  const guided = buildIm3GuidedPilotSeedDocuments(
    "guided" as never,
    1,
  ).activity;
  const tables: Record<string, Array<Record<string, any>>> = {
    profiles: [
      { _id: "teacher", role: "teacher", organizationId: "org" },
      {
        _id: "student",
        username: "student",
        role: "student",
        organizationId: "org",
      },
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
    classes: [
      { _id: "class", teacherId: "teacher", name: "IM3", archived: false },
    ],
    class_enrollments: [
      {
        _id: "enrollment",
        classId: "class",
        studentId: "student",
        status: "active",
        enrolledAt: 1,
      },
    ],
    lessons: [
      {
        _id: "lesson",
        slug: "module-1-lesson-1",
        title: "Quadratic Functions",
      },
    ],
    class_lessons: [
      {
        _id: "assignment",
        classId: "class",
        lessonId: "lesson",
        assignedAt: 1,
      },
    ],
    lesson_versions: [
      { _id: "version", lessonId: "lesson", version: 1, status: "published" },
    ],
    phase_versions: [
      {
        _id: "phase",
        lessonVersionId: "version",
        phaseType: "worked_example",
      },
    ],
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
      {
        _id: "guided",
        ...guided,
        srsEligible: true,
        approval: { status: "approved" },
      },
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
      first: async () =>
        direction === "desc" ? (rows.at(-1) ?? null) : (rows[0] ?? null),
      collect: async () => rows,
      take: async (limit: number) => rows.slice(0, limit),
      order(next: string) {
        direction = next;
        return result;
      },
    };
    return {
      withIndex: (
        _name: string,
        configure: (value: typeof index) => unknown,
      ) => {
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
  const runQuery = async (
    _reference: unknown,
    args: { studentId: string; variantKey: string },
  ) => {
    const row = tables.srs_cards.find(
      (candidate) =>
        candidate.studentId === args.studentId &&
        candidate.variantKey === args.variantKey,
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
  return {
    ctx: {
      db: { query, get, insert, patch, replace },
      runQuery,
      scheduler: { runAfter: vi.fn(async () => undefined) },
    } as unknown as MutationCtx,
    tables,
  };
}

async function runGuidedEvidence(options: {
  hintsUsed: number;
  revealStepsSeen?: number;
  timing?: {
    startedAt: string;
    submittedAt: string;
    wallClockMs: number;
    activeMs: number;
    idleMs: number;
    pauseCount: number;
    focusLossCount: number;
    visibilityHiddenCount: number;
    confidence: "low" | "medium" | "high";
  };
  inspectTables?: (tables: Record<string, Array<Record<string, any>>>) => void;
  mutateStoredGuided?: (input: {
    activity: Record<string, any>;
    submission: Record<string, any>;
  }) => void;
  evidenceLearnerId?: string;
}) {
  vi.spyOn(Date, "now").mockReturnValue(10);
  const { ctx, tables } = memoryContext();
  options.inspectTables?.(tables);
  const worked = await createServerOwnedSubmissionHandler(
    ctx,
    {
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
    } as never,
    publication,
  );
  await recordIm3GraphTeacherExposureHandler(
    ctx,
    {
      teacherId: "teacher",
      studentId: "student",
      classId: "class",
      submissionId: worked.submissionId,
      idempotencyKey: "teacher-key",
    } as never,
    publication,
  );

  const points = [
    { x: -2, y: 4 },
    { x: -1, y: 0 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
    { x: 2, y: 0 },
  ];
  const assistance = {
    hintsUsed: options.hintsUsed,
    ...(options.revealStepsSeen === undefined
      ? {}
      : { revealStepsSeen: options.revealStepsSeen }),
  };
  const guided = await createServerOwnedSubmissionHandler(
    ctx,
    {
      userId: "student",
      activityId: "guided",
      idempotencyKey: "guided-key",
      submissionData: {
        contractVersion: "practice.v1",
        activityId: "guided",
        mode: "guided_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: new Date(10).toISOString(),
        answers: { table_values: points, placed_points: points },
        parts: [
          { partId: "table_values", rawAnswer: points, hintsUsed: 0 },
          { partId: "placed_points", rawAnswer: points, ...assistance },
        ],
        ...(options.timing === undefined ? {} : { timing: options.timing }),
      },
    } as never,
    publication,
  );
  const stored = tables.activity_submissions.find(
    (row) => row._id === guided.submissionId,
  );
  expect(stored?.submissionData.parts).toEqual([
    expect.objectContaining({
      partId: "table_values",
      isCorrect: true,
      hintsUsed: 0,
    }),
    expect.objectContaining({
      partId: "placed_points",
      isCorrect: true,
      ...assistance,
    }),
  ]);
  options.mutateStoredGuided?.({
    activity: tables.activities.find((row) => row._id === "guided")!,
    submission: stored!,
  });

  const args = {
    learnerId: options.evidenceLearnerId ?? "student",
    submissionId: guided.submissionId,
  } as never;
  const result = await submitIm3PublishedEvidenceHandler(
    ctx,
    args,
    publication,
  );
  const replay = await submitIm3PublishedEvidenceHandler(
    ctx,
    args,
    publication,
  );
  expect(replay).toEqual({ ...result, delivery: "replay" });
  if (!tables.srs_review_log[0]) throw new Error("No SRS review was written");
  expect(tables.srs_cards).toHaveLength(1);
  expect(tables.srs_review_log).toHaveLength(1);
  return { result, review: tables.srs_review_log[0] };
}

describe("IM3 assisted Guided evidence", () => {
  it.each([
    { label: "two hints", hintsUsed: 2, rating: "Good", reason: "hints_1_2" },
    {
      label: "three hints",
      hintsUsed: 3,
      rating: "Hard",
      reason: "hints_3_plus",
    },
  ])(
    "retains $label and applies its normative cap",
    async ({ hintsUsed, rating, reason }) => {
      const { result, review } = await runGuidedEvidence({ hintsUsed });
      expect(result).toMatchObject({ masteryApplied: true, kstApplied: true });
      expect(review).toMatchObject({
        rating,
        evidence: expect.objectContaining({
          reasons: expect.arrayContaining([reason]),
        }),
      });
    },
  );

  it("rejects unsupported stored reveal telemetry without an SRS write", async () => {
    let tables: Record<string, Array<Record<string, any>>> | undefined;
    const attempt = runGuidedEvidence({
      hintsUsed: 0,
      mutateStoredGuided: ({ submission }) => {
        submission.submissionData.parts[1].revealStepsSeen = 1;
      },
      inspectTables: (value) => {
        tables = value;
      },
    });
    await expect(attempt).rejects.toThrow();
    expect(tables?.srs_cards).toEqual([]);
    expect(tables?.srs_review_log).toEqual([]);
  });

  it("does not let untrusted timing telemetry change the rating", async () => {
    const withoutTiming = await runGuidedEvidence({ hintsUsed: 0 });
    const withTiming = await runGuidedEvidence({
      hintsUsed: 0,
      timing: {
        startedAt: new Date(0).toISOString(),
        submittedAt: new Date(10).toISOString(),
        wallClockMs: 10,
        activeMs: 1,
        idleMs: 9,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: "high",
      },
    });
    expect(withTiming.review.rating).toBe(withoutTiming.review.rating);
    expect(withTiming.review.evidence.reasons).toContain("timing_absent");
  });

  it.each([
    {
      label: "learner ownership",
      options: { evidenceLearnerId: "teacher" },
    },
    {
      label: "node identity",
      options: {
        mutateStoredGuided: ({
          activity,
        }: {
          activity: Record<string, any>;
        }) => {
          activity.masteryNodeId = "math.im3.skill.other";
        },
      },
    },
    {
      label: "aggregate grade parity",
      options: {
        mutateStoredGuided: ({
          submission,
        }: {
          submission: Record<string, any>;
        }) => {
          submission.score = 1;
        },
      },
    },
  ])(
    "rejects invalid stored $label without an SRS write",
    async ({ options }) => {
      let tables: Record<string, Array<Record<string, any>>> | undefined;
      const attempt = runGuidedEvidence({
        hintsUsed: 0,
        ...options,
        inspectTables: (value) => {
          tables = value;
        },
      });
      await expect(attempt).rejects.toThrow();
      expect(tables?.srs_cards).toEqual([]);
      expect(tables?.srs_review_log).toEqual([]);
    },
  );
});
