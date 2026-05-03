import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_2Result> => {
    const now = Date.now();
    const lessonSlug = "8-2-domain-and-range";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Domain and Range",
          slug: lessonSlug,
          description: "Students identify the domain and range of relations and functions from various representations.",
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
          title: "Domain and Range",
          description: "Students identify the domain and range of relations and functions from various representations.",
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
              markdown: "## Explore: Inputs and Outputs\n\nConsider the function represented by the ordered pairs {(1, 3), (2, 5), (4, 9), (6, 13)}.\n\nWhat are all the possible inputs? What are all the possible outputs? How would you describe these sets?",
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
                    question: "The domain of a relation is the set of all:",
                    options: ["Outputs (y-values)", "Inputs (x-values)", "Ordered pairs", "Points on a graph"],
                    correctIndex: 1,
                  },
                  {
                    question: "For {(2,4), (3,6), (5,10)}, the range is:",
                    options: ["{2, 3, 5}", "{4, 6, 10}", "{(2,4), (3,6), (5,10)}", "{2, 4, 3, 6, 5, 10}"],
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
              markdown: "## Domain and Range\n\n### Definitions\n- **Domain**: The set of all possible input values (x-values)\n- **Range**: The set of all possible output values (y-values)\n\n### Notation\n- Use set-builder notation: {x | x > 0}\n- Use interval notation: (0, ∞)\n- Use inequality notation: x > 0\n\n### From a Graph\n- Domain: Project the graph onto the x-axis\n- Range: Project the graph onto the y-axis",
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
              markdown: "## Example: Find Domain and Range\n\nFind the domain and range of {(−2, 4), (0, 0), (2, 4), (4, 16)}.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "domain-range",
                equation: "{(-2,4), (0,0), (2,4), (4,16)}",
                steps: [
                  { expression: "x-values: -2, 0, 2, 4", explanation: "List all first coordinates" },
                  { expression: "Domain: {-2, 0, 2, 4}", explanation: "Set of all x-values" },
                  { expression: "y-values: 4, 0, 4, 16", explanation: "List all second coordinates" },
                  { expression: "Range: {0, 4, 16}", explanation: "Set of all unique y-values" },
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
                    question: "For f(x) = x + 3 with domain {0, 1, 2}, the range is:",
                    options: ["{0, 1, 2}", "{3, 4, 5}", "{1, 2, 3}", "{0, 3}"],
                    correctIndex: 1,
                  },
                  {
                    question: "If a graph extends from x = -3 to x = 5, the domain in interval notation is:",
                    options: ["[-3, 5]", "(-3, 5)", "[-5, 3]", "(-∞, ∞)"],
                    correctIndex: 0,
                  },
                  {
                    question: "The domain of y = √x is:",
                    options: ["All real numbers", "x ≥ 0", "x > 0", "x ≤ 0"],
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
                    question: "For {(1,5), (3,7), (5,9)}, the domain is:",
                    options: ["{5, 7, 9}", "{1, 3, 5}", "{1, 3, 5, 7, 9}", "{(1,5), (3,7), (5,9)}"],
                    correctIndex: 1,
                  },
                  {
                    question: "The range of a function that outputs only positive values is:",
                    options: ["(0, ∞)", "[0, ∞)", "(-∞, 0)", "(-∞, ∞)"],
                    correctIndex: 0,
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
