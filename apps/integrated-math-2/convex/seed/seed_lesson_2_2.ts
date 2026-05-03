import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_2Result> => {
    const now = Date.now();
    const lessonSlug = "2-2-parallelogram-properties";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Parallelogram Properties",
          slug: lessonSlug,
          description: "Students identify and apply properties of parallelograms.",
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
          title: "Parallelogram Properties",
          description: "Students identify and apply properties of parallelograms.",
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
              markdown: "## Explore: Parallelogram Features\n\nDraw a parallelogram. Measure all sides, all angles, and both diagonals. What patterns do you see?",
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
                    question: "In a parallelogram, opposite sides are:",
                    options: ["Congruent and parallel", "Only parallel", "Only congruent", "Perpendicular"],
                    correctIndex: 0,
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
              markdown: "## Properties of Parallelograms\n\n1. **Opposite sides are parallel and congruent**\n2. **Opposite angles are congruent**\n3. **Consecutive angles are supplementary** (sum to 180\\degree)\n4. **Diagonals bisect each other**\n\n### Proving a Quadrilateral is a Parallelogram\nA quadrilateral is a parallelogram if any of the following are true:\n- Both pairs of opposite sides are parallel\n- Both pairs of opposite sides are congruent\n- Both pairs of opposite angles are congruent\n- One pair of opposite sides is both parallel and congruent\n- The diagonals bisect each other",
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
              markdown: "## Example: Find Missing Measures\n\nIn parallelogram ABCD, $\\angle A = 70\\degree$ and $AB = 12$. Find $\\angle B$, $\\angle C$, $\\angle D$, and $CD$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "parallelogram_calculation",
                equation: "∠A = 70°, AB = 12 in parallelogram ABCD",
                steps: [
                  { expression: "∠C = 70°", explanation: "Opposite angles are congruent" },
                  { expression: "∠B = 180° - 70° = 110°", explanation: "Consecutive angles are supplementary" },
                  { expression: "∠D = 110°", explanation: "Opposite angles are congruent" },
                  { expression: "CD = 12", explanation: "Opposite sides are congruent" },
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
                    question: "If one angle of a parallelogram is 80°, what is the consecutive angle?",
                    options: ["80°", "100°", "110°", "180°"],
                    correctIndex: 1,
                  },
                  {
                    question: "The diagonals of a parallelogram:",
                    options: ["Are congruent", "Bisect each other", "Are perpendicular", "Do not intersect"],
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
                    question: "In parallelogram PQRS, PQ = 15 and QR = 9. Find PS and SR.",
                    options: ["PS = 15, SR = 9", "PS = 9, SR = 15", "PS = 15, SR = 15", "PS = 9, SR = 9"],
                    correctIndex: 0,
                  },
                  {
                    question: "If one diagonal of a parallelogram is 20, and they bisect each other, what is half the diagonal?",
                    options: ["5", "10", "20", "40"],
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
