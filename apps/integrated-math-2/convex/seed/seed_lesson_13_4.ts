import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson13_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson13_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson13_4Result> => {
    const now = Date.now();
    const lessonSlug = "13-4-double-half-angle-identities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Double and Half-Angle Identities",
          slug: lessonSlug,
          description: "Students derive and apply double-angle and half-angle trigonometric identities.",
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
          title: "Double and Half-Angle Identities",
          description: "Students derive and apply double-angle and half-angle trigonometric identities.",
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
              markdown: "## Explore: Doubling the Angle\n\nWhat is sin(2 × 30°)? Is it 2sin(30°)?\n\nCompute both. The double-angle formula gives us the correct way to express sin(2θ) in terms of sin(θ) and cos(θ).",
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
                    question: "sin(2θ) equals:",
                    options: ["2sin(θ)", "sin²(θ)", "2sin(θ)cos(θ)", "sin(θ)cos(θ)"],
                    correctIndex: 2,
                  },
                  {
                    question: "If sin(30°) = 1/2 and cos(30°) = √3/2, then sin(60°) =",
                    options: ["1", "√3/2", "1/2", "√3/4"],
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
              markdown: "## Double and Half-Angle Identities\n\n### Double-Angle Identities\nsin(2θ) = 2sin(θ)cos(θ)\ncos(2θ) = cos²(θ) − sin²(θ)\n         = 2cos²(θ) − 1\n         = 1 − 2sin²(θ)\ntan(2θ) = 2tan(θ) / (1 − tan²(θ))\n\n### Half-Angle Identities\nsin(θ/2) = ±√((1 − cos θ)/2)\ncos(θ/2) = ±√((1 + cos θ)/2)\ntan(θ/2) = ±√((1 − cos θ)/(1 + cos θ))\n         = sin(θ)/(1 + cos(θ))\n\n### Sign Convention\nThe ± depends on which quadrant θ/2 lies in.",
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
              markdown: "## Example: Use the Double-Angle Formula\n\nIf sin(θ) = 3/5 and θ is acute, find cos(2θ).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "double-angle",
                equation: "cos(2θ) given sin(θ) = 3/5",
                steps: [
                  { expression: "cos(θ) = √(1 - 9/25) = 4/5", explanation: "Find cos(θ) using Pythagorean identity" },
                  { expression: "cos(2θ) = cos²θ - sin²θ", explanation: "Double-angle formula" },
                  { expression: "= (16/25) - (9/25)", explanation: "Substitute values" },
                  { expression: "= 7/25", explanation: "Simplify" },
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
                    question: "cos(2θ) = 2cos²(θ) - 1. If cos(θ) = 1/2, cos(2θ) =",
                    options: ["0", "-1/2", "1/2", "1"],
                    correctIndex: 1,
                  },
                  {
                    question: "sin(15°) using the half-angle formula with θ = 30° is:",
                    options: ["√((1 - √3/2)/2)", "√((1 + √3/2)/2)", "1/2", "√3/2"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which is a form of cos(2θ)?",
                    options: ["2cos²(θ) + 1", "1 - 2sin²(θ)", "cos²(θ) + sin²(θ)", "2sin(θ)cos(θ)"],
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
                    question: "sin(2θ) = 2sin(θ)cos(θ). If sin(θ) = 4/5 and cos(θ) = 3/5, sin(2θ) =",
                    options: ["24/25", "12/25", "8/5", "7/25"],
                    correctIndex: 0,
                  },
                  {
                    question: "cos(θ/2) when θ = 120° (cos(120°) = -1/2) is:",
                    options: ["√3/2", "1/2", "-√3/2", "√(3/4)"],
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
