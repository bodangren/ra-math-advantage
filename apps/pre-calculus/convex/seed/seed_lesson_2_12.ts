import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_12Result> => {
    const now = Date.now();
    const lessonSlug = "2-12-logarithmic-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Equations",
          slug: lessonSlug,
          description: "Students solve equations involving logarithms by converting to exponential form and using logarithmic properties.",
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
          title: "Logarithmic Equations",
          description: "Students solve equations involving logarithms by converting to exponential form and using logarithmic properties.",
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
                equation: "log₂(x) = 5",
                steps: [
                  { expression: "log₂(x) = 5", explanation: "Given equation" },
                  { expression: "x = 2^5 = 32", explanation: "Convert to exponential form" },
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
              markdown: "## Solving Logarithmic Equations\n\n### Strategy 1: Convert to Exponential\n\nIf $\\log_b(x) = k$, then $x = b^k$.\n\n### Strategy 2: Use Properties\n\nIf $\\log_b(A) = \\log_b(B)$, then $A = B$.\n\n### Strategy 3: Exponentiate Both Sides\n\nIf $\\log_b(x) = k$, apply $b^{(\\cdot)}$ to both sides.\n\n### Important\n\n- Always check solutions — arguments of logarithms must be positive\n- Reject any solution that makes a log argument zero or negative",
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
              markdown: "## Example: Solving Logarithmic Equations\n\nSolve $\\log_3(x + 2) + \\log_3(x - 4) = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "log₃(x + 2) + log₃(x - 4) = 3",
                steps: [
                  { expression: "log₃((x+2)(x-4)) = 3", explanation: "Product rule" },
                  { expression: "(x+2)(x-4) = 3³ = 27", explanation: "Convert to exponential" },
                  { expression: "x² - 2x - 8 = 27", explanation: "Expand" },
                  { expression: "x² - 2x - 35 = 0", explanation: "Set equal to zero" },
                  { expression: "(x - 7)(x + 5) = 0", explanation: "Factor" },
                  { expression: "x = 7 or x = -5", explanation: "Solutions" },
                  { expression: "Check: x = 7 → log₃(9) + log₃(3) = 2 + 1 = 3 ✓", explanation: "Valid" },
                  { expression: "x = -5 → log₃(-3) undefined ✗", explanation: "Reject x = -5" },
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
                    question: "The solution to $\\log_2(x) = 4$ is:",
                    options: ["8", "16", "2", "4"],
                    correctIndex: 1,
                  },
                  {
                    question: "If solving a log equation yields x = -3, you should:",
                    options: ["Accept it", "Reject it if it makes the argument negative", "Double it", "Take the absolute value"],
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
                equation: "ln(x) + ln(x - 2) = ln(15)",
                steps: [
                  { expression: "ln(x(x-2)) = ln(15)", explanation: "Product rule" },
                  { expression: "x(x - 2) = 15", explanation: "Arguments equal" },
                  { expression: "x² - 2x - 15 = 0", explanation: "Expand and rearrange" },
                  { expression: "(x - 5)(x + 3) = 0", explanation: "Factor" },
                  { expression: "x = 5 or x = -3", explanation: "Solutions" },
                  { expression: "x = -3 rejected (ln(-3) undefined)", explanation: "Check domain" },
                  { expression: "x = 5", explanation: "Final answer" },
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
