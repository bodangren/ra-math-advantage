import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_11Result> => {
    const now = Date.now();
    const lessonSlug = "1-11-equivalent-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Equivalent Representations",
          slug: lessonSlug,
          description: "Students convert between graphical, tabular, algebraic, and verbal representations of functions.",
          orderIndex: 11,
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
          title: "Equivalent Representations",
          description: "Students convert between graphical, tabular, algebraic, and verbal representations of functions.",
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
                equation: "y = (x - 1)(x + 2)",
                title: "Explore Equivalent Forms",
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
              markdown: "## Equivalent Representations\n\nFunctions can be represented in multiple ways, each revealing different features:\n\n### Four Representations\n\n1. **Algebraic**: $f(x) = x^2 + x - 2$\n2. **Factored**: $f(x) = (x-1)(x+2)$\n3. **Table**: Pairs of input-output values\n4. **Graph**: Visual curve on a coordinate plane\n5. **Verbal**: Words describing the relationship\n\n### Choosing the Right Form\n\n- **Zeros**: Use factored form\n- **Vertex/Extrema**: Use vertex form or complete the square\n- **Y-intercept**: Use standard form\n- **Rate of change**: Use table or graph\n- **End behavior**: Use standard form (leading term)",
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
              markdown: "## Example: Converting Between Forms\n\nConvert $f(x) = 2x^2 - 8x + 6$ to factored form and identify key features.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = 2x^2 - 8x + 6",
                steps: [
                  { expression: "Factor out 2: f(x) = 2(x^2 - 4x + 3)", explanation: "Factor out GCF" },
                  { expression: "f(x) = 2(x - 1)(x - 3)", explanation: "Factor the trinomial" },
                  { expression: "Zeros: x = 1 and x = 3", explanation: "From factored form" },
                  { expression: "Y-intercept: f(0) = 6", explanation: "From standard form" },
                  { expression: "Axis of symmetry: x = 2", explanation: "Midpoint of zeros" },
                  { expression: "Vertex: (2, -2)", explanation: "f(2) = 2(4) - 8(2) + 6 = -2" },
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
                    question: "Which form best reveals the zeros of a quadratic?",
                    options: ["Standard form", "Vertex form", "Factored form", "Table form"],
                    correctIndex: 2,
                  },
                  {
                    question: "Which representation best shows the rate of change?",
                    options: ["Factored form", "Graph or table", "Standard form", "Verbal form"],
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
                equation: "g(x) = x^2 - 6x + 8",
                steps: [
                  { expression: "Standard: x^2 - 6x + 8", explanation: "Given form" },
                  { expression: "Factored: (x - 2)(x - 4)", explanation: "Convert to factored" },
                  { expression: "Vertex: complete the square → (x-3)^2 - 1", explanation: "Convert to vertex form" },
                  { expression: "Zeros at x = 2, 4; Vertex at (3, -1)", explanation: "Key features from each form" },
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
