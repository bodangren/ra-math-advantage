import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_5Result> => {
    const now = Date.now();
    const lessonSlug = "1-5-proving-triangle-congruence";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Proving Triangle Congruence",
          slug: lessonSlug,
          description: "Students write two-column proofs to demonstrate triangle congruence.",
          orderIndex: 5,
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
          title: "Proving Triangle Congruence",
          description: "Students write two-column proofs to demonstrate triangle congruence.",
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
              markdown: "## Explore: CPCTC\n\nIf two triangles are congruent, what can we say about their corresponding parts?\n\nCPCTC stands for **Corresponding Parts of Congruent Triangles are Congruent**. This is a powerful tool once you prove triangles congruent.",
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
                    question: "Once you prove two triangles congruent, CPCTC lets you conclude:",
                    options: [
                      "The triangles are similar",
                      "All corresponding parts are congruent",
                      "The triangles have the same area only",
                      "Nothing further",
                    ],
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
              markdown: "## Writing Triangle Congruence Proofs\n\n### Steps to a Congruence Proof\n1. **Mark the diagram** with given information\n2. **Identify shared parts** (reflexive property, vertical angles, etc.)\n3. **Choose a congruence criterion** (SSS, SAS, ASA, AAS, HL)\n4. **Prove the triangles congruent**\n5. **Use CPCTC** to prove additional parts congruent\n\n### Common Reasons\n- **Reflexive Property**: A segment or angle is congruent to itself\n- **Vertical Angles Theorem**: Vertical angles are congruent\n- **Definition of midpoint/bisector**: Creates congruent parts\n- **Given**: Information stated in the problem",
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
              markdown: "## Example: Two-Column Proof\n\nGiven: $\\overline{AB} \\cong \\overline{CD}$, $\\overline{AB} \\parallel \\overline{CD}$\n\nProve: $\\triangle ABE \\cong \\triangle CDE$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "proof",
                equation: "Prove △ABE ≅ △CDE",
                steps: [
                  { expression: "AB ≅ CD", explanation: "Given" },
                  { expression: "AB ∥ CD", explanation: "Given" },
                  { expression: "∠A ≅ ∠C", explanation: "Alternate interior angles (AB ∥ CD)" },
                  { expression: "∠B ≅ ∠D", explanation: "Alternate interior angles (AB ∥ CD)" },
                  { expression: "△ABE ≅ △CDE", explanation: "AAS" },
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
                    question: "What property lets you use a shared side in a congruence proof?",
                    options: ["Transitive", "Reflexive", "Symmetric", "Substitution"],
                    correctIndex: 1,
                  },
                  {
                    question: "After proving two triangles congruent, what justifies that their corresponding angles are congruent?",
                    options: ["AA Similarity", "CPCTC", "Triangle Angle Sum", "Exterior Angle Theorem"],
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
                    question: "In a proof, you identify two sides and the included angle as congruent. Which criterion do you use?",
                    options: ["SSS", "SAS", "ASA", "AAS"],
                    correctIndex: 1,
                  },
                  {
                    question: "Vertical angles formed by intersecting lines are used in proofs as what type of reason?",
                    options: ["Given", "Reflexive property", "Vertical Angles Theorem", "Definition of bisector"],
                    correctIndex: 2,
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
