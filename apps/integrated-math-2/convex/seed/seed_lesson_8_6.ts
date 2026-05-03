import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_6Result> => {
    const now = Date.now();
    const lessonSlug = "8-6-comparing-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Comparing Functions",
          slug: lessonSlug,
          description: "Students compare functions represented in different ways to determine which has greater rate of change or specific properties.",
          orderIndex: 6,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 1,
          title: "Comparing Functions",
          description: "Students compare functions represented in different ways to determine which has greater rate of change or specific properties.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Explore: Which Function Wins?\n\nFunction A is shown in a table:\n| x | y |\n|---|---|\n| 0 | 2 |\n| 2 | 6 |\n| 4 | 10 |\n\nFunction B: g(x) = 3x + 1\n\nWhich function has a greater rate of change? How do you know?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "The rate of change of Function A (from the table) is:",
                    options: ["2", "3", "4", "6"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which function has a greater rate of change?",
                    options: ["Function A", "Function B", "They are equal", "Cannot determine"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Comparing Functions\n\n### Key Properties to Compare\n1. **Rate of change (slope)**: Which function grows faster?\n2. **Y-intercept**: Where does each function cross the y-axis?\n3. **Domain and range**: What inputs/outputs are possible?\n4. **Maximum/minimum values**: What are the peaks/valleys?\n\n### Strategies\n- Convert all representations to the same form\n- For tables: calculate (y₂−y₁)/(x₂−x₁)\n- For graphs: identify slope visually\n- For equations: identify m directly",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Compare Two Functions\n\nFunction A is in the graph (passes through (0, 1) and (2, 5)).\nFunction B: h(x) = 2x + 3.\n\nWhich function has a greater y-intercept?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "comparison",
                equation: "Compare y-intercepts",
                steps: [
                  { expression: "Function A: passes through (0, 1)", explanation: "y-intercept is the y-value when x = 0" },
                  { expression: "y-intercept of A = 1", explanation: "Read from point (0, 1)" },
                  { expression: "Function B: h(x) = 2x + 3", explanation: "b = 3 in slope-intercept form" },
                  { expression: "y-intercept of B = 3", explanation: "b is the y-intercept" },
                  { expression: "3 > 1, so Function B has greater y-intercept", explanation: "Compare values" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Guided Practice",
        phaseType: "guided_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "f(x) = 4x + 2 and g(x) = 3x + 5. Which has greater slope?",
                    options: ["f(x)", "g(x)", "Equal", "Cannot determine"],
                    correctIndex: 0,
                  },
                  {
                    question: "A table shows constant differences of 3. An equation has slope 5. Which grows faster?",
                    options: ["Table function", "Equation function", "Equal", "Cannot determine"],
                    correctIndex: 1,
                  },
                  {
                    question: "To compare y-intercepts from a graph, look at the point where x =",
                    options: ["1", "0", "-1", "Undefined"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "f(x) has rate of change 6, g(x) has slope 4. After x = 10, which is greater?",
                    options: ["f(x)", "g(x)", "Equal", "Depends on y-intercepts"],
                    correctIndex: 0,
                  },
                  {
                    question: "If two linear functions have the same slope but different y-intercepts, they:",
                    options: ["Intersect once", "Are parallel", "Are identical", "Are perpendicular"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const phase of phaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      phasesCreated++;

      for (const section of phase.sections) {
        if (section.sectionType === "activity") {
          const activityContent = section.content as {
            componentKey: string;
            props: Record<string, unknown>;
          };

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props,
            gradingConfig: { autoGrade: true, partialCredit: true },
            createdAt: now,
            updatedAt: now,
          });

          activitiesCreated++;

          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: {
              ...activityContent,
              activityId: insertedActivityId,
            },
            createdAt: now,
          });
        } else {
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: section.content,
            createdAt: now,
          });
        }
      }
    }

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
