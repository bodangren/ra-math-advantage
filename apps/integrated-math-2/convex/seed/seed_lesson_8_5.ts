import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_5Result> => {
    const now = Date.now();
    const lessonSlug = "8-5-function-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Function Transformations",
          slug: lessonSlug,
          description: "Students identify and apply vertical and horizontal shifts, reflections, and stretches to parent functions.",
          orderIndex: 5,
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
          title: "Function Transformations",
          description: "Students identify and apply vertical and horizontal shifts, reflections, and stretches to parent functions.",
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
              markdown: "## Explore: Moving Functions Around\n\nStart with the parent function f(x) = x².\n- What happens when you graph g(x) = x² + 3?\n- What about h(x) = (x − 2)²?\n- How does the shape change? How does the position change?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                parentFunction: "x^2",
                transformations: [
                  { label: "f(x) = x²", equation: "x^2" },
                  { label: "g(x) = x² + 3", equation: "x^2 + 3" },
                  { label: "h(x) = (x-2)²", equation: "(x-2)^2" },
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
              markdown: "## Function Transformations\n\n### Vertical Shifts\n- f(x) + k: shift up k units\n- f(x) − k: shift down k units\n\n### Horizontal Shifts\n- f(x − h): shift right h units\n- f(x + h): shift left h units\n\n### Reflections\n- −f(x): reflect over x-axis\n- f(−x): reflect over y-axis\n\n### Stretches/Compressions\n- a·f(x): vertical stretch (|a| > 1) or compression (0 < |a| < 1)",
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
              markdown: "## Example: Describe Transformations\n\nDescribe the transformations from f(x) = x² to g(x) = −2(x + 1)² + 5.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "transformation",
                equation: "g(x) = -2(x + 1)² + 5",
                steps: [
                  { expression: "(x + 1)²", explanation: "Horizontal shift LEFT 1 unit" },
                  { expression: "2(x + 1)²", explanation: "Vertical STRETCH by factor of 2" },
                  { expression: "-2(x + 1)²", explanation: "Reflection over the x-axis" },
                  { expression: "-2(x + 1)² + 5", explanation: "Vertical shift UP 5 units" },
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
                    question: "The graph of f(x) + 7 is the graph of f(x) shifted:",
                    options: ["Down 7", "Right 7", "Up 7", "Left 7"],
                    correctIndex: 2,
                  },
                  {
                    question: "The graph of f(x − 4) is the graph of f(x) shifted:",
                    options: ["Left 4", "Right 4", "Up 4", "Down 4"],
                    correctIndex: 1,
                  },
                  {
                    question: "−f(x) reflects f(x) over the:",
                    options: ["y-axis", "x-axis", "origin", "Line y = x"],
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
                    question: "g(x) = (x − 3)² − 2 shifts f(x) = x²:",
                    options: ["Right 3, down 2", "Left 3, up 2", "Right 3, up 2", "Left 3, down 2"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which transformation makes a graph narrower?",
                    options: ["f(x) + 5", "0.5·f(x)", "3·f(x)", "f(x − 2)"],
                    correctIndex: 2,
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
