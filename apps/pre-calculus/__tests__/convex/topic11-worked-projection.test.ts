import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pageMocks = vi.hoisted(() => ({
  lesson: null as any,
  worked: null as any,
  state: "needs_acknowledgement" as string | null,
  pilot: [] as any[],
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: vi
    .fn()
    .mockResolvedValue({ sub: "profiles:student", role: "student" }),
}));
vi.mock("@/lib/convex/server", () => ({
  internal: {
    course: { getLesson: "course:getLesson" },
    activities: {
      getApprovedTopic11WorkedSource: "activities:getApprovedTopic11WorkedSource",
      getTopic11LearnerDeliveryState: "activities:getTopic11LearnerDeliveryState",
      getApprovedPrecalculusPilot: "activities:getApprovedPrecalculusPilot",
    },
  },
  fetchInternalQuery: vi.fn((ref: string) =>
    Promise.resolve(
      ref === "course:getLesson"
        ? pageMocks.lesson
        : ref === "activities:getApprovedTopic11WorkedSource"
          ? pageMocks.worked
          : ref === "activities:getTopic11LearnerDeliveryState"
            ? pageMocks.state
            : pageMocks.pilot,
    ),
  ),
}));

import blueprintsDocument from "@/curriculum/skill-graph/blueprints.json";
import nodesDocument from "@/curriculum/skill-graph/nodes.json";
import {
  getApprovedTopic11WorkedSourceHandler,
  PRECALCULUS_PILOT_COMPONENT_KEY,
} from "@/convex/activities";
import { getLesson } from "@/convex/course";
import { seedLesson1_1 } from "@/convex/seed/seed_lesson_1_1";
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, any> & { _id: string };

