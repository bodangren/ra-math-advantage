import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Graphing Reciprocal Functions",
          slug: lessonSlug,
          description:
            "Students graph reciprocal functions by making tables of values and by using transformations.",
          orderIndex: 3,
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
          title: "Graphing Reciprocal Functions",
          description:
            "Students graph reciprocal functions by making tables of values and by using transformations.",
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
              markdown:
                "## Explore: Reciprocal Functions\n\nUse the interactive tool to explore the parent reciprocal function.\n**Inquiry Question:**\nHow does the graph of a reciprocal function differ from other functions you have studied?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = 1/x",
                title: "Reciprocal Functions",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Reciprocal function**: A function of the form `f(x) = n / b(x)` where `n` is a real number and `b(x)` is a linear expression.\n- **Vertical asymptote**: A vertical line that the graph approaches but never crosses.\n- **Horizontal asymptote**: A horizontal line that the graph approaches but never reaches.\n- **Hyperbola**: The curved graph of a reciprocal function.\n- **Excluded values**: Values of `x` that make the denominator zero.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Reciprocal Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Reciprocal Functions\n\nA reciprocal function has the form:\n\n`f(x) = n / b(x)`\n\nwhere `n` is a real number and `b(x)` is a linear expression that cannot equal `0`.\n\nThe parent function is:\n\n\n`f(x) = 1/x`\n\n\nIts graph is a hyperbola.\n\n### Key Concept: Reciprocal Functions\n\nFor `f(x) = 1/x`:\n\n\n* type of graph: hyperbola\n* domain: all nonzero real numbers\n* range: all nonzero real numbers\n* asymptotes: `x = 0` and `y = 0`\n* intercepts: none",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Limitations on the Domains of Reciprocal Functions\n\nDetermine the excluded value of `x` for each function.\n\n### a. `g(x) = 6/x`\n\nUndefined when `x = 0`\n\n### b. `g(x) = 2/(x - 7)`\n\nSet the denominator equal to `0`:\n\n`x - 7 = 0`\n\n`x = 7`\n\n### c. `g(x) = -5/(3x + 4)`\n\nSet the denominator equal to `0`:\n\n\n`3x + 4 = 0`\n\n`x = -4/3`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2/(x - 7)",
                steps: [
                  { expression: "x - 7 = 0", explanation: "Set the denominator equal to 0" },
                  { expression: "x = 7", explanation: "Solve for x to find the excluded value" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Graph a Reciprocal Function by Using a Table\n\nConsider:\n\n`g(x) = 1/(2x - 5) + 2`\n\n### Part A: Identify key features\n\nSet the denominator equal to `0`:\n\n`2x - 5 = 0`\n\n`x = 5/2`\n\n\nSo:\n\n* vertical asymptote: `x = 5/2`\n* horizontal asymptote: `y = 2`\n* domain: `{x | x != 5/2}`\n* range: `{g(x) | g(x) != 2}`\n\n### Part B: Find the intercepts\n\nFor the x-intercept, set `g(x) = 0`:\n\n`0 = 1/(2x - 5) + 2`\n\n\n`-2 = 1/(2x - 5)`\n\n`-2(2x - 5) = 1`\n\n\n`-4x + 10 = 1`\n\n`x = 2.25`\n\n\nFor the y-intercept, substitute `x = 0`:\n\n`g(0) = 1/(-5) + 2 = 1.8`\n\nSo:\n\n* x-intercept: `2.25`\n* y-intercept: `1.8`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "1/(2x - 5) + 2",
                steps: [
                  { expression: "2x - 5 = 0", explanation: "Set the denominator equal to 0" },
                  { expression: "x = 5/2", explanation: "Find the vertical asymptote (excluded value)" },
                  { expression: "x-intercept: 0 = 1/(2x - 5) + 2, solve for x", explanation: "Find the x-intercept by solving g(x) = 0" },
                  { expression: "x = 2.25", explanation: "Calculate the x-intercept" },
                  { expression: "y-intercept: g(0) = 1/(-5) + 2 = 1.8", explanation: "Find the y-intercept by substituting x = 0" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Analyze a Reciprocal Function\n\nOhm's law is:\n\n`I = V/R`\n\n\nFor a `110`-volt curling iron:\n\n\n`I = 110/R`\n\n### Part A: Write and graph a function\n\nThe function is:\n\n`I = 110/R`\n\n\nwith asymptotes:\n\n\n* `R = 0`\n* `I = 0`\n\n### Part B: Analyze the key features\n\n\n* domain: `{R | R != 0}`\n* range: `{I | I != 0}`\n* intercepts: none\n* positive when `R > 0`\n* negative when `R < 0`\n* symmetric about the origin\n* end behavior:\n  * as `R -> -infinity`, `I -> 0`\n  * as `R -> infinity`, `I -> 0`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "110/R",
                steps: [
                  { expression: "I = 110/R", explanation: "Set up the function from Ohm's law" },
                  { expression: "vertical asymptote: R = 0", explanation: "Identify the excluded value" },
                  { expression: "horizontal asymptote: I = 0", explanation: "Identify the end behavior asymptote" },
                  { expression: "domain: {R | R != 0}", explanation: "State the domain excluding the asymptote" },
                  { expression: "range: {I | I != 0}", explanation: "State the range excluding the asymptote" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why do reciprocal functions have a restricted domain?\n2. How do you determine the vertical asymptote of a reciprocal function?\n3. What is the difference between a vertical and horizontal asymptote?\n4. How does the sign of the coefficient `a` affect the graph of `g(x) = a/(x - h) + k`?",
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
                    question: "What is the vertical asymptote of g(x) = 1/(x - 3)?",
                    options: ["x = 3", "y = 3", "x = -3"],
                    correctIndex: 0,
                  },
                  {
                    question: "What type of graph does the parent reciprocal function f(x) = 1/x produce?",
                    options: ["Parabola", "Hyperbola", "Line"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Transformations of Reciprocal Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Transformations of Reciprocal Functions\n\nFor:\n\n`g(x) = a/(x - h) + k`\n\n* `h` shifts the graph left or right and sets the vertical asymptote `x = h`\n* `k` shifts the graph up or down and sets the horizontal asymptote `y = k`\n* `a` controls orientation and stretch/compression",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Graph a Transformation of a Reciprocal Function\n\nGraph:\n\n`g(x) = -4/(x + 1) - 2`\n\nThis is a transformation of `f(x) = 1/x`.\n\n* `a = -4`: reflect across the x-axis and stretch vertically\n* `h = -1`: translate left `1`\n* `k = -2`: translate down `2`\n\nSo:\n\n* vertical asymptote: `x = -1`\n* horizontal asymptote: `y = -2`\n* domain: `{x | x != -1}`\n* range: `{g(x) | g(x) != -2}`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "-4/(x + 1) - 2",
                steps: [
                  { expression: "a = -4, h = -1, k = -2", explanation: "Identify transformation parameters" },
                  { expression: "vertical asymptote: x = -1", explanation: "h determines the vertical asymptote" },
                  { expression: "horizontal asymptote: y = -2", explanation: "k determines the horizontal asymptote" },
                  { expression: "domain: {x | x != -1}", explanation: "Domain excludes the vertical asymptote" },
                  { expression: "range: {g(x) | g(x) != -2}", explanation: "Range excludes the horizontal asymptote" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Write a Reciprocal Function from a Graph\n\nWrite a function in the form:\n\n`g(x) = a/(x - h) + k`\n\nThe graph has asymptotes:\n\n\n* `x = -4`\n* `y = -2`\n\nSo:\n\n* `h = -4`\n* `k = -2`\n\nUsing the point `(-3, 3)`:\n\n\n`3 = a/((-3) - (-4)) - 2`\n\n`3 = a - 2`\n\n\n`a = 5`\n\nSo the function is:\n\n`g(x) = 5/(x + 4) - 2`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = 5/(x + 4) - 2",
                steps: [
                  { expression: "h = -4, k = -2 from asymptotes", explanation: "Identify h and k from the asymptotes" },
                  { expression: "3 = a/((-3) - (-4)) - 2", explanation: "Substitute the point (-3, 3) into the general form" },
                  { expression: "3 = a - 2", explanation: "Simplify the equation" },
                  { expression: "a = 5", explanation: "Solve for a" },
                  { expression: "g(x) = 5/(x + 4) - 2", explanation: "Write the final function" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about graphing reciprocal functions. Consider the following:\n\n- How do you identify the asymptotes of a reciprocal function?\n- How do transformations affect the graph of a reciprocal function?\n- What is the domain and range of a reciprocal function?\n- What questions do you still have about reciprocal functions?",
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