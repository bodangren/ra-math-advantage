import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_9Result> => {
    const now = Date.now();
    const lessonSlug = "2-9-logarithmic-expressions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Expressions",
          slug: lessonSlug,
          description: "Students convert between exponential and logarithmic forms and evaluate logarithmic expressions.",
          orderIndex: 9,
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
          title: "Logarithmic Expressions",
          description: "Students convert between exponential and logarithmic forms and evaluate logarithmic expressions.",
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
                    question: "The expression $\\log_2(8)$ asks: 2 raised to what power equals 8?",
                    options: ["2", "3", "4", "8"],
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
              markdown: "## Logarithmic Expressions\n\n### Definition\n\n$$\\log_b(x) = y \\iff b^y = x$$\n\nA logarithm is the **inverse** of an exponential function.\n\n### Converting Forms\n\n| Exponential | Logarithmic |\n|---|---|\n| $2^3 = 8$ | $\\log_2(8) = 3$ |\n| $10^2 = 100$ | $\\log_{10}(100) = 2$ |\n| $e^1 = e$ | $\\ln(e) = 1$ |\n\n### Special Logarithms\n\n- **Common log**: $\\log(x) = \\log_{10}(x)$\n- **Natural log**: $\\ln(x) = \\log_e(x)$\n- $\\log_b(1) = 0$ for any base $b$\n- $\\log_b(b) = 1$ for any base $b$",
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
              markdown: "## Example: Evaluating Logarithms\n\nEvaluate each logarithm without a calculator.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Evaluate logarithms",
                steps: [
                  { expression: "log₂(32): 2^? = 32 → 2^5 = 32, so log₂(32) = 5", explanation: "Find the exponent" },
                  { expression: "log₃(1/9): 3^? = 1/9 → 3^(-2) = 1/9, so log₃(1/9) = -2", explanation: "Negative exponent" },
                  { expression: "log₁₀(0.001): 10^? = 0.001 → 10^(-3) = 0.001, so = -3", explanation: "Decimal" },
                  { expression: "ln(√e): e^? = e^(1/2), so ln(√e) = 1/2", explanation: "Fractional exponent" },
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
                    question: "$\\log_5(125) =$",
                    options: ["2", "3", "5", "25"],
                    correctIndex: 1,
                  },
                  {
                    question: "$\\log_4(1) =$",
                    options: ["4", "1", "0", "Undefined"],
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
                equation: "Evaluate: log₂(1/16) + log₃(81)",
                steps: [
                  { expression: "log₂(1/16): 2^(-4) = 1/16 → -4", explanation: "First term" },
                  { expression: "log₃(81): 3^4 = 81 → 4", explanation: "Second term" },
                  { expression: "-4 + 4 = 0", explanation: "Sum" },
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
