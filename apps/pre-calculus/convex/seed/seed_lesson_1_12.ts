import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_12Result> => {
    const now = Date.now();
    const lessonSlug = "1-12-transformations-of-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Transformations of Functions",
          slug: lessonSlug,
          description: "Students apply vertical/horizontal shifts, reflections, and stretches to parent functions.",
          orderIndex: 12,
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
          title: "Transformations of Functions",
          description: "Students apply vertical/horizontal shifts, reflections, and stretches to parent functions.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "compare_functions",
                equations: ["y = x^2", "y = (x - 3)^2 + 2"],
                title: "Explore Transformations",
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
              markdown: "## Transformations of Functions\n\nGiven a parent function $f(x)$, the function $g(x) = a \\cdot f(b(x - h)) + k$ applies:\n\n### Transformations\n\n- **$k$**: Vertical shift ($k > 0$ up, $k < 0$ down)\n- **$h$**: Horizontal shift ($h > 0$ right, $h < 0$ left)\n- **$a$**: Vertical stretch/compression and reflection\n  - $|a| > 1$ → vertical stretch\n  - $0 < |a| < 1$ → vertical compression\n  - $a < 0$ → reflection over x-axis\n- **$b$**: Horizontal stretch/compression and reflection\n  - $|b| > 1$ → horizontal compression\n  - $0 < |b| < 1$ → horizontal stretch\n  - $b < 0$ → reflection over y-axis\n\n### Order of Operations\n\nHorizontal transformations apply **inside** the function; vertical transformations apply **outside**.",
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
              markdown: "## Example: Describing Transformations\n\nDescribe the transformations from $f(x) = x^2$ to $g(x) = -2(x + 1)^2 + 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "g(x) = -2(x + 1)^2 + 3",
                steps: [
                  { expression: "g(x) = -2(x - (-1))^2 + 3", explanation: "Rewrite to match a·f(b(x-h)) + k" },
                  { expression: "h = -1: shift left 1 unit", explanation: "Horizontal shift" },
                  { expression: "a = -2: reflect over x-axis and vertical stretch by 2", explanation: "Reflection and stretch" },
                  { expression: "k = 3: shift up 3 units", explanation: "Vertical shift" },
                  { expression: "Vertex moves from (0,0) to (-1, 3)", explanation: "Combined effect" },
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "The function $g(x) = (x - 4)^2$ is $f(x) = x^2$ shifted:",
                    options: ["Left 4", "Right 4", "Up 4", "Down 4"],
                    correctIndex: 1,
                  },
                  {
                    question: "The function $g(x) = -f(x)$ reflects $f$ over the:",
                    options: ["y-axis", "x-axis", "origin", "line y = x"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = 0.5(x + 2)^3 - 1",
                title: "Graph the Transformed Function",
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
