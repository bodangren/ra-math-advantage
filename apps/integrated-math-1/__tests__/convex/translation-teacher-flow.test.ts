import { afterEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import type { Id } from "@/convex/_generated/dataModel";
import { generateIM1VerbalToNumericalOutput } from "@math-platform/math-content/knowledge-space";

vi.mock("@/curriculum/skill-graph/nodes.json", () => ({
  default: {
    nodes: [
      {
        id: "math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express",
        kind: "skill",
        reviewStatus: "approved",
        independentPracticeReady: true,
      },
    ],
  },
}));
vi.mock("@/curriculum/skill-graph/blueprints.json", () => ({
  default: {
    blueprints: [
      {
        nodeId: "math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express",
        reviewStatus: "approved",
      },
    ],
  },
}));
import {
  getTeacherTranslationExposureCandidates,
  IM1_TRANSLATION_NODE_ID as nodeId,
  recordTeacherTranslationExposureHandler,
  submitTranslationPilotHandler,
} from "@/convex/activities";

type Row = Record<string, unknown>;
function store() {
  const rows: Record<string, Row[]> = {
    profiles: [
      { _id: "teacher", role: "teacher" },
      { _id: "student", role: "student", displayName: "Ari" },
    ],
    auth_credentials: [{ profileId: "student", isActive: true }],
    classes: [{ _id: "class", teacherId: "teacher", name: "Algebra", archived: false }],
    lessons: [{ _id: "lesson", slug: "module-1-lesson-1", title: "Expressions" }],
    class_lessons: [{ classId: "class", lessonId: "lesson", assignedAt: 0 }],
    class_enrollments: [
      { classId: "class", studentId: "student", status: "active", enrolledAt: 0 },
    ],
    activities: ["guided_practice", "independent_practice"].map((mode, index) => ({
      _id: mode,
      stableActivityId: `${nodeId}.${mode}`,
      masteryNodeId: nodeId,
      learningEvidenceMode: mode,
      componentKey: "fill-in-the-blank",
      approval: { status: "approved" },
      generatorSeed: index ? 1103 : 1110,
      generatorDifficulty: 1,
      srsEligible: true,
    })),
    activity_submissions: [],
    learning_evidence: [],
    srs_cards: [],
    srs_review_log: [],
  };
  let sequence = 0;
  const db = {
    get: async (id: string) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: string) => ({
      withIndex(_name: string, build: (query: unknown) => void) {
        let matches = [...rows[table]];
        const query = {
          eq(field: string, value: unknown) {
            matches = matches.filter((row) => row[field] === value);
            return query;
          },
        };
        build(query);
        const result = {
          collect: async () => matches,
          unique: async () => {
            if (matches.length > 1) throw new Error("Not unique");
            return matches[0] ?? null;
          },
          first: async () => matches[0] ?? null,
          order: (order: string) => {
            matches.sort(
              (a, b) =>
                (Number(a.attemptOrdinal ?? 0) - Number(b.attemptOrdinal ?? 0)) *
                (order === "desc" ? -1 : 1),
            );
            return result;
          },
        };
        return result;
      },
    }),
    insert: async (table: string, value: Row) => {
      const id = `${table}_${++sequence}`;
      rows[table].push({ _id: id, ...value });
      return id;
    },
    patch: async (id: string, value: Row) => {
      Object.assign(
        Object.values(rows)
          .flat()
          .find((row) => row._id === id)!,
        value,
      );
    },
  };
  return { rows, ctx: { db } as unknown as MutationCtx };
}
const candidates = (ctx: MutationCtx) =>
  (
    getTeacherTranslationExposureCandidates as unknown as {
      _handler: (
        ctx: QueryCtx,
        args: { teacherId: Id<"profiles"> },
      ) => Promise<Array<{ submissionId: string; answer: string }>>;
    }
  )._handler(ctx, { teacherId: "teacher" as Id<"profiles"> });
const attempt = (ctx: MutationCtx, mode: "guided_practice" | "independent_practice", key: string) =>
  submitTranslationPilotHandler(ctx, {
    userId: "student" as Id<"profiles">,
    activityId: mode as Id<"activities">,
    idempotencyKey: key,
    rawResponse: (
      generateIM1VerbalToNumericalOutput({
        nodeId,
        seed: mode === "guided_practice" ? 1110 : 1103,
        difficulty: 1,
      }).data.acceptedExpressions as string[]
    )[0],
    hintsUsed: 0,
    revealStepsSeen: 0,
  });
afterEach(() => vi.useRealTimers());

describe("real IM1 Guided and teacher history flow", () => {
  it("keeps student history, lists the actual source, attests once, and applies later Independent evidence", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T00:00:00Z"));
    const { rows, ctx } = store();
    const guided = await attempt(ctx, "guided_practice", "guided");
    expect(rows.learning_evidence).toHaveLength(1);
    expect((await candidates(ctx)).map((row) => row.submissionId)).toEqual([guided.submissionId]);
    const teacherArgs = {
      teacherId: "teacher" as Id<"profiles">,
      studentId: "student" as Id<"profiles">,
      classId: "class" as Id<"classes">,
      submissionId: guided.submissionId,
      idempotencyKey: "teacher",
    };
    await recordTeacherTranslationExposureHandler(ctx, teacherArgs);
    expect(rows.learning_evidence.map((row) => row.origin)).toEqual([
      "mastery_advantage",
      "teacher_led",
    ]);
    expect(await candidates(ctx)).toEqual([]);
    expect(await attempt(ctx, "guided_practice", "guided")).toEqual(guided);
    expect((await recordTeacherTranslationExposureHandler(ctx, teacherArgs)).replay).toBe(true);
    vi.setSystemTime(new Date("2026-09-07T00:01:00Z"));
    expect(await attempt(ctx, "independent_practice", "independent")).toMatchObject({
      masteryBearing: true,
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    await attempt(ctx, "independent_practice", "independent");
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it.each([
    { masteryNodeId: "other-node" },
    { learningEvidenceMode: "independent_practice" },
    { componentKey: "other-component" },
  ])("does not list a stored source with mismatched identity: %j", async (mismatch) => {
    const { rows, ctx } = store();
    await attempt(ctx, "guided_practice", "guided");
    Object.assign(rows.activities[0], mismatch);
    expect(await candidates(ctx)).toEqual([]);
  });
});
