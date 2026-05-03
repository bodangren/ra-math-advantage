import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_4Result> => {
    const now = Date.now();
    const lessonSlug = "3-4-similarity-proofs";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Similarity Proofs",
          slug: lessonSlug,
          description: "Students write formal proofs involving similar triangles.",
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
          title: "Similarity Proofs",
          description: "Students write formal proofs involving similar triangles.",
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
              markdown: "## Explore: Parallel Lines and Similar Triangles\n\nWhen a line is drawn parallel to one side of a triangle, it creates a smaller triangle inside. How are these triangles related?",
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
                    question: "A line parallel to one side of a triangle creates a triangle that is:",
                    options: ["Congruent", "Similar", "Unrelated", "Equal in area"],
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
              markdown: "## Similarity Proof Techniques\n\n### Triangle Proportionality Theorem\nIf a line parallel to one side of a triangle intersects the other two sides, it divides those sides proportionally.\n\n### Converse\nIf a line divides two sides proportionally, it is parallel to the third side.\n\n### Proof Strategy\n1. Identify shared angles (vertical angles, alternate interior angles, corresponding angles)\n2. Show two angles are congruent\n3. Apply AA similarity\n4. Write the similarity statement with correct correspondence",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Parallel Line Proof\n\nIn $\\triangle ABC$, $\\overline{DE} \\parallel \\overline{BC}$. Prove $\\triangle ADE \\sim \\triangle ABC$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "similarity_proof",
                equation: "Prove △ADE ~ △ABC",
                steps: [
                  { expression: "∠A ≅ ∠A", explanation: "Reflexive property (shared angle)" },
                  { expression: "DE ∥ BC", explanation: "Given" },
                  { expression: "∠ADE ≅ ∠ABC", explanation: "Corresponding angles (DE ∥ BC)" },
                  { expression: "△ADE ~ △ABC by AA", explanation: "Two pairs of congruent angles" },
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
                    question: "In a similarity proof with parallel lines, which angle pair justification is most common?",
                    options: ["Vertical angles", "Alternate interior angles", "Same angle (reflexive)", "Supplementary angles"],
                    correctIndex: 1,
                  },
                  {
                    question: "If DE ∥ BC in triangle ABC, and AD/AB = 3/5, then AE/AC equals:",
                    options: ["2/5", "3/5", "3/8", "5/3"],
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
                    question: "In a two-column similarity proof, the final statement is typically:",
                    options: ["∠A = ∠D", "AB/DE = BC/EF", "△ABC ~ △DEF", "AB = DE × k"],
                    correctIndex: 2,
                  },
                  {
                    question: "The Triangle Proportionality Theorem requires the dividing line to be:",
                    options: ["Perpendicular to one side", "Parallel to one side", "A median", "An altitude"],
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
