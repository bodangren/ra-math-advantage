import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_5Result> => {
    const now = Date.now();
    const lessonSlug = "5-5-equations-of-circles";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Equations of Circles",
          slug: lessonSlug,
          description: "Students write and graph equations of circles in standard and general form.",
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
          title: "Equations of Circles",
          description: "Students write and graph equations of circles in standard and general form.",
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
              markdown: "## Explore: Circles on the Coordinate Plane\n\nA circle with center $(h, k)$ and radius $r$ can be described by an equation. What does the equation look like?",
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
                    question: "A circle centered at (0, 0) with radius 5 has the equation:",
                    options: ["x + y = 5", "x² + y² = 5", "x² + y² = 25", "x² + y² = 10"],
                    correctIndex: 2,
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
              markdown: "## Equation of a Circle\n\n### Standard Form\n$$(x - h)^2 + (y - k)^2 = r^2$$\n- Center: $(h, k)$\n- Radius: $r$\n\n### General Form\n$$x^2 + y^2 + Dx + Ey + F = 0$$\n\nTo convert general to standard, **complete the square** for both $x$ and $y$.\n\n### Example Conversion\n$x^2 + 6x + y^2 - 4y = 12$\n$(x^2 + 6x + 9) + (y^2 - 4y + 4) = 12 + 9 + 4$\n$(x + 3)^2 + (y - 2)^2 = 25$\nCenter $(-3, 2)$, radius $5$",
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
              markdown: "## Example: Write the Equation\n\nWrite the equation of a circle with center (3, -2) and radius 4.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "circle_equation",
                equation: "(x - h)² + (y - k)² = r²",
                steps: [
                  { expression: "h = 3, k = -2, r = 4", explanation: "Identify center and radius" },
                  { expression: "(x - 3)² + (y - (-2))² = 4²", explanation: "Substitute into standard form" },
                  { expression: "(x - 3)² + (y + 2)² = 16", explanation: "Simplify" },
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
                    question: "The equation (x + 1)² + (y - 5)² = 9 has center:",
                    options: ["(1, 5)", "(-1, 5)", "(1, -5)", "(-1, -5)"],
                    correctIndex: 1,
                  },
                  {
                    question: "The radius of (x - 2)² + (y - 3)² = 49 is:",
                    options: ["2", "3", "7", "49"],
                    correctIndex: 2,
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
                    question: "Completing the square: x² - 4x becomes:",
                    options: ["(x - 2)² - 4", "(x - 2)² + 4", "(x - 4)²", "(x + 2)² - 4"],
                    correctIndex: 0,
                  },
                  {
                    question: "A circle passes through (0,0) with center (3,4). Its equation is:",
                    options: ["(x - 3)² + (y - 4)² = 25", "(x - 3)² + (y - 4)² = 5", "x² + y² = 25", "(x + 3)² + (y + 4)² = 25"],
                    correctIndex: 0,
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
