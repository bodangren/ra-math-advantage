import { beforeEach, expect, it, vi } from "vitest";

vi.mock("@/curriculum/skill-graph/nodes.json", async () => ({
  default: (await import("@/__tests__/convex/topic11-approved-publication.fixture"))
    .TOPIC11_APPROVED_PUBLICATION.nodes,
}));
vi.mock("@/curriculum/skill-graph/blueprints.json", async () => ({
  default: (await import("@/__tests__/convex/topic11-approved-publication.fixture"))
    .TOPIC11_APPROVED_PUBLICATION.blueprints,
}));
const state = vi.hoisted(() => ({ ctx: null as any }));
vi.mock("@/lib/auth/server", () => ({
  requireTeacherRequestClaims: vi.fn().mockResolvedValue({ sub: "teacher" }),
}));
vi.mock("@/lib/convex/server", async () => {
  const writer = await import("@/convex/selectedLearningEvidence");
  return {
    internal: { selectedLearningEvidence: { submitTopic11TeacherSubmission: "writer" } },
    fetchInternalMutation: (_reference: string, args: unknown) =>
      (writer.submitTopic11TeacherSubmission as any)._handler(state.ctx, args),
  };
});

import { POST } from "@/app/api/teacher/course/route";
import {
  createTopic11DailySubmission,
  getTopic11LearnerDeliveryStateHandler,
} from "@/convex/activities";
import { getTopic11TeacherCandidatesHandler } from "@/convex/course";
import {
  PRECALCULUS_PILOT_NODE_ID as NODE,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID as SOURCE,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY as COMPONENT,
} from "@/lib/learning-evidence/precalc-pilot";
import { TOPIC11_APPROVED_PUBLICATION } from "@/__tests__/convex/topic11-approved-publication.fixture";

const publication = {
  nodes: TOPIC11_APPROVED_PUBLICATION.nodes.nodes,
  blueprints: TOPIC11_APPROVED_PUBLICATION.blueprints.blueprints,
};
const handler = (value: unknown) =>
  Reflect.get(value as object, "_handler") as (ctx: any, args: any) => Promise<any>;
