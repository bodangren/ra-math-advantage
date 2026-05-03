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
    const lessonSlug = "1-5-polynomial-functions-complex-zeros";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and Complex Zeros",
          slug: lessonSlug,
          description: "Students find real and complex zeros of polynomials using the Fundamental Theorem of Algebra and conjugate root theorem.",
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
          title: "Polynomial Functions and Complex Zeros",
          description: "Students find real and complex zeros of polynomials using the Fundamental Theorem of Algebra and conjugate root theorem.",
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
                equation: "y = x^2 + 1",
                title: "Explore Polynomials with No Real Zeros",
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
              markdown: "## Polynomial Functions and Complex Zeros\n\n### Fundamental Theorem of Algebra\nEvery polynomial of degree $n$ has exactly $n$ zeros (counting multiplicity) in the complex number system.\n\n### Conjugate Root Theorem\nIf a polynomial has real coefficients and $a + bi$ is a zero, then $a - bi$ is also a zero.\n\n### Key Ideas\n\n- A degree $n$ polynomial always has $n$ zeros (real or complex)\n- Complex zeros come in conjugate pairs for polynomials with real coefficients\n- If $n$ is odd, the polynomial has at least one real zero\n- **Multiplicity**: If $(x - r)^k$ is a factor, $r$ is a zero of multiplicity $k$",
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
              markdown: "## Example: Finding All Zeros\n\nFind all zeros of $f(x) = x^3 - 4x^2 + 6x - 4$, given that $x = 2$ is one zero.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = x^3 - 4x^2 + 6x - 4",
                steps: [
                  { expression: "Since x = 2 is a zero, (x - 2) is a factor", explanation: "Factor theorem" },
                  { expression: "Divide: (x^3 - 4x^2 + 6x - 4) / (x - 2) = x^2 - 2x + 2", explanation: "Synthetic or long division" },
                  { expression: "x^2 - 2x + 2 = 0", explanation: "Solve the quadratic factor" },
                  { expression: "x = (2 ± sqrt(4-8))/2 = (2 ± 2i)/2 = 1 ± i", explanation: "Quadratic formula" },
                  { expression: "Zeros: x = 2, x = 1 + i, x = 1 - i", explanation: "All three zeros found" },
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
                    question: "A degree 4 polynomial with real coefficients could have how many real zeros?",
                    options: ["Only 4", "0, 2, or 4", "1, 2, 3, or 4", "Exactly 2"],
                    correctIndex: 1,
                  },
                  {
                    question: "If $3 + 2i$ is a zero of a polynomial with real coefficients, another zero must be:",
                    options: ["-3 + 2i", "3 - 2i", "-3 - 2i", "2 + 3i"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = x^4 - 5x^2 + 4",
                steps: [
                  { expression: "Let u = x^2: u^2 - 5u + 4 = 0", explanation: "Substitution" },
                  { expression: "(u - 1)(u - 4) = 0", explanation: "Factor" },
                  { expression: "u = 1 or u = 4", explanation: "Solve for u" },
                  { expression: "x^2 = 1 → x = ±1; x^2 = 4 → x = ±2", explanation: "Back-substitute" },
                  { expression: "Zeros: x = -2, -1, 1, 2", explanation: "All four real zeros" },
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
