import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_4Result> => {
    const now = Date.now();
    const lessonSlug = "2-4-exponential-manipulation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Function Manipulation",
          slug: lessonSlug,
          description: "Students rewrite exponential expressions using properties of exponents and convert between forms.",
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
          title: "Exponential Function Manipulation",
          description: "Students rewrite exponential expressions using properties of exponents and convert between forms.",
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Rewrite (2^3)^x",
                steps: [
                  { expression: "(2^3)^x = 2^(3x)", explanation: "Power of a power rule" },
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
              markdown: "## Exponential Function Manipulation\n\n### Properties of Exponents\n\n- $b^m \\cdot b^n = b^{m+n}$\n- $\\frac{b^m}{b^n} = b^{m-n}$\n- $(b^m)^n = b^{mn}$\n- $b^{-n} = \\frac{1}{b^n}$\n- $b^{1/n} = \\sqrt[n]{b}$\n\n### Rewriting Bases\n\nAny exponential function can be rewritten with base $e$:\n$$a \\cdot b^x = a \\cdot e^{x \\ln(b)}$$\n\n### Equivalent Forms\n\n$8^x = (2^3)^x = 2^{3x}$\n$\\left(\\frac{1}{3}\\right)^x = 3^{-x}$",
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
              markdown: "## Example: Rewriting Exponential Expressions\n\nSimplify and rewrite $f(x) = \\frac{4^{x+1}}{2^{2x}}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = 4^(x+1) / 2^(2x)",
                steps: [
                  { expression: "4 = 2^2, so 4^(x+1) = (2^2)^(x+1) = 2^(2x+2)", explanation: "Rewrite base 4 as 2^2" },
                  { expression: "f(x) = 2^(2x+2) / 2^(2x)", explanation: "Same base" },
                  { expression: "= 2^(2x+2-2x) = 2^2 = 4", explanation: "Subtract exponents" },
                  { expression: "f(x) = 4 (constant function)", explanation: "The function equals 4 for all x" },
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
                    question: "$9^x$ rewritten with base 3 is:",
                    options: ["3^x", "3^(2x)", "3^(9x)", "3^(x+2)"],
                    correctIndex: 1,
                  },
                  {
                    question: "$(1/2)^x$ is equivalent to:",
                    options: ["2^x", "2^(-x)", "(-2)^x", "-2^x"],
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
                equation: "Simplify 27^(x/3)",
                steps: [
                  { expression: "27 = 3^3", explanation: "Rewrite base" },
                  { expression: "27^(x/3) = (3^3)^(x/3)", explanation: "Substitute" },
                  { expression: "= 3^(3 · x/3) = 3^x", explanation: "Power of a power" },
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
