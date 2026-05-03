import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson13_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson13_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson13_2Result> => {
    const now = Date.now();
    const lessonSlug = "13-2-pythagorean-identities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Pythagorean Identities",
          slug: lessonSlug,
          description: "Students derive and apply the three Pythagorean identities to simplify trig expressions.",
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
          title: "Pythagorean Identities",
          description: "Students derive and apply the three Pythagorean identities to simplify trig expressions.",
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
              markdown: "## Explore: From Geometry to Identity\n\nOn the unit circle, a point (cos θ, sin θ) satisfies x² + y² = 1.\n\nSubstituting: cos²θ + sin²θ = ?\n\nWhat does this tell us? Is it true for ALL angles?",
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
                    question: "sin²(30°) + cos²(30°) =",
                    options: ["0", "1", "0.5", "Depends on the angle"],
                    correctIndex: 1,
                  },
                  {
                    question: "If cos(θ) = 3/5, then sin²(θ) =",
                    options: ["9/25", "16/25", "4/5", "3/4"],
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
              markdown: "## Pythagorean Identities\n\n### The Three Identities\n1. **sin²θ + cos²θ = 1** (from unit circle)\n2. **1 + tan²θ = sec²θ** (divide #1 by cos²θ)\n3. **1 + cot²θ = csc²θ** (divide #1 by sin²θ)\n\n### Rearrangements\n- sin²θ = 1 − cos²θ\n- cos²θ = 1 − sin²θ\n- tan²θ = sec²θ − 1\n- cot²θ = csc²θ − 1\n\n### Applications\n- Simplify expressions\n- Verify identities\n- Solve trig equations",
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
              markdown: "## Example: Simplify Using Pythagorean Identity\n\nSimplify (1 − sin²θ) / cos²θ.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "identity-simplification",
                equation: "(1 - sin²θ) / cos²θ",
                steps: [
                  { expression: "1 - sin²θ = cos²θ", explanation: "Pythagorean identity rearranged" },
                  { expression: "cos²θ / cos²θ", explanation: "Substitute" },
                  { expression: "= 1", explanation: "Simplify" },
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
                    question: "sin²θ + cos²θ + tan²θ − sec²θ simplifies to:",
                    options: ["0", "1", "2", "tan²θ"],
                    correctIndex: 0,
                  },
                  {
                    question: "If sin(θ) = 4/5, then cos²(θ) =",
                    options: ["9/25", "16/25", "3/5", "4/25"],
                    correctIndex: 0,
                  },
                  {
                    question: "sec²θ − tan²θ equals:",
                    options: ["0", "1", "sin²θ", "cos²θ"],
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
                    question: "sin²θ × sec²θ + sin²θ × tan²θ simplifies using identities to:",
                    options: ["sin²θ", "tan²θ", "sec²θ", "1"],
                    correctIndex: 1,
                  },
                  {
                    question: "csc²θ − cot²θ − 1 equals:",
                    options: ["-1", "0", "1", "2"],
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
