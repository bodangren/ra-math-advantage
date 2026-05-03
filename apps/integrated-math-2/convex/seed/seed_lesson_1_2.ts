import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_2Result> => {
    const now = Date.now();
    const lessonSlug = "1-2-triangle-angle-relationships";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Triangle Angle Relationships",
          slug: lessonSlug,
          description: "Students explore interior and exterior angle relationships in triangles.",
          orderIndex: 2,
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
          title: "Triangle Angle Relationships",
          description: "Students explore interior and exterior angle relationships in triangles.",
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
              markdown: "## Explore: Interior Angles\n\nDraw any triangle and measure all three interior angles. Add them together. What do you notice?\n\nTry this with several different triangles. Does the sum always stay the same?",
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
                    question: "What is the sum of interior angles in any triangle?",
                    options: ["90\\degree", "180\\degree", "270\\degree", "360\\degree"],
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
              markdown: "## Triangle Angle Theorems\n\n### Triangle Angle Sum Theorem\nThe sum of the interior angles of a triangle is 180\\degree.\n$$\\angle A + \\angle B + \\angle C = 180\\degree$$\n\n### Exterior Angle Theorem\nAn exterior angle of a triangle equals the sum of the two non-adjacent interior angles.\n$$\\text{Exterior angle} = \\angle A + \\angle B$$\n\n### Corollary\nThe acute angles of a right triangle are complementary.\n$$\\angle A + \\angle B = 90\\degree$$",
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
              markdown: "## Example: Find a Missing Angle\n\nIn triangle ABC, $\\angle A = 45\\degree$ and $\\angle B = 70\\degree$. Find $\\angle C$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "angle_calculation",
                equation: "\\angle A + \\angle B + \\angle C = 180\\degree",
                steps: [
                  { expression: "45 + 70 + \\angle C = 180", explanation: "Substitute known values" },
                  { expression: "115 + \\angle C = 180", explanation: "Add 45 and 70" },
                  { expression: "\\angle C = 180 - 115 = 65\\degree", explanation: "Subtract to solve" },
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
                    question: "If two angles of a triangle are 55\\degree and 65\\degree, what is the third angle?",
                    options: ["50\\degree", "60\\degree", "70\\degree", "80\\degree"],
                    correctIndex: 1,
                  },
                  {
                    question: "An exterior angle of a triangle is 120\\degree. One non-adjacent interior angle is 50\\degree. What is the other?",
                    options: ["60\\degree", "70\\degree", "80\\degree", "130\\degree"],
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
                    question: "In a right triangle, one acute angle is 35\\degree. What is the other acute angle?",
                    options: ["45\\degree", "55\\degree", "65\\degree", "145\\degree"],
                    correctIndex: 1,
                  },
                  {
                    question: "An exterior angle is 135\\degree. The two non-adjacent interior angles are equal. What is each angle?",
                    options: ["45\\degree", "67.5\\degree", "90\\degree", "135\\degree"],
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
