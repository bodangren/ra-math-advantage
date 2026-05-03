import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_1Result> => {
    const now = Date.now();
    const lessonSlug = "4-1-parametric-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Functions",
          slug: lessonSlug,
          description: "Students understand parametric equations, how to evaluate them for given parameter values, and how to eliminate the parameter to find rectangular equivalents.",
          orderIndex: 1,
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
          title: "Parametric Functions",
          description: "Students understand parametric equations, how to evaluate them for given parameter values, and how to eliminate the parameter to find rectangular equivalents.",
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "In parametric equations $x = f(t)$, $y = g(t)$, what does the parameter $t$ typically represent?",
                    options: ["The slope of the curve", "An independent variable such as time", "The y-coordinate", "The x-intercept"],
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
              markdown: "## Parametric Functions\n\n### Definition\n\nA **parametric curve** is defined by two functions of a third variable (the parameter):\n\n$$x = f(t), \\quad y = g(t), \\quad a \\le t \\le b$$\n\n### Evaluating Parametric Equations\n\nGiven $x = t^2 - 1$ and $y = 2t + 3$:\n- At $t = 0$: $(x, y) = (-1, 3)$\n- At $t = 1$: $(x, y) = (0, 5)$\n- At $t = 2$: $(x, y) = (3, 7)$\n\n### Eliminating the Parameter\n\nSolve one equation for $t$, then substitute into the other.\n\nFrom $y = 2t + 3$: $t = \\frac{y-3}{2}$\n\nSubstitute into $x = t^2 - 1$:\n$$x = \\left(\\frac{y-3}{2}\\right)^2 - 1$$\n\n### Direction\n\nThe parameter $t$ gives the curve an orientation (direction of travel).",
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
              markdown: "## Example: Eliminate the Parameter\n\nGiven $x = 3\\cos t$ and $y = 3\\sin t$ for $0 \\le t \\le 2\\pi$, find the rectangular equation.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Eliminate parameter from x = 3cos t, y = 3sin t",
                steps: [
                  { expression: "cos t = x/3, sin t = y/3", explanation: "Solve each equation for trig function" },
                  { expression: "cos²t + sin²t = 1", explanation: "Pythagorean identity" },
                  { expression: "(x/3)² + (y/3)² = 1", explanation: "Substitute" },
                  { expression: "x² + y² = 9", explanation: "Multiply by 9 — circle of radius 3" },
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
                    question: "For $x = t + 1$, $y = t^2$, eliminating the parameter gives:",
                    options: ["y = (x−1)²", "y = x² − 1", "y = x² + 1", "y = (x+1)²"],
                    correctIndex: 0,
                  },
                  {
                    question: "Parametric equations can trace the same curve with different:",
                    options: ["Colors", "Orientations or speeds", "Slopes only", "x-intercepts"],
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Eliminate parameter: x = 2t, y = t² + 1",
                steps: [
                  { expression: "t = x/2", explanation: "Solve x = 2t for t" },
                  { expression: "y = (x/2)² + 1", explanation: "Substitute into y equation" },
                  { expression: "y = x²/4 + 1", explanation: "Simplify — a parabola" },
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
