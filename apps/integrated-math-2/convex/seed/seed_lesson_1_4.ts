import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_4Result> => {
    const now = Date.now();
    const lessonSlug = "1-4-congruence-criteria";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Congruence Criteria",
          slug: lessonSlug,
          description: "Students learn SSS, SAS, ASA, AAS, and HL congruence shortcuts.",
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
          title: "Congruence Criteria",
          description: "Students learn SSS, SAS, ASA, AAS, and HL congruence shortcuts.",
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
              markdown: "## Explore: What Do You Need?\n\nIf two triangles have all three pairs of sides congruent, must the triangles be congruent? What about just two pairs of sides?\n\nHow much information do we actually need to prove two triangles are the same?",
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
                    question: "Which is a valid triangle congruence criterion?",
                    options: ["AAA", "SSS", "SSA", "ASS"],
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
        sections: {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown: "## Triangle Congruence Criteria\n\n### SSS (Side-Side-Side)\nIf all three pairs of sides are congruent, the triangles are congruent.\n\n### SAS (Side-Angle-Side)\nIf two pairs of sides and the **included** angle are congruent, the triangles are congruent.\n\n### ASA (Angle-Side-Angle)\nIf two pairs of angles and the **included** side are congruent, the triangles are congruent.\n\n### AAS (Angle-Angle-Side)\nIf two pairs of angles and a **non-included** side are congruent, the triangles are congruent.\n\n### HL (Hypotenuse-Leg) — Right Triangles Only\nIf the hypotenuse and one leg of a right triangle are congruent to those of another right triangle, the triangles are congruent.\n\n### Not Valid\n- **AAA** shows similarity, not congruence\n- **SSA** is ambiguous (the ambiguous case)",
          },
        },
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
              markdown: "## Example: Identify the Congruence Criterion\n\nIn triangles ABC and DEF: $\\overline{AB} \\cong \\overline{DE}$, $\\angle B \\cong \\angle E$, $\\overline{BC} \\cong \\overline{EF}$. What criterion proves $\\triangle ABC \\cong \\triangle DEF$?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "congruence",
                equation: "Identify congruence criterion",
                steps: [
                  { expression: "AB ≅ DE (side)", explanation: "First pair of congruent parts" },
                  { expression: "∠B ≅ ∠E (angle)", explanation: "The angle is between AB and BC, and between DE and EF" },
                  { expression: "BC ≅ EF (side)", explanation: "Second pair of congruent sides" },
                  { expression: "The angle is INCLUDED between the sides", explanation: "Check that the angle is between the two sides" },
                  { expression: "SAS (Side-Angle-Side)", explanation: "Two sides and the included angle" },
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
                    question: "Two angles and a non-included side are congruent. Which criterion applies?",
                    options: ["ASA", "AAS", "SAS", "SSA"],
                    correctIndex: 1,
                  },
                  {
                    question: "For right triangles, if the hypotenuse and one leg are congruent, use:",
                    options: ["SSS", "SAS", "HL", "AAS"],
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
                    question: "Why is SSA not a valid congruence criterion?",
                    options: [
                      "It proves similarity instead",
                      "It can produce two different triangles",
                      "It requires more than three parts",
                      "It only works for right triangles",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "Two pairs of sides and the included angle are congruent. The criterion is:",
                    options: ["SSS", "SAS", "ASA", "AAS"],
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

      const sections = Array.isArray(phase.sections) ? phase.sections : [phase.sections];
      for (const section of sections) {
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
