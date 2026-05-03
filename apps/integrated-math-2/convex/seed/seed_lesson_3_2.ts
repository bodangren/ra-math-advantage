import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_2Result> => {
    const now = Date.now();
    const lessonSlug = "3-2-triangle-similarity";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Triangle Similarity",
          slug: lessonSlug,
          description: "Students learn AA, SAS, and SSS similarity theorems for triangles.",
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
          title: "Triangle Similarity",
          description: "Students learn AA, SAS, and SSS similarity theorems for triangles.",
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
              markdown: "## Explore: How Many Angles Do You Need?\n\nIf two triangles share two congruent angles, must the triangles be similar? What about one angle and the sides around it?",
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
                    question: "If two angles of one triangle equal two angles of another, the triangles are similar by:",
                    options: ["SSS", "SAS", "AA", "HL"],
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
              markdown: "## Triangle Similarity Theorems\n\n### AA (Angle-Angle) Similarity\nIf two angles of one triangle are congruent to two angles of another triangle, the triangles are similar.\n\n### SAS Similarity\nIf two sides of one triangle are proportional to two sides of another triangle AND the included angles are congruent, the triangles are similar.\n\n### SSS Similarity\nIf all three sides of one triangle are proportional to all three sides of another triangle, the triangles are similar.\n\n### Key Difference from Congruence\n- Congruence: ratios = 1 (exact same size)\n- Similarity: ratios equal some constant $k$",
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
              markdown: "## Example: Prove Similarity with AA\n\nIn triangle ABC, $\\angle A = 50\\degree$, $\\angle B = 60\\degree$. In triangle DEF, $\\angle D = 50\\degree$, $\\angle E = 60\\degree$. Prove the triangles are similar.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "similarity_proof",
                equation: "Prove △ABC ~ △DEF",
                steps: [
                  { expression: "∠A = ∠D = 50°", explanation: "Given" },
                  { expression: "∠B = ∠E = 60°", explanation: "Given" },
                  { expression: "Two pairs of congruent angles", explanation: "AA condition met" },
                  { expression: "△ABC ~ △DEF by AA", explanation: "Triangles are similar" },
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
                    question: "For SAS similarity, the angle must be:",
                    options: ["Any angle", "The included angle between the two sides", "A right angle", "The largest angle"],
                    correctIndex: 1,
                  },
                  {
                    question: "Triangle sides 3-4-5 and 6-8-10 are similar by:",
                    options: ["AA", "SAS", "SSS", "Not similar"],
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
                    question: "Two triangles have sides 4-6-8 and 6-9-12. What is the scale factor?",
                    options: ["2/3", "3/2", "2", "3"],
                    correctIndex: 1,
                  },
                  {
                    question: "Can you prove similarity with only one pair of congruent angles?",
                    options: ["Yes, always", "No, you need two pairs (AA)", "Only for right triangles", "Only for equilateral triangles"],
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