function database() {
  const rows: Record<string, any[]> = {
    profiles: [
      {
        _id: "teacher",
        username: "teacher-name",
        role: "teacher",
        organizationId: "org",
        createdAt: 1,
        updatedAt: 1,
      },
      {
        _id: "student",
        username: "student-name",
        displayName: "Student One",
        role: "student",
        organizationId: "org",
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    auth_credentials: [
      {
        _id: "tc",
        profileId: "teacher",
        username: "teacher-name",
        role: "teacher",
        organizationId: "org",
        passwordHash: "hash",
        passwordSalt: "salt",
        passwordHashIterations: 1,
        isActive: true,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        _id: "sc",
        profileId: "student",
        username: "student-name",
        role: "student",
        organizationId: "org",
        passwordHash: "hash",
        passwordSalt: "salt",
        passwordHashIterations: 1,
        isActive: true,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    classes: [
      {
        _id: "class",
        teacherId: "teacher",
        name: "Period 1",
        archived: false,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    class_enrollments: [
      {
        _id: "enrollment",
        classId: "class",
        studentId: "student",
        status: "active",
        enrolledAt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    lessons: [
      {
        _id: "lesson",
        unitNumber: 1,
        orderIndex: 1,
        title: "Change in Tandem",
        slug: "1-1-change-in-tandem",
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    class_lessons: [
      { _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 1, createdAt: 1 },
    ],
    lesson_versions: [
      {
        _id: "version",
        lessonId: "lesson",
        version: 2,
        status: "published",
        title: "Change in Tandem",
        createdAt: 1,
      },
    ],
    phase_versions: [
      {
        _id: "phase",
        lessonVersionId: "version",
        phaseNumber: 4,
        phaseType: "worked_example",
        createdAt: 1,
      },
    ],
    phase_sections: [
      {
        _id: "text",
        phaseVersionId: "phase",
        sequenceOrder: 1,
        sectionType: "text",
        createdAt: 1,
        content: { markdown: "Accepted ordinary Worked body." },
      },
      {
        _id: "source-link",
        phaseVersionId: "phase",
        sequenceOrder: 2,
        sectionType: "activity",
        createdAt: 1,
        content: { activityId: "physical", componentKey: COMPONENT },
      },
    ],
    activities: [
      {
        _id: "physical",
        stableActivityId: SOURCE,
        componentKey: COMPONENT,
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description:
          "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
        approval: { status: "approved", reviewedAt: 1 },
        createdAt: 1,
        updatedAt: 1,
        props: { nodeId: NODE, mode: "worked_example", source: "teacher_led" },
        gradingConfig: { variantSeed: 0 },
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
    student_competency: [],
  };
  const db: any = {
    get: async (...args: any[]) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === args.at(-1)) ?? null,
    insert: async (table: string, value: any) => {
      const id = `${table}:${rows[table].length + 1}`;
      rows[table].push({ _id: id, ...value });
      return id;
    },
    query: (table: string) => {
      let found = [...rows[table]];
      let direction = "asc";
      const query: any = {
        eq(field: string, value: unknown) {
          found = found.filter((row) => row[field] === value);
          return query;
        },
        lte(field: string, value: number) {
          found = found.filter((row) => row[field] <= value);
          return query;
        },
      };
      const result: any = {
        collect: async () => found,
        take: async (limit: number) => found.slice(0, limit),
        unique: async () => {
          if (found.length > 1) throw new Error("duplicate");
          return found[0] ?? null;
        },
        first: async () => (direction === "desc" ? (found.at(-1) ?? null) : (found[0] ?? null)),
        order(value: string) {
          direction = value;
          return result;
        },
      };
      return {
        withIndex: (_name: string, apply: (query: any) => void) => {
          apply(query);
          return result;
        },
      };
    },
  };
  return { ctx: { db }, rows };
}

beforeEach(() => vi.spyOn(Date, "now").mockReturnValue(10));

it("moves the real mixed-phase acknowledgement from waiting to ready through the selected route writer", async () => {
  const { ctx, rows } = database();
  state.ctx = ctx;
  const acknowledgement = await handler(createTopic11DailySubmission)(ctx, {
    userId: "student",
    activityId: SOURCE,
    idempotencyKey: "ack",
    submissionData: {
      contractVersion: "practice.v1",
      activityId: SOURCE,
      mode: "worked_example",
      status: "submitted",
      answers: {},
      parts: [],
    },
  });
  await expect(
    getTopic11LearnerDeliveryStateHandler(
      ctx as never,
      { learnerId: "student" } as never,
      publication as never,
    ),
  ).resolves.toBe("awaiting_teacher_confirmation");
  await expect(
    getTopic11TeacherCandidatesHandler(
      ctx as never,
      { teacherId: "teacher" } as never,
      publication as never,
    ),
  ).resolves.toHaveLength(1);
  const response = await POST(
    new Request("http://local.test/api/teacher/course", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "recordTopic11Exposure",
        classId: "class",
        studentId: "student",
        submissionId: acknowledgement.submissionId,
      }),
    }),
  );
  expect(await response.json()).toEqual({ delivery: "new" });
  await expect(
    getTopic11TeacherCandidatesHandler(
      ctx as never,
      { teacherId: "teacher" } as never,
      publication as never,
    ),
  ).resolves.toEqual([]);
  await expect(
    getTopic11LearnerDeliveryStateHandler(
      ctx as never,
      { learnerId: "student" } as never,
      publication as never,
    ),
  ).resolves.toBe("ready_for_practice");
  expect(rows.learning_evidence).toHaveLength(1);
  expect(rows.student_competency).toHaveLength(0);
  expect(rows.srs_cards).toHaveLength(0);
  expect(rows.srs_review_log).toHaveLength(0);
});