function harness() {
  const rows: Record<string, Row[]> = {
    lessons: [],
    lesson_versions: [],
    phase_versions: [],
    phase_sections: [],
    activities: [],
    profiles: [{ _id: "profiles:student", role: "student" }],
    lesson_responses: [],
  };
  const db = {
    get: async (...args: string[]) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === args.at(-1)) ?? null,
    query: (table: string) => ({
      withIndex: (_name: string, configure: (query: any) => unknown) => {
        const filters = new Map<string, unknown>();
        const query = {
          eq(field: string, value: unknown) {
            filters.set(field, value);
            return query;
          },
        };
        configure(query);
        const matches = () =>
          (rows[table] ?? []).filter((row) =>
            [...filters].every(([key, value]) => row[key] === value),
          );
        const result: any = {
          collect: async () => matches(),
          first: async () => matches()[0] ?? null,
          unique: async () => {
            const found = matches();
            if (found.length > 1) throw new Error("duplicate");
            return found[0] ?? null;
          },
          take: async (count: number) => matches().slice(0, count),
          order: () => result,
        };
        return result;
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const target = rows[table] ?? (rows[table] = []);
      const id = `${table}:${target.length + 1}`;
      target.push({ _id: id, ...document });
      return id;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      const row = Object.values(rows)
        .flat()
        .find((candidate) => candidate._id === id);
      if (!row) throw new Error(`Missing ${id}`);
      Object.assign(row, document);
    },
  };
  return { db, rows };
}

function handler<T>(value: unknown) {
  return Reflect.get(value as object, "_handler") as (ctx: any, args: any) => Promise<T>;
}

function approvedPublication() {
  const nodes = structuredClone(nodesDocument.nodes);
  const blueprints = structuredClone(blueprintsDocument.blueprints);
  nodes.find((node) => node.id === PRECALCULUS_PILOT_NODE_ID)!.reviewStatus = "approved";
  blueprints.find((row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID)!.reviewStatus = "approved";
  return { nodes, blueprints };
}

describe("Topic 1.1 selected Worked projection", () => {
  afterEach(() => cleanup());
  it("connects the real seed, exact projection, and real lesson query", async () => {
    const state = harness();
    await handler(seedLesson1_1)({ db: state.db }, {});
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never),
    ).resolves.toBeNull();

    const source = state.rows.activities.find(
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    )!;
    source.approval = {
      status: "approved",
      reviewerId: "profiles:reviewer",
      reviewedAt: Date.now(),
    };
    state.rows.activities = state.rows.activities.filter(
      (row) => row === source || row.componentKey !== PRECALCULUS_PILOT_COMPONENT_KEY,
    );
    const publication = approvedPublication();
    const projected = await getApprovedTopic11WorkedSourceHandler(
      { db: state.db } as never,
      publication,
    );
    expect(projected).toMatchObject({
      activityId: source._id,
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      mode: "worked_example",
    });
    expect(projected?.props).toEqual(
      publication.blueprints.find((row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID)!
        .workedExampleSpec!.rendererProps,
    );

    const lesson = await handler<any>(getLesson)(
      { db: state.db },
      { learnerId: "profiles:student", unit: 1, topic: 1 },
    );
    const sourceSection = lesson.phases
      .flatMap((phase: any) => phase.sections)
      .find((section: any) => section.content?.activityId === source._id);
    expect(sourceSection).toMatchObject({
      sequenceOrder: 2,
      content: {
        activityId: projected?.activityId,
        componentKey: projected?.componentKey,
      },
    });

    pageMocks.lesson = lesson;
    pageMocks.worked = projected;
    const { default: LessonPage } = await import("@/app/student/lessons/[topic]/page");
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(screen.getByTestId("precalc-topic-1-1-daily")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Worked Example: Classify Graph Intervals",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Increasing: \[0,3\] and \[7,9\]/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Mark worked example reviewed" }),
    ).toBeInTheDocument();

    cleanup();
    pageMocks.worked = null;
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(screen.getByText("This worked example is not available.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark worked example reviewed" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("precalc-topic-1-1-daily")).not.toBeInTheDocument();

    cleanup();
    pageMocks.worked = projected;
    pageMocks.state = "awaiting_teacher_confirmation";
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(screen.getByText(/wait for your teacher/i)).toBeInTheDocument();
    expect(screen.queryByTestId("precalc-topic-1-1-daily")).not.toBeInTheDocument();

    cleanup();
    pageMocks.state = "ready_for_practice";
    const selectedBlueprint = publication.blueprints.find(
      (row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID,
    )!;
    pageMocks.pilot = [
      {
        mode: "guided_practice",
        stableActivityId: `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`,
        props: selectedBlueprint.guidedPracticeSpec!.rendererProps,
      },
      {
        mode: "independent_practice",
        stableActivityId: `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`,
        props: selectedBlueprint.independentPracticeSpec!.rendererProps,
      },
    ];
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(screen.queryByTestId("precalc-topic-1-1-daily")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Guided Practice: Classify Graph Intervals" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Independent Practice: Classify Graph Intervals" }),
    ).toBeInTheDocument();

    cleanup();
    pageMocks.pilot = pageMocks.pilot.filter((item) => item.mode === "guided_practice");
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(
      screen.getByRole("heading", { name: "Guided Practice: Classify Graph Intervals" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Independent Practice: Classify Graph Intervals" }),
    ).not.toBeInTheDocument();

    cleanup();
    pageMocks.state = null;
    render(await LessonPage({ params: Promise.resolve({ topic: "1.1" }) }));
    expect(screen.getByText("This worked example is not available.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark worked example reviewed" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Guided Practice: Classify Graph Intervals" }),
    ).not.toBeInTheDocument();

    state.rows.lesson_versions.push({
      _id: "lesson_versions:draft",
      lessonId: state.rows.lessons[0]!._id,
      version: 3,
      status: "draft",
      createdAt: Date.now() + 1,
    });
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toMatchObject({ activityId: source._id });
  });

  it("fails closed for phase ownership, duplicate rows, and incomplete graph publication", async () => {
    const state = harness();
    await handler(seedLesson1_1)({ db: state.db }, {});
    const source = state.rows.activities.find(
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    )!;
    source.approval = { status: "approved" };
    const publication = approvedPublication();
    const blueprint = publication.blueprints.find(
      (row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID,
    )!;

    const incomplete = structuredClone(publication);
    delete incomplete.blueprints.find((row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID)!
      .guidedPracticeSpec;
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, incomplete),
    ).resolves.toBeNull();

    const changedBlueprint = structuredClone(publication);
    const changedWorkedBlueprint = changedBlueprint.blueprints.find(
      (row) => row.nodeId === PRECALCULUS_PILOT_NODE_ID,
    );
    if (!changedWorkedBlueprint?.workedExampleSpec) {
      throw new Error("Expected the selected Worked blueprint");
    }
    changedWorkedBlueprint.workedExampleSpec.rendererProps.title = "Changed source";
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, changedBlueprint),
    ).resolves.toBeNull();

    const originalProps = structuredClone(source.props);
    source.props = { ...source.props, source: "changed" };
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toBeNull();
    source.props = originalProps;

    const currentVersion = state.rows.lesson_versions.find((row) => row.status === "published")!;
    state.rows.lesson_versions.push({
      ...structuredClone(currentVersion),
      _id: "lesson_versions:duplicate",
    });
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toBeNull();
    state.rows.lesson_versions.pop();

    const phase = state.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    phase.phaseNumber = 5;
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toBeNull();
    phase.phaseNumber = 4;
    const section = state.rows.phase_sections.find(
      (row) => row.content?.activityId === source._id,
    )!;
    section.sequenceOrder = 3;
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toBeNull();
    section.sequenceOrder = 2;

    state.rows.activities.push({
      ...structuredClone(source),
      _id: "activities:duplicate",
    });
    await expect(
      getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, publication),
    ).resolves.toBeNull();
    expect(blueprint.workedExampleSpec).toBeDefined();
  });
});

describe("parent source ownership regressions", () => {
  it.each(["cross-phase link", "duplicate Worked phase", "occupied sequence"])(
    "rejects %s even when one exact source link remains",
    async (kind) => {
      const state = harness();
      await handler(seedLesson1_1)({ db: state.db }, {});
      const source = state.rows.activities.find(
        (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      )!;
      source.approval = { status: "approved" };
      const phase = state.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
      const section = state.rows.phase_sections.find(
        (row) => row.content?.activityId === source._id,
      )!;
      if (kind === "cross-phase link") {
        const other = state.rows.phase_versions.find((row) => row.phaseNumber === 3)!;
        state.rows.phase_sections.push({
          ...structuredClone(section),
          _id: "sections:cross-phase",
          phaseVersionId: other._id,
        });
      } else if (kind === "duplicate Worked phase") {
        state.rows.phase_versions.push({ ...structuredClone(phase), _id: "phases:duplicate" });
      } else {
        state.rows.phase_sections.push({
          ...structuredClone(section),
          _id: "sections:occupied",
          sectionType: "text",
          content: { markdown: "Unrelated section at the selected sequence." },
        });
      }
      await expect(
        getApprovedTopic11WorkedSourceHandler({ db: state.db } as never, approvedPublication()),
      ).resolves.toBeNull();
    },
  );
});
