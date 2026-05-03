import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_12Result> => {
    const now = Date.now();
    const lessonSlug = "3-12-equivalent-trig-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Equivalent Trigonometric Representations",
          slug: lessonSlug,
          description: "Students use Pythagorean, double-angle, and sum/difference identities to rewrite trigonometric expressions.",
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
          title: "Equivalent Trigonometric Representations",
          description: "Students use Pythagorean, double-angle, and sum/difference identities to rewrite trigonometric expressions.",
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
                    question: "$\\sin^2(x) + \\cos^2(x) =$",
                    options: ["0", "1", "2", "sin(2x)"],
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
              markdown: "## Trigonometric Identities\n\n### Pythagorean Identities\n\n$$\\sin^2(x) + \\cos^2(x) = 1$$\n$$1 + \\tan^2(x) = \\sec^2(x)$$\n$$1 + \\cot^2(x) = \\csc^2(x)$$\n\n### Double-Angle Formulas\n\n$$\\sin(2x) = 2\\sin(x)\\cos(x)$$\n$$\\cos(2x) = \\cos^2(x) - \\sin^2(x) = 2\\cos^2(x) - 1 = 1 - 2\\sin^2(x)$$\n\n### Sum/Difference Formulas\n\n$$\\sin(a \\pm b) = \\sin(a)\\cos(b) \\pm \\cos(a)\\sin(b)$$\n$$\\cos(a \\pm b) = \\cos(a)\\cos(b) \\mp \\sin(a)\\sin(b)$$\n\n### Power-Reducing\n\n$$\\sin^2(x) = \\frac{1 - \\cos(2x)}{2}, \\quad \\cos^2(x) = \\frac{1 + \\cos(2x)}{2}$$",
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
              markdown: "## Example: Simplify Using Identities\n\nSimplify $\\frac{\\sin(2x)}{1 + \\cos(2x)}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "sin(2x) / (1 + cos(2x))",
                steps: [
                  { expression: "sin(2x) = 2sin(x)cos(x)", explanation: "Double angle" },
                  { expression: "1 + cos(2x) = 1 + (2cos²x - 1) = 2cos²x", explanation: "Double angle for cosine" },
                  { expression: "= 2sin(x)cos(x) / 2cos²(x)", explanation: "Substitute" },
                  { expression: "= sin(x) / cos(x) = tan(x)", explanation: "Simplify" },
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
                    question: "$\\cos(2x)$ can be written as:",
                    options: ["2cos(x)", "cos²(x) - sin²(x)", "2cos(x)sin(x)", "cos²(x) + sin²(x)"],
                    correctIndex: 1,
                  },
                  {
                    question: "$\\sin^2(x) =$",
                    options: ["(1 + cos 2x)/2", "(1 - cos 2x)/2", "1 - cos²(x)", "Both B and C"],
                    correctIndex: 3,
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
                equation: "Simplify: cos²(x) - sin²(x) + 2sin²(x)",
                steps: [
                  { expression: "cos²(x) - sin²(x) + 2sin²(x)", explanation: "Given expression" },
                  { expression: "= cos²(x) + sin²(x)", explanation: "Combine like terms" },
                  { expression: "= 1", explanation: "Pythagorean identity" },
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
