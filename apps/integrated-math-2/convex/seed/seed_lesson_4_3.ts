import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_3Result> => {
    const now = Date.now();
    const lessonSlug = "4-3-intro-sin-cos-tan";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Introduction to Sine, Cosine, and Tangent",
          slug: lessonSlug,
          description: "Students define and apply the three basic trigonometric ratios.",
          orderIndex: 3,
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
          title: "Introduction to Sine, Cosine, and Tangent",
          description: "Students define and apply the three basic trigonometric ratios.",
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
              markdown: "## Explore: Ratios in Right Triangles\n\nIn a right triangle, the ratio of any two sides depends only on the angle, not on the size of the triangle. These ratios are the trigonometric functions.",
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
                    question: "In a right triangle, the side opposite the right angle is called the:",
                    options: ["Adjacent", "Opposite", "Hypotenuse", "Base"],
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
              markdown: "## Trigonometric Ratios\n\nFor angle $A$ in a right triangle:\n\n### SOH-CAH-TOA\n- **Sin** $A = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$\n- **Cos** $A = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$\n- **Tan** $A = \\frac{\\text{Opposite}}{\\text{Adjacent}}$\n\n### Remember: SOH-CAH-TOA\n- **S**ine = **O**pposite / **H**ypotenuse\n- **C**osine = **A**djacent / **H**ypotenuse\n- **T**angent = **O**pposite / **A**djacent",
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
              markdown: "## Example: Find Trig Ratios\n\nIn right triangle ABC with right angle at C, if $a = 3$ (opposite A), $b = 4$ (adjacent to A), $c = 5$ (hypotenuse), find sin A, cos A, and tan A.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "trig_ratio",
                equation: "Find sin A, cos A, tan A",
                steps: [
                  { expression: "sin A = opposite/hypotenuse = 3/5", explanation: "SOH" },
                  { expression: "cos A = adjacent/hypotenuse = 4/5", explanation: "CAH" },
                  { expression: "tan A = opposite/adjacent = 3/4", explanation: "TOA" },
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
                    question: "In a 3-4-5 right triangle, sin of the angle opposite the side of length 3 is:",
                    options: ["3/4", "3/5", "4/5", "4/3"],
                    correctIndex: 1,
                  },
                  {
                    question: "tan θ equals:",
                    options: ["Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Opposite/Adjacent", "Hypotenuse/Opposite"],
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
                    question: "If sin θ = 5/13 and the adjacent side is 12, then cos θ =",
                    options: ["5/12", "12/13", "12/5", "13/12"],
                    correctIndex: 1,
                  },
                  {
                    question: "In a 45-45-90 triangle, sin 45° =",
                    options: ["1/2", "√2/2", "√3/2", "1"],
                    correctIndex: 1,
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
