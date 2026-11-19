import { describe, expect, it, vi } from "vitest";

vi.mock("@/curriculum/skill-graph/nodes.json", () => ({
  default: {
    nodes: [
      {
        id: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        kind: "skill",
        reviewStatus: "approved",
      },
    ],
  },
}));
vi.mock("@/curriculum/skill-graph/blueprints.json", () => ({
  default: {
    blueprints: [
      {
        nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        reviewStatus: "approved",
      },
    ],
  },
}));

import { submitTopic11TeacherSubmission } from "@/convex/learningEvidence";
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from "@/convex/activities";

const handler = Reflect.get(submitTopic11TeacherSubmission as object, "_handler") as (
  context: unknown,
  args: Record<string, string>,
) => Promise<unknown>;

function harness() {
  const submittedAt = 100;
  const rows: Record<string, Array<Record<string, unknown> & { _id: string }>> = {
    profiles: [
      { _id: "teacher", role: "teacher", organizationId: "org-a" },
      { _id: "student", role: "student", organizationId: "org-a" },
    ],
    classes: [{ _id: "class", teacherId: "teacher", archived: false }],
    class_enrollments: [
      {
        _id: "enrollment",
        classId: "class",
        studentId: "student",
        status: "active",
        enrolledAt: 10,
      },
    ],
    lessons: [{ _id: "lesson", unitNumber: 1, orderIndex: 1 }],
    class_lessons: [{ _id: "assignment", classId: "class", lessonId: "lesson", assignedAt: 20 }],
    lesson_versions: [{ _id: "version", lessonId: "lesson", version: 1, status: "published" }],
    phase_versions: [{ _id: "phase", lessonVersionId: "version" }],
    phase_sections: [
      {
        _id: "section",
        phaseVersionId: "phase",
        sectionType: "activity",
        content: { activityId: "activity" },
      },
    ],
    activities: [
      {
        _id: "activity",
        stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        approval: { status: "approved" },
        props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: "worked_example", source: "teacher_led" },
      },
    ],
    activity_submissions: [
      {
        _id: "submission",
        userId: "student",
        activityId: "activity",
        stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
        attemptOrdinal: 1,
        submittedAt,
        submissionData: {
          contractVersion: "practice.v1",
          activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
          mode: "worked_example",
          status: "submitted",
          answers: {},
          parts: [],
        },
      },
    ],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const db = {
    get: async (...args: unknown[]) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === args.at(-1)) ?? null,
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}:${rows[table]!.length + 1}`;
      rows[table]!.push({ _id: id, ...value });
      return id;
    },
    query: (table: string) => {
      let selected = [...rows[table]!];
      const index = {
        eq(field: string, value: unknown) {
          selected = selected.filter((row) => row[field] === value);
          return index;
        },
        lte(field: string, value: unknown) {
          selected = selected.filter((row) => Number(row[field]) <= Number(value));
          return index;
        },
      };
      const result = {
        unique: async () => selected[0] ?? null,
        first: async () => selected[0] ?? null,
        collect: async () => selected,
        take: async (limit: number) => selected.slice(0, limit),
        order: () => result,
      };
      return {
        withIndex: (_name: string, configure: (query: typeof index) => unknown) => {
          configure(index);
          return result;
        },
      };
    },
  };
  return { context: { db }, rows };
}

const args = {
  teacherId: "teacher",
  learnerId: "student",
  classId: "class",
  submissionId: "submission",
};

describe("Topic 1.1 teacher publication authorization", () => {
  it("rejects a learner from a different organization", async () => {
    const { context, rows } = harness();
    rows.profiles[1]!.organizationId = "org-b";
    expect(await handler(context, args)).toEqual({
      accepted: false,
      reason: "submission_not_found",
    });
  });

  it.each([
    [
      "draft lesson version",
      (rows: ReturnType<typeof harness>["rows"]) => {
        rows.lesson_versions[0]!.status = "draft";
      },
    ],
    [
      "source absent from phase",
      (rows: ReturnType<typeof harness>["rows"]) => {
        rows.phase_sections[0]!.content = { activityId: "other" };
      },
    ],
  ])("rejects a %s", async (_name, change) => {
    const { context, rows } = harness();
    change(rows);
    expect(await handler(context, args)).toEqual({
      accepted: false,
      reason: "submission_not_found",
    });
  });

  it("accepts the exact source in a published assigned lesson phase", async () => {
    const { context } = harness();
    expect(await handler(context, args)).toMatchObject({
      persisted: true,
      decision: { reason: "teacher_led" },
    });
  });

  it("accepts the canonical stable source ID in the current published phase", async () => {
    const { context, rows } = harness();
    rows.phase_sections[0]!.content = { activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID };
    expect(await handler(context, args)).toMatchObject({
      persisted: true,
      decision: { reason: "teacher_led" },
    });
  });

  it("rejects a source that exists only in an older published version", async () => {
    const { context, rows } = harness();
    rows.lesson_versions.push({
      _id: "version-2",
      lessonId: "lesson",
      version: 2,
      status: "published",
    });
    rows.phase_versions.push({ _id: "phase-2", lessonVersionId: "version-2" });
    rows.phase_sections.push({
      _id: "section-2",
      phaseVersionId: "phase-2",
      sectionType: "activity",
      content: { activityId: "other" },
    });
    expect(await handler(context, args)).toEqual({
      accepted: false,
      reason: "submission_not_found",
    });
  });

  it("rejects duplicate physical activities for the canonical stable source ID", async () => {
    const { context, rows } = harness();
    rows.activities.push({ ...rows.activities[0]!, _id: "activity-duplicate" });
    expect(await handler(context, args)).toEqual({
      accepted: false,
      reason: "submission_not_found",
    });
  });
});
