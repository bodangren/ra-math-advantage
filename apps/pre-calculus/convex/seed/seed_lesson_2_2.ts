import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_2Result> => {
    const now = Date.now();
    const lessonSlug = "2-2-linear-exponential-change";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Linear vs. Exponential Change",
          slug: lessonSlug,
          description: "Students compare additive (linear) and multiplicative (exponential) growth patterns in real-world contexts.",
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
          title: "Linear vs. Exponential Change",
          description: "Students compare additive (linear) and multiplicative (exponential) growth patterns in real-world contexts.",
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
                variant: "compare_functions",
                equations: ["y = 100 + 10x", "y = 100 * 1.1^x"],
                title: "Compare Linear and Exponential Growth",
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
              markdown: "## Linear vs. Exponential Change\n\n### Linear Growth\n- **Adds** a constant amount each period\n- $f(t) = f_0 + mt$\n- **Constant** differences between consecutive outputs\n- Graph: straight line\n\n### Exponential Growth\n- **Multiplies** by a constant factor each period\n- $f(t) = f_0 \\cdot b^t$\n- **Constant** ratios between consecutive outputs\n- Graph: curve that eventually overtakes linear\n\n### Key Distinction\n- Linear: equal **absolute** increases\n- Exponential: equal **percentage** increases\n- Exponential always eventually exceeds linear",
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
              markdown: "## Example: Comparing Growth Patterns\n\nJob A pays \\$50,000 with a \\$2,000 raise each year. Job B pays \\$40,000 with a 5% raise each year. When does Job B surpass Job A?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Compare linear and exponential",
                steps: [
                  { expression: "Job A: A(t) = 50000 + 2000t", explanation: "Linear model" },
                  { expression: "Job B: B(t) = 40000 · (1.05)^t", explanation: "Exponential model" },
                  { expression: "t=5: A=60000, B=40000·1.276≈51050", explanation: "Job A still ahead" },
                  { expression: "t=10: A=70000, B=40000·1.629≈65156", explanation: "Getting closer" },
                  { expression: "t=15: A=80000, B=40000·2.079≈83150", explanation: "Job B surpasses around year 15" },
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
                    question: "A linear function has:",
                    options: ["Constant ratios", "Constant differences", "Increasing differences", "Decreasing ratios"],
                    correctIndex: 1,
                  },
                  {
                    question: "An exponential function will always eventually:",
                    options: ["Become negative", "Overtake any linear function", "Level off", "Become linear"],
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
              componentKey: "rate-of-change-calculator",
              props: {
                variant: "compare_rates",
                equations: ["f(t) = 200 + 15t", "g(t) = 200 * 1.05^t"],
                interval: [0, 20],
                title: "Compare Growth Patterns",
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
