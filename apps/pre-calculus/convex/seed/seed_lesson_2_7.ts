import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_7Result> => {
    const now = Date.now();
    const lessonSlug = "2-7-composition-of-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Composition of Functions",
          slug: lessonSlug,
          description: "Students compose functions and evaluate composite functions from equations, tables, and graphs.",
          orderIndex: 7,
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
          title: "Composition of Functions",
          description: "Students compose functions and evaluate composite functions from equations, tables, and graphs.",
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(g(2))",
                steps: [
                  { expression: "f(x) = x², g(x) = x+3", explanation: "Given functions" },
                  { expression: "g(2) = 2 + 3 = 5", explanation: "Evaluate inner function first" },
                  { expression: "f(5) = 25", explanation: "Then evaluate outer function" },
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
              markdown: "## Composition of Functions\n\n### Definition\n\nThe composition of $f$ and $g$, written $(f \\circ g)(x)$ or $f(g(x))$, means:\n1. Apply $g$ first: compute $g(x)$\n2. Then apply $f$ to the result: compute $f(g(x))$\n\n### Key Ideas\n\n- **Order matters**: $f(g(x)) \\neq g(f(x))$ in general\n- **Domain**: $f \\circ g$ requires $x$ in domain of $g$ AND $g(x)$ in domain of $f$\n- Composition can be thought of as a chain of function machines\n\n### Notation\n\n$(f \\circ g)(x) = f(g(x))$\n$(g \\circ f)(x) = g(f(x))$",
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
              markdown: "## Example: Finding Composite Functions\n\nGiven $f(x) = 2x + 1$ and $g(x) = x^2$, find $(f \\circ g)(x)$ and $(g \\circ f)(x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = 2x + 1, g(x) = x^2",
                steps: [
                  { expression: "(f ∘ g)(x) = f(g(x)) = f(x²) = 2x² + 1", explanation: "Substitute g into f" },
                  { expression: "(g ∘ f)(x) = g(f(x)) = g(2x+1) = (2x+1)²", explanation: "Substitute f into g" },
                  { expression: "(2x+1)² = 4x² + 4x + 1", explanation: "Expand" },
                  { expression: "(f ∘ g)(x) = 2x² + 1 ≠ 4x² + 4x + 1 = (g ∘ f)(x)", explanation: "Order matters!" },
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
                    question: "If $f(x) = \\sqrt{x}$ and $g(x) = x + 4$, then $(f \\circ g)(x) =$",
                    options: ["√x + 4", "√(x + 4)", "(√x) + 4", "√x · √4"],
                    correctIndex: 1,
                  },
                  {
                    question: "Composition is generally:",
                    options: ["Commutative", "Not commutative", "Always equal", "Undefined"],
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
                equation: "h(x) = (x² - 1) / (x + 1), find h(g(x)) where g(x) = 2x",
                steps: [
                  { expression: "h(g(x)) = h(2x)", explanation: "Substitute g into h" },
                  { expression: "= ((2x)² - 1) / (2x + 1)", explanation: "Replace x with 2x" },
                  { expression: "= (4x² - 1) / (2x + 1)", explanation: "Simplify" },
                  { expression: "= (2x - 1)(2x + 1) / (2x + 1) = 2x - 1 for x ≠ -1/2", explanation: "Factor and cancel" },
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
