import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_15Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_15 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_15Result> => {
    const now = Date.now();
    const lessonSlug = "2-15-semi-log-plots";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Semi-log Plots",
          slug: lessonSlug,
          description: "Students interpret and create semi-log plots to identify exponential relationships in data.",
          orderIndex: 15,
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
          title: "Semi-log Plots",
          description: "Students interpret and create semi-log plots to identify exponential relationships in data.",
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "On a semi-log plot, the y-axis uses a:",
                    options: ["Linear scale", "Logarithmic scale", "Square root scale", "Reciprocal scale"],
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
              markdown: "## Semi-log Plots\n\n### What is a Semi-log Plot?\n\nA semi-log plot has one axis on a logarithmic scale and the other on a linear scale.\n\n### Key Insight\n\nIf $y = a \\cdot b^x$, then $\\log(y) = \\log(a) + x \\cdot \\log(b)$.\n\nThis is **linear in $x$**! So:\n- Plotting $(x, \\log(y))$ gives a straight line\n- A semi-log plot of exponential data appears linear\n\n### How to Read Semi-log Plots\n\n- **Straight line** on semi-log → exponential relationship\n- **Steep line** → rapid growth (large base)\n- **Flat line** → slow growth (base close to 1)\n- **Downward line** → exponential decay",
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
              markdown: "## Example: Interpreting a Semi-log Plot\n\nA semi-log plot shows data points forming a straight line passing through (0, 1) and (2, 3) on the linear x-axis, with corresponding log-scaled y-values. Find the exponential model.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Find y = a · b^x",
                steps: [
                  { expression: "log(y) = log(a) + x·log(b)", explanation: "Linearize" },
                  { expression: "At x = 0: log(y) = 1 → log(a) = 1 → a = 10", explanation: "From point (0, 1)" },
                  { expression: "At x = 2: log(y) = 3", explanation: "From point (2, 3)" },
                  { expression: "3 = 1 + 2·log(b) → log(b) = 1 → b = 10", explanation: "Find base" },
                  { expression: "Model: y = 10 · 10^x = 10^(x+1)", explanation: "Write the model" },
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
                    question: "On a semi-log plot, exponential growth appears as:",
                    options: ["A curve", "A straight line", "A parabola", "A circle"],
                    correctIndex: 1,
                  },
                  {
                    question: "A horizontal line on a semi-log plot indicates:",
                    options: ["Exponential growth", "Exponential decay", "Constant function", "Linear growth"],
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Semi-log data: x=1 log(y)=1.3; x=3 log(y)=1.9",
                steps: [
                  { expression: "Slope: (1.9 - 1.3)/(3 - 1) = 0.3", explanation: "Find slope of log(y) vs x" },
                  { expression: "log(b) = 0.3 → b = 10^0.3 ≈ 2", explanation: "Growth factor" },
                  { expression: "log(a) = 1.3 - 0.3(1) = 1.0 → a = 10", explanation: "Find initial value" },
                  { expression: "Model: y = 10 · 2^x", explanation: "Exponential model" },
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
