import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_10Result> => {
    const now = Date.now();
    const lessonSlug = "3-10-trig-equations-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Trigonometric Equations and Inequalities",
          slug: lessonSlug,
          description: "Students solve trigonometric equations and inequalities using algebraic, graphical, and unit circle methods.",
          orderIndex: 10,
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
          title: "Trigonometric Equations and Inequalities",
          description: "Students solve trigonometric equations and inequalities using algebraic, graphical, and unit circle methods.",
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
                variant: "plot_from_equation",
                equation: "y = sin(x)",
                title: "Solve sin(x) = 0.5",
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
              markdown: "## Solving Trigonometric Equations\n\n### General Approach\n\n1. **Isolate** the trig function\n2. **Find** solutions in one period $[0, 2\\pi)$\n3. **Add** the period to get all solutions: $x = \\text{solution} + 2\\pi n$\n\n### Common Equations\n\n- $\\sin(x) = k$: Two solutions per period (if $|k| < 1$)\n- $\\cos(x) = k$: Two solutions per period (if $|k| < 1$)\n- $\\tan(x) = k$: One solution per period\n\n### Quadratic Trig Equations\n\nUse substitution: let $u = \\sin(x)$ (or cos, tan) and solve the quadratic.\n\n### Inequalities\n\nSolve graphically or using unit circle to find where the inequality holds.",
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
              markdown: "## Example: Solving $2\\sin(x) - 1 = 0$ on $[0, 2\\pi)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "2sin(x) - 1 = 0",
                steps: [
                  { expression: "2sin(x) = 1 → sin(x) = 1/2", explanation: "Isolate sin(x)" },
                  { expression: "sin(x) = 1/2 at x = π/6", explanation: "First quadrant solution" },
                  { expression: "Also at x = π - π/6 = 5π/6", explanation: "Second quadrant (sin positive)" },
                  { expression: "Solutions on [0, 2π): x = π/6, 5π/6", explanation: "All solutions in interval" },
                  { expression: "General: x = π/6 + 2nπ or x = 5π/6 + 2nπ", explanation: "All solutions" },
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
                    question: "Solutions to $\\cos(x) = 0$ on $[0, 2\\pi)$ are:",
                    options: ["0, π", "π/2, 3π/2", "0, 2π", "π/4, 3π/4"],
                    correctIndex: 1,
                  },
                  {
                    question: "$\\sin(x) = 1/2$ has how many solutions on $[0, 2\\pi)$?",
                    options: ["1", "2", "3", "4"],
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
                equation: "Solve 2cos²(x) - cos(x) - 1 = 0 on [0, 2π)",
                steps: [
                  { expression: "Let u = cos(x): 2u² - u - 1 = 0", explanation: "Substitution" },
                  { expression: "(2u + 1)(u - 1) = 0", explanation: "Factor" },
                  { expression: "u = -1/2 or u = 1", explanation: "Solve" },
                  { expression: "cos(x) = 1 → x = 0", explanation: "First set" },
                  { expression: "cos(x) = -1/2 → x = 2π/3, 4π/3", explanation: "Second set" },
                  { expression: "Solutions: x = 0, 2π/3, 4π/3", explanation: "All solutions" },
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
