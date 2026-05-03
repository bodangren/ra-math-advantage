import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson13_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson13_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson13_3Result> => {
    const now = Date.now();
    const lessonSlug = "13-3-sum-difference-identities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Sum and Difference Identities",
          slug: lessonSlug,
          description: "Students apply sum and difference formulas for sine, cosine, and tangent.",
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
          title: "Sum and Difference Identities",
          description: "Students apply sum and difference formulas for sine, cosine, and tangent.",
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
              markdown: "## Explore: Adding Angles\n\nIs sin(45° + 30°) equal to sin(45°) + sin(30°)?\n\nCompute both sides. What do you notice? This shows we need special formulas for combining angles.",
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
                    question: "sin(45° + 30°) = sin(75°). Is this equal to sin(45°) + sin(30°)?",
                    options: ["Yes", "No", "Sometimes", "Only for special angles"],
                    correctIndex: 1,
                  },
                  {
                    question: "sin(A + B) equals:",
                    options: ["sin A + sin B", "sin A cos B + cos A sin B", "sin A cos B - cos A sin B", "cos A cos B + sin A sin B"],
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
              markdown: "## Sum and Difference Identities\n\n### Sine\nsin(A + B) = sin A cos B + cos A sin B\nsin(A − B) = sin A cos B − cos A sin B\n\n### Cosine\ncos(A + B) = cos A cos B − sin A sin B\ncos(A − B) = cos A cos B + sin A sin B\n\n### Tangent\ntan(A + B) = (tan A + tan B) / (1 − tan A tan B)\ntan(A − B) = (tan A − tan B) / (1 + tan A tan B)\n\n### Memory Aid\n- Sine: same sign (+) for sum, different (−) for difference\n- Cosine: OPPOSITE — different sign (−) for sum, same (+) for difference",
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
              markdown: "## Example: Find sin(75°)\n\nUse the sum identity with 75° = 45° + 30°.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "sum-difference",
                equation: "sin(75°) = sin(45° + 30°)",
                steps: [
                  { expression: "sin(45° + 30°) = sin45°cos30° + cos45°sin30°", explanation: "Apply sum formula" },
                  { expression: "= (√2/2)(√3/2) + (√2/2)(1/2)", explanation: "Substitute known values" },
                  { expression: "= √6/4 + √2/4", explanation: "Multiply" },
                  { expression: "= (√6 + √2)/4", explanation: "Combine" },
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
                    question: "cos(15°) = cos(45° - 30°) equals:",
                    options: ["(√6 + √2)/4", "(√6 - √2)/4", "(√2 - √6)/4", "√3/2"],
                    correctIndex: 0,
                  },
                  {
                    question: "cos(A + B) formula uses:",
                    options: ["cos A cos B + sin A sin B", "cos A cos B - sin A sin B", "sin A cos B + cos A sin B", "sin A cos B - cos A sin B"],
                    correctIndex: 1,
                  },
                  {
                    question: "sin(60° - 30°) using the difference formula equals:",
                    options: ["sin(30°) = 1/2", "sin(60°) - sin(30°)", "Both A and B are correct", "Neither is correct"],
                    correctIndex: 0,
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
                    question: "If sin(A) = 3/5 and cos(B) = 5/13 (both acute), sin(A + B) involves:",
                    options: ["sin A cos B + cos A sin B", "sin A + sin B", "sin A cos B - cos A sin B", "cos A cos B - sin A sin B"],
                    correctIndex: 0,
                  },
                  {
                    question: "cos(90° - θ) equals:",
                    options: ["cos(θ)", "sin(θ)", "-sin(θ)", "-cos(θ)"],
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
