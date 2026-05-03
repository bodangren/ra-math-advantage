import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_4Result> => {
    const now = Date.now();
    const lessonSlug = "4-4-parametric-circles-lines";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Circles and Lines",
          slug: lessonSlug,
          description: "Students write parametric equations for circles and lines and interpret the parameter's effect on direction and speed.",
          orderIndex: 4,
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
          title: "Parametric Circles and Lines",
          description: "Students write parametric equations for circles and lines and interpret the parameter's effect on direction and speed.",
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
                prompt: "Graph x = 3cos t, y = 3sin t for 0 ≤ t ≤ 2π. What shape is traced?",
                defaultExpressions: ["x(t) = 3cos(t)", "y(t) = 3sin(t)"],
                parameterRange: [0, 6.28],
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
              markdown: "## Parametric Circles and Lines\n\n### Parametric Line\n\nThe line through $(x_0, y_0)$ and $(x_1, y_1)$:\n$$x = x_0 + t(x_1 - x_0), \\quad y = y_0 + t(y_1 - y_0), \\quad 0 \\le t \\le 1$$\n\nAt $t = 0$: starting point. At $t = 1$: ending point.\n\n### Parametric Circle\n\nCircle of radius $r$ centered at $(h, k)$:\n$$x = h + r\\cos t, \\quad y = k + r\\sin t$$\n\n- $0 \\le t \\le 2\\pi$ traces one full revolution\n- Counterclockwise for standard parameterization\n- Reverse direction: use $-t$ or change $\\cos \\leftrightarrow \\sin$\n\n### Effect of Parameter Scaling\n\n$x = r\\cos(2t)$ traces the circle **twice** as fast.\n$x = r\\cos(t/2)$ traces the circle at **half** speed.\n\n### Ellipse\n\n$$x = a\\cos t, \\quad y = b\\sin t$$\n\nTraces an ellipse with semi-axes $a$ (horizontal) and $b$ (vertical).",
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
              markdown: "## Example: Parametric Line\n\nFind parametric equations for the line from $(1, 3)$ to $(5, 7)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Parametric line through (1,3) and (5,7)",
                steps: [
                  { expression: "x = 1 + t(5-1) = 1 + 4t", explanation: "x₀ + t(x₁ − x₀)" },
                  { expression: "y = 3 + t(7-3) = 3 + 4t", explanation: "y₀ + t(y₁ − y₀)" },
                  { expression: "At t=0: (1,3). At t=1: (5,7)", explanation: "Verify endpoints" },
                  { expression: "Eliminate: y = x + 2", explanation: "Rectangular form" },
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
                    question: "The parametric equations $x = 2 + 5\\cos t$, $y = -1 + 5\\sin t$ describe a circle centered at:",
                    options: ["(5, 5)", "(2, -1)", "(0, 0)", "(-1, 2)"],
                    correctIndex: 1,
                  },
                  {
                    question: "To trace a circle clockwise instead of counterclockwise, replace $t$ with:",
                    options: ["2t", "t/2", "-t", "t²"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Parametric equations for circle center (3,-2), radius 4",
                steps: [
                  { expression: "x = 3 + 4cos(t)", explanation: "h + r·cos(t)" },
                  { expression: "y = -2 + 4sin(t)", explanation: "k + r·sin(t)" },
                  { expression: "Eliminate: (x-3)² + (y+2)² = 16", explanation: "Verify rectangular form" },
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
