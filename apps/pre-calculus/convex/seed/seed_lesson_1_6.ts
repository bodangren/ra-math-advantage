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
    const lessonSlug = "1-6-polynomial-functions-end-behavior";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and End Behavior",
          slug: lessonSlug,
          description: "Students analyze the end behavior of polynomial functions based on degree and leading coefficient.",
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
          title: "Polynomial Functions and End Behavior",
          description: "Students analyze the end behavior of polynomial functions based on degree and leading coefficient.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = x^4 - 3x^2 + 1",
                title: "Explore Polynomial End Behavior",
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
              markdown: "## End Behavior of Polynomials\n\nThe end behavior of a polynomial is determined by its **leading term** $a_n x^n$.\n\n### Rules\n\n| Degree $n$ | Leading Coeff $a_n > 0$ | Leading Coeff $a_n < 0$ |\n|---|---|---|\n| Even | Both ends up: $\\uparrow \\quad \\uparrow$ | Both ends down: $\\downarrow \\quad \\downarrow$ |\n| Odd | Left down, right up: $\\downarrow \\quad \\uparrow$ | Left up, right down: $\\uparrow \\quad \\downarrow$ |\n\n### Why It Matters\n\n- End behavior tells us where the graph goes as $x \\to \\pm\\infty$\n- The leading term dominates for very large $|x|$\n- End behavior helps us sketch graphs without plotting many points",
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
              markdown: "## Example: Determine End Behavior\n\nDescribe the end behavior of $f(x) = -2x^5 + 3x^3 - x + 7$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = -2x^5 + 3x^3 - x + 7",
                steps: [
                  { expression: "Leading term: -2x^5", explanation: "Identify the leading term" },
                  { expression: "Degree: 5 (odd)", explanation: "Determine the degree" },
                  { expression: "Leading coefficient: -2 (negative)", explanation: "Check sign" },
                  { expression: "Odd degree + negative coefficient", explanation: "Apply the rule" },
                  { expression: "As x → -∞, f(x) → +∞; As x → +∞, f(x) → -∞", explanation: "Left rises, right falls" },
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "For $f(x) = 3x^6 - 2x^2 + 1$, the end behavior is:",
                    options: ["Left down, right up", "Both ends up", "Both ends down", "Left up, right down"],
                    correctIndex: 1,
                  },
                  {
                    question: "A polynomial with odd degree and negative leading coefficient has end behavior:",
                    options: ["Both up", "Both down", "Left up, right down", "Left down, right up"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = -x^4 + 2x^2",
                title: "Verify End Behavior",
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
