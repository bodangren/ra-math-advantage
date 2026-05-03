import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_11Result> => {
    const now = Date.now();
    const lessonSlug = "2-11-logarithmic-properties";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Properties",
          slug: lessonSlug,
          description: "Students apply the product, quotient, and power properties of logarithms to expand and condense expressions.",
          orderIndex: 11,
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
          title: "Logarithmic Properties",
          description: "Students apply the product, quotient, and power properties of logarithms to expand and condense expressions.",
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
                    question: "$\\log(100) + \\log(10)$ equals:",
                    options: ["3", "log(110)", "log(1000)", "20"],
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
              markdown: "## Logarithmic Properties\n\n### Three Key Properties\n\n**Product Rule:** $\\log_b(MN) = \\log_b(M) + \\log_b(N)$\n\n**Quotient Rule:** $\\log_b\\left(\\frac{M}{N}\\right) = \\log_b(M) - \\log_b(N)$\n\n**Power Rule:** $\\log_b(M^p) = p \\cdot \\log_b(M)$\n\n### Expanding vs. Condensing\n\n- **Expand**: Write a single log as a sum/difference of logs\n- **Condense**: Combine multiple logs into a single log\n\n### Change of Base Formula\n\n$$\\log_b(x) = \\frac{\\ln(x)}{\\ln(b)} = \\frac{\\log(x)}{\\log(b)}$$",
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
              markdown: "## Example: Expanding and Condensing\n\na) Expand $\\log_3\\left(\\frac{9x^2}{y}\\right)$\nb) Condense $2\\ln(x) + \\ln(y) - \\ln(z)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Logarithmic properties",
                steps: [
                  { expression: "a) log₃(9x²/y) = log₃(9) + log₃(x²) - log₃(y)", explanation: "Product and quotient rules" },
                  { expression: "= 2 + 2log₃(x) - log₃(y)", explanation: "log₃(9) = 2, power rule" },
                  { expression: "b) 2ln(x) + ln(y) - ln(z)", explanation: "Given expression" },
                  { expression: "= ln(x²) + ln(y) - ln(z)", explanation: "Power rule" },
                  { expression: "= ln(x²y/z)", explanation: "Product and quotient rules" },
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
                    question: "$\\log_2(8x) =$",
                    options: ["3 + log₂(x)", "8 · log₂(x)", "log₂(8) · log₂(x)", "3x"],
                    correctIndex: 0,
                  },
                  {
                    question: "$\\log_5(25) - \\log_5(5) =$",
                    options: ["0", "1", "2", "5"],
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
                equation: "Condense: 3log₂(a) - log₂(b) + log₂(c)",
                steps: [
                  { expression: "3log₂(a) = log₂(a³)", explanation: "Power rule" },
                  { expression: "log₂(a³) - log₂(b) = log₂(a³/b)", explanation: "Quotient rule" },
                  { expression: "log₂(a³/b) + log₂(c) = log₂(a³c/b)", explanation: "Product rule" },
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
