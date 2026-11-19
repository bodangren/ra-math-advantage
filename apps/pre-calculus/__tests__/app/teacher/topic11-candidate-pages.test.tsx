import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const NODE = "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
const SOURCE = `${NODE}.worked_example`;
vi.mock("@/curriculum/skill-graph/nodes.json", async (importOriginal) => {
  const original = await importOriginal<{
    default: { nodes: Array<Record<string, unknown>> };
  }>();
  return {
    default: {
      nodes: original.default.nodes.map((node) =>
        node.id === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
          ? { ...node, reviewStatus: "approved" }
          : node,
      ),
    },
  };
});
vi.mock("@/curriculum/skill-graph/blueprints.json", async (importOriginal) => {
  const original = await importOriginal<{
    default: { blueprints: Array<Record<string, unknown>> };
  }>();
  return {
    default: {
      blueprints: original.default.blueprints.map((row) =>
        row.nodeId === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
          ? { ...row, reviewStatus: "approved" }
          : row,
      ),
    },
  };
});
const state = vi.hoisted(() => ({ ctx: null as any }));
vi.mock("@/lib/auth/server", () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue({ sub: "teacher" }),
  requireTeacherRequestClaims: vi.fn().mockResolvedValue({ sub: "teacher" }),
}));
vi.mock("@/lib/convex/server", async () => {
  const { getTopic11TeacherCandidatesHandler } = await import("@/convex/course");
  const { submitTopic11TeacherSubmission } = await import("@/convex/learningEvidence");
  const handler = (value: unknown) =>
    Reflect.get(value as object, "_handler") as (ctx: any, args: any) => Promise<any>;
  return {
    internal: {
      course: {
        getTeacherData: "teacher-data",
        getTopic11TeacherCandidates: "topic-candidates",
      },
      learningEvidence: { submitTopic11TeacherSubmission: "teacher-write" },
    },
    fetchInternalQuery: vi.fn(async (reference: string, args: any) =>
      reference === "topic-candidates"
        ? getTopic11TeacherCandidatesHandler(state.ctx, args)
        : {
            standards: [],
            enrollments: [],
            classes: [],
            students: [],
            lessons: [],
            assignments: [],
          },
    ),
    fetchInternalMutation: vi.fn(async (_reference: string, args: any) =>
      handler(submitTopic11TeacherSubmission)(state.ctx, args),
    ),
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { POST } from "@/app/api/teacher/course/route";
import TeacherDashboard from "@/app/teacher/dashboard/page";
import GradebookPage from "@/app/teacher/gradebook/page";
import { createTopic11DailySubmission } from "@/convex/activities";
import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from "@/lib/learning-evidence/precalc-pilot";
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
      },
      {
        _id: "student",
        username: "student-name",
        displayName: "Student One",
        role: "student",
        organizationId: "org",
      },
    ],
    auth_credentials: [
      {
        _id: "teacher-credential",
        profileId: "teacher",
        username: "teacher-name",
        role: "teacher",
        organizationId: "org",
        isActive: true,
      },
      {
        _id: "student-credential",
        profileId: "student",
        username: "student-name",
        role: "student",
        organizationId: "org",
        isActive: true,
      },
    ],
    classes: [{ _id: "class", teacherId: "teacher", name: "Period 1", archived: false }],
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
        unitNumber: 1,
        orderIndex: 1,
        title: "Change in Tandem",
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
      {
        _id: "version",
        lessonId: "lesson",
        version: 1,
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
        _id: "section",
        phaseVersionId: "phase",
        sequenceOrder: 2,
        sectionType: "activity",
        createdAt: 1,
        content: {
          activityId: "physical",
          componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        },
      },
    ],
    activities: [
      {
        _id: "physical",
        stableActivityId: SOURCE,
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description:
          "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
        approval: { status: "approved", reviewedAt: 1 },
        createdAt: 1,
        props: { nodeId: NODE, mode: "worked_example", source: "teacher_led" },
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
        unique: async () => {
          if (found.length > 1) throw new Error("duplicate");
          return found[0] ?? null;
        },
        collect: async () => found,
        first: async () => (direction === "desc" ? (found.at(-1) ?? null) : (found[0] ?? null)),
        order: (value: string) => {
          direction = value;
          return result;
        },
        take: async (limit: number) => found.slice(0, limit),
      };
      return {
        withIndex: (_name: string, apply: (value: any) => void) => {
          apply(query);
          return result;
        },
      };
    },
  };
  return { ctx: { db }, rows };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(10);
});

it.each([
  ["dashboard", TeacherDashboard],
  ["gradebook", GradebookPage],
])(
  "uses the real candidate query on the %s page after more than 100 unrelated submissions",
  async (_name, Page) => {
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
    rows.activity_submissions.push(
      ...Array.from({ length: 125 }, (_, index) => ({
        _id: `unrelated-${index}`,
        userId: "student",
        activityId: `other-${index}`,
        submittedAt: index + 11,
      })),
    );
    vi.stubGlobal("fetch", async (_input: RequestInfo | URL, init?: RequestInit) =>
      POST(new Request("http://local.test/api/teacher/course", init)),
    );
    const view = render(await Page());
    expect(screen.getByText("Student One")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Change in Tandem/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Class" })).toHaveValue("class");
    fireEvent.click(screen.getByRole("button", { name: "Confirm classroom introduction" }));
    await waitFor(() =>
      expect(screen.getByText("Classroom introduction confirmed.")).toBeInTheDocument(),
    );
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence[0]).toMatchObject({
      learnerId: "student",
      origin: "teacher_led",
      mode: "teaching",
      idempotencyKey: `precalc:teacher-led:submission:${acknowledgement.submissionId}`,
    });
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    view.unmount();
    render(await Page());
    expect(
      screen.getByText("No Topic 1.1 classroom introductions are waiting for confirmation."),
    ).toBeInTheDocument();
  },
);
