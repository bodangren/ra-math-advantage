import { describe, expect, it, vi } from "vitest";
import { getLesson, getLessons, saveResponse } from "@/convex/course";
import { seedLesson1_1 } from "@/convex/seed/seed_lesson_1_1";
const h = (x: unknown) =>
  Reflect.get(x as object, "_handler") as (ctx: any, args: any) => Promise<any>;
function fixture() {
  const rows: any = {
    profiles: [
      { _id: "s", username: "student", role: "student", organizationId: "org" },
    ],
    auth_credentials: [
      {
        _id: "cred",
        profileId: "s",
        username: "student",
        role: "student",
        organizationId: "org",
        isActive: true,
      },
    ],
    lessons: [{ _id: "lesson", unitNumber: 1, orderIndex: 1, title: "Lesson" }],
    lesson_versions: [
      {
        _id: "version",
        lessonId: "lesson",
        version: 1,
        status: "published",
        title: "Rates",
      },
    ],
    phase_versions: [
      {
        _id: "phase",
        lessonVersionId: "version",
        phaseNumber: 4,
        title: "Worked example",
      },
    ],
    activities: [],
    phase_sections: [
      {
        _id: "section",
        phaseVersionId: "phase",
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          activityId: "physical",
          componentKey: "precalculus-topic-1-1-daily-curriculum",
          props: { finalAnswer: "private" },
          gradingConfig: { answerKey: "private" },
          answer: "private",
        },
      },
    ],
    lesson_responses: [],
  };
  const db: any = {
    patch: async (id: string, value: any) => {
      const row = Object.values(rows)
        .flat()
        .find((x: any) => x._id === id) as any;
      if (!row) throw Error("missing");
      Object.assign(row, value);
    },
    get: async (table: string, id: string) =>
      rows[table]?.find((x: any) => x._id === id) ?? null,
    insert: async (table: string, value: any) => {
      const id = `${table}:${rows[table].length + 1}`;
      rows[table].push({ _id: id, ...value });
      return id;
    },
    query: (table: string) => {
      let v = [...(rows[table] ?? [])];
      const q: any = {
        eq: (f: string, x: unknown) => {
          v = v.filter((r: any) => r[f] === x);
          return q;
        },
      };
      const out: any = {
        collect: async () => v,
        take: async (n: number) => v.slice(0, n),
        first: async () => v[0] ?? null,
        unique: async () => {
          if (v.length > 1) throw Error("duplicate");
          return v[0] ?? null;
        },
        order: () => out,
      };
      return {
        withIndex: (_n: string, apply: any) => {
          apply(q);
          return out;
        },
      };
    },
  };
  return { rows, ctx: { db } };
}
describe("selected lesson course boundary", () => {
  it("returns the hypothetical selected section identity without activity props or another learner history", async () => {
    const { rows, ctx } = fixture();
    rows.lesson_responses.push(
      {
        _id: "mine",
        learnerId: "s",
        phaseId: "phase",
        response: "My work",
        createdAt: 1,
      },
      {
        _id: "other",
        learnerId: "other",
        phaseId: "phase",
        response: "Secret",
        createdAt: 1,
      },
    );
    const value = await h(getLesson)(ctx, {
      learnerId: "s",
      unit: 1,
      topic: 1,
    });
    expect(value.phases[0].sections[0].content).toEqual({
      activityId: "physical",
      componentKey: "precalculus-topic-1-1-daily-curriculum",
    });
    expect(value.phases[0].responses.map((x: any) => x.response)).toEqual([
      "My work",
    ]);
    expect(JSON.stringify(value)).not.toMatch(
      /Secret|gradingConfig|finalAnswer|answerKey/,
    );
    expect(await h(getLessons)(ctx, { learnerId: "s" })).toEqual([
      { id: "lesson", topic: "1.1", title: "Rates" },
    ]);
  });

  it("projects safe fields from the actual legacy seed nested activity section", async () => {
    const seeded = fixture();
    seeded.rows.lessons = [];
    seeded.rows.lesson_versions = [];
    seeded.rows.phase_versions = [];
    seeded.rows.phase_sections = [];
    await h(seedLesson1_1)(seeded.ctx, {});
    const lesson = await h(getLesson)(seeded.ctx, {
      learnerId: "s",
      unit: 1,
      topic: 1,
    });
    const activities = lesson.phases
      .flatMap((phase: any) => phase.sections)
      .filter((section: any) => section.sectionType === "activity");
    expect(activities.length).toBeGreaterThan(0);
    expect(activities.some((section: any) => section.content.props)).toBe(
      false,
    );
    expect(JSON.stringify(activities)).not.toMatch(
      /equation|steps|answerKey|gradingConfig/,
    );
  });
  it.each([null, 1, "private", ["private"]])(
    "projects invalid stored section content %j as an empty public object",
    async (content) => {
      const { rows, ctx } = fixture();
      rows.phase_sections[0].content = content;
      const value = await h(getLesson)(ctx, {
        learnerId: "s",
        unit: 1,
        topic: 1,
      });
      expect(value.phases[0].sections[0].content).toEqual({});
    },
  );
  it("rejects damaged credentials and hides draft lessons", async () => {
    const { rows, ctx } = fixture();
    for (const mutate of [
      (r: any) => (r.auth_credentials[0].isActive = false),
      (r: any) => (r.profiles[0].role = "teacher"),
      (r: any) => (r.auth_credentials[0].profileId = "other"),
      (r: any) => (r.auth_credentials[0].organizationId = "other"),
      (r: any) => r.profiles.splice(0),
    ]) {
      const next = fixture();
      mutate(next.rows);
      await expect(
        h(getLesson)(next.ctx, { learnerId: "s", unit: 1, topic: 1 }),
      ).rejects.toThrow("Forbidden");
    }
    rows.lesson_versions[0].status = "draft";
    expect(
      await h(getLesson)(ctx, { learnerId: "s", unit: 1, topic: 1 }),
    ).toBeNull();
  });
  it("stores bounded ordinary responses only for an active learner and published phase", async () => {
    vi.spyOn(Date, "now").mockReturnValue(5);
    const { rows, ctx } = fixture();
    expect(
      await h(saveResponse)(ctx, {
        learnerId: "s",
        phaseId: "phase",
        response: "  Explain  ",
      }),
    ).toBe("lesson_responses:1");
    expect(rows.lesson_responses[0]).toMatchObject({
      learnerId: "s",
      phaseId: "phase",
      response: "Explain",
      createdAt: 5,
    });
    expect(
      await h(saveResponse)(ctx, {
        learnerId: "s",
        phaseId: "phase",
        response: "x".repeat(10000),
      }),
    ).toBe("lesson_responses:2");
    await expect(
      h(saveResponse)(ctx, { learnerId: "s", phaseId: "phase", response: " " }),
    ).rejects.toThrow();
    await expect(
      h(saveResponse)(ctx, {
        learnerId: "s",
        phaseId: "phase",
        response: "x".repeat(10001),
      }),
    ).rejects.toThrow();
    await expect(
      h(saveResponse)(ctx, {
        learnerId: "s",
        phaseId: "missing",
        response: "No",
      }),
    ).rejects.toThrow(/Phase not found/);
    rows.lesson_versions[0].status = "draft";
    await expect(
      h(saveResponse)(ctx, {
        learnerId: "s",
        phaseId: "phase",
        response: "No",
      }),
    ).rejects.toThrow(/not published/);
    expect(rows.lesson_responses).toHaveLength(2);
  });
});
