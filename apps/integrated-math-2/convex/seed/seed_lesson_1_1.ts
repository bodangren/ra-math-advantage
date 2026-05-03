import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_1Result> => {
    const now = Date.now();
    const lessonSlug = "1-1-classifying-triangles";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Classifying Triangles",
          slug: lessonSlug,
          description: "Students classify triangles by sides and angles and apply classification properties.",
          orderIndex: 1,
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
          title: "Classifying Triangles",
          description: "Students classify triangles by sides and angles and apply classification properties.",
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
              markdown: "## Explore: Triangle Types\n\nLook at the triangles below. How are they similar? How are they different?\n\n- A triangle with all sides the same length\n- A triangle with two sides the same length\n- A triangle with no sides the same length\n\nCan you think of a way to organize triangles into groups based on their properties?",
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
                    question: "A triangle with all three sides equal is called:",
                    options: ["Scalene", "Isosceles", "Equilateral", "Right"],
                    correctIndex: 2,
                  },
                  {
                    question: "A triangle with one 90\\degree angle is classified by angles as:",
                    options: ["Acute", "Obtuse", "Right", "Equiangular"],
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
              markdown: "## Classifying Triangles\n\n### By Sides\n- **Equilateral**: All three sides are equal ($a = b = c$)\n- **Isosceles**: Exactly two sides are equal\n- **Scalene**: No sides are equal\n\n### By Angles\n- **Acute**: All three angles are less than 90\\degree\n- **Right**: One angle is exactly 90\\degree\n- **Obtuse**: One angle is greater than 90\\degree\n- **Equiangular**: All three angles are equal (each 60\\degree)\n\n### Key Fact\nThe sum of the interior angles of any triangle is always 180\\degree.",
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
              markdown: "## Example: Classify a Triangle\n\nClassify the triangle with angles 40\\degree, 60\\degree, and 80\\degree.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "classification",
                equation: "Angles: 40\\degree, 60\\degree, 80\\degree",
                steps: [
                  { expression: "40 + 60 + 80 = 180", explanation: "Verify angle sum is 180\\degree" },
                  { expression: "All angles < 90\\degree", explanation: "Check each angle against 90\\degree" },
                  { expression: "The triangle is acute", explanation: "Since all angles are acute" },
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
                    question: "A triangle with sides 5, 5, 8 is classified by sides as:",
                    options: ["Equilateral", "Isosceles", "Scalene", "Right"],
                    correctIndex: 1,
                  },
                  {
                    question: "A triangle with angles 30\\degree, 30\\degree, 120\\degree is classified by angles as:",
                    options: ["Acute", "Right", "Obtuse", "Equiangular"],
                    correctIndex: 2,
                  },
                  {
                    question: "An equilateral triangle is also always:",
                    options: ["Obtuse", "Scalene", "Acute", "Right"],
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
                    question: "Classify a triangle with sides 7, 8, 9 by sides:",
                    options: ["Equilateral", "Isosceles", "Scalene", "Cannot be determined"],
                    correctIndex: 2,
                  },
                  {
                    question: "If a triangle has one angle of 90\\degree and sides 3, 4, 5, classify it by angles and sides:",
                    options: ["Right, scalene", "Right, isosceles", "Acute, scalene", "Obtuse, scalene"],
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
