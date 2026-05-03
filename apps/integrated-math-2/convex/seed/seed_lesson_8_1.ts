import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_1Result> => {
    const now = Date.now();
    const lessonSlug = "8-1-relations-vs-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Relations vs Functions",
          slug: lessonSlug,
          description: "Students distinguish between relations and functions using tables, mappings, and graphs.",
          orderIndex: 1,
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
          title: "Relations vs Functions",
          description: "Students distinguish between relations and functions using tables, mappings, and graphs.",
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
              markdown: "## Explore: What Makes a Function?\n\nConsider the following sets of ordered pairs:\n- Set A: {(1, 2), (2, 4), (3, 6)}\n- Set B: {(1, 2), (1, 4), (3, 6)}\n\nWhat differences do you notice? Which input in Set B causes a problem?",
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
                    question: "A relation is a function if each input has:",
                    options: ["Multiple outputs", "Exactly one output", "At least one output", "No outputs"],
                    correctIndex: 1,
                  },
                  {
                    question: "Which set {(1,3), (2,5), (2,7)} is a function?",
                    options: ["Yes", "No", "Cannot determine", "Only if x > 0"],
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
              markdown: "## Relations vs Functions\n\n### Definitions\n- **Relation**: Any set of ordered pairs (x, y)\n- **Function**: A relation where each input (x) maps to exactly one output (y)\n\n### Vertical Line Test\nA graph represents a function if every vertical line crosses the graph at most once.\n\n### Ways to Represent Relations\n1. Set of ordered pairs\n2. Table of values\n3. Mapping diagram\n4. Graph\n5. Equation",
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
              markdown: "## Example: Is It a Function?\n\nDetermine whether {(2, 3), (4, 5), (6, 7), (2, 9)} is a function.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "classification",
                equation: "Relation: {(2,3), (4,5), (6,7), (2,9)}",
                steps: [
                  { expression: "Input 2 → Output 3", explanation: "First pair with input 2" },
                  { expression: "Input 2 → Output 9", explanation: "Second pair with input 2" },
                  { expression: "Input 2 has two outputs", explanation: "Violates the function definition" },
                  { expression: "NOT a function", explanation: "An input must map to exactly one output" },
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
                    question: "Is {(1,4), (2,5), (3,6), (4,7)} a function?",
                    options: ["Yes", "No", "Cannot determine", "Only sometimes"],
                    correctIndex: 0,
                  },
                  {
                    question: "A mapping where x={1,2,3} and y={4} with all x mapping to 4 is:",
                    options: ["Not a function", "A function", "A relation only", "Undefined"],
                    correctIndex: 1,
                  },
                  {
                    question: "The vertical line test applies to:",
                    options: ["Tables", "Graphs", "Equations", "Mappings"],
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
                    question: "Is {(3,1), (3,2), (4,5), (5,6)} a function?",
                    options: ["Yes", "No", "Cannot determine", "Only if sorted"],
                    correctIndex: 1,
                  },
                  {
                    question: "Which representation always allows the vertical line test?",
                    options: ["Table", "Mapping diagram", "Graph", "Ordered pairs"],
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
