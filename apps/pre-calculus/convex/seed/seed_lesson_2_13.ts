import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_13Result> => {
    const now = Date.now();
    const lessonSlug = "2-13-exp-log-equations-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential/Logarithmic Equations and Inequalities",
          slug: lessonSlug,
          description: "Students solve exponential and logarithmic equations and inequalities using algebraic and graphical methods.",
          orderIndex: 13,
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
          title: "Exponential/Logarithmic Equations and Inequalities",
          description: "Students solve exponential and logarithmic equations and inequalities using algebraic and graphical methods.",
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
                equation: "y = 2^x",
                title: "Solve 2ˣ = 16 Graphically",
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
              markdown: "## Exponential and Logarithmic Equations and Inequalities\n\n### Exponential Equations\n\n**Strategy:** Take the log of both sides or rewrite with same base.\n\n- $a^{f(x)} = a^{g(x)} \\Rightarrow f(x) = g(x)$\n- $a^{f(x)} = b$: take $\\log$ of both sides\n\n### Inequalities\n\n- For $b > 1$: $b^{f(x)} > b^{g(x)} \\Rightarrow f(x) > g(x)$\n- For $0 < b < 1$: $b^{f(x)} > b^{g(x)} \\Rightarrow f(x) < g(x)$ (reverses!)\n\n### Logarithmic Inequalities\n\n- For $b > 1$: $\\log_b(A) > \\log_b(B) \\Rightarrow A > B$ (both positive)\n- For $0 < b < 1$: inequality reverses",
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
              markdown: "## Example: Solving an Exponential Equation\n\nSolve $3^{2x-1} = 5$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "3^(2x-1) = 5",
                steps: [
                  { expression: "ln(3^(2x-1)) = ln(5)", explanation: "Take natural log of both sides" },
                  { expression: "(2x - 1)ln(3) = ln(5)", explanation: "Power rule" },
                  { expression: "2x - 1 = ln(5)/ln(3)", explanation: "Divide by ln(3)" },
                  { expression: "2x = 1 + ln(5)/ln(3)", explanation: "Add 1" },
                  { expression: "x = (1 + ln(5)/ln(3))/2 ≈ 1.232", explanation: "Solve for x" },
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
                    question: "To solve $5^x = 12$, take:",
                    options: ["The square root of both sides", "The log of both sides", "The derivative", "Divide by 5"],
                    correctIndex: 1,
                  },
                  {
                    question: "For $0 < b < 1$, the inequality $b^x > b^3$ means:",
                    options: ["x > 3", "x < 3", "x = 3", "x ≠ 3"],
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
                equation: "Solve: e^(2x) - 5e^x + 6 = 0",
                steps: [
                  { expression: "Let u = e^x: u² - 5u + 6 = 0", explanation: "Substitution" },
                  { expression: "(u - 2)(u - 3) = 0", explanation: "Factor" },
                  { expression: "u = 2 or u = 3", explanation: "Solve for u" },
                  { expression: "e^x = 2 → x = ln(2) ≈ 0.693", explanation: "First solution" },
                  { expression: "e^x = 3 → x = ln(3) ≈ 1.099", explanation: "Second solution" },
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
