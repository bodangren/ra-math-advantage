import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_6Result> => {
    const now = Date.now();
    const lessonSlug = "1-6-isosceles-equilateral-properties";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Isosceles and Equilateral Properties",
          slug: lessonSlug,
          description: "Students apply properties of isosceles and equilateral triangles.",
          orderIndex: 6,
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
          title: "Isosceles and Equilateral Properties",
          description: "Students apply properties of isosceles and equilateral triangles.",
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
              markdown: "## Explore: Isosceles Triangle Properties\n\nDraw an isosceles triangle with two sides of equal length. Measure the base angles (angles opposite the equal sides). What do you notice?",
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
                    question: "In an isosceles triangle, which angles are congruent?",
                    options: ["All three", "The two base angles", "Only the vertex angle", "None"],
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
              markdown: "## Isosceles Triangle Theorems\n\n### Isosceles Triangle Theorem (Base Angles Theorem)\nIf two sides of a triangle are congruent, then the angles opposite those sides are congruent.\n\n### Converse\nIf two angles of a triangle are congruent, then the sides opposite those angles are congruent.\n\n### Equilateral Triangle Corollary\nAn equilateral triangle is also equiangular. Each angle measures 60\\degree.\n\n### Key Vocabulary\n- **Legs**: The congruent sides of an isosceles triangle\n- **Base**: The third side\n- **Base angles**: The angles opposite the legs\n- **Vertex angle**: The angle between the legs",
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
              markdown: "## Example: Find Missing Angles in an Isosceles Triangle\n\nAn isosceles triangle has a vertex angle of 40\\degree. Find the base angles.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "angle_calculation",
                equation: "Vertex angle = 40\\degree, find base angles",
                steps: [
                  { expression: "Base angles are congruent", explanation: "Isosceles Triangle Theorem" },
                  { expression: "40 + x + x = 180", explanation: "Triangle Angle Sum Theorem" },
                  { expression: "40 + 2x = 180", explanation: "Combine like terms" },
                  { expression: "2x = 140", explanation: "Subtract 40" },
                  { expression: "x = 70\\degree", explanation: "Each base angle is 70\\degree" },
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
                    question: "Each angle of an equilateral triangle measures:",
                    options: ["45\\degree", "60\\degree", "90\\degree", "120\\degree"],
                    correctIndex: 1,
                  },
                  {
                    question: "An isosceles triangle has base angles of 50\\degree. What is the vertex angle?",
                    options: ["50\\degree", "60\\degree", "80\\degree", "100\\degree"],
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
                    question: "In isosceles triangle ABC with AB = AC, if ∠B = 65\\degree, what is ∠A?",
                    options: ["50\\degree", "65\\degree", "70\\degree", "115\\degree"],
                    correctIndex: 0,
                  },
                  {
                    question: "Is an equilateral triangle always isosceles?",
                    options: ["Yes", "No", "Only sometimes"],
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
