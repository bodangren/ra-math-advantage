import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Graphing Rational Functions",
          slug: lessonSlug,
          description:
            "Students graph and analyze rational functions with vertical, horizontal, and oblique asymptotes, and identify point discontinuities.",
          orderIndex: 4,
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
          title: "Graphing Rational Functions",
          description:
            "Students graph and analyze rational functions with vertical, horizontal, and oblique asymptotes, and identify point discontinuities.",
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
                "## Explore: Analyzing Rational Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow can you use a graphing calculator to analyze a rational function?",
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
                title: "Rational Functions",
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
                "## Key Terms\n\n- **Rational function**: A function of the form `f(x) = a(x)/b(x)` where `a(x)` and `b(x)` are polynomial functions and `b(x) != 0`.\n- **Vertical asymptote**: A vertical line that the graph approaches but never crosses, occurring where the denominator equals zero (with no common factors).\n- **Horizontal asymptote**: A horizontal line that the graph approaches as `x` goes to positive or negative infinity.\n- **Oblique asymptote**: A slanted line that the graph approaches, occurring when the degree of the numerator is exactly one greater than the degree of the denominator.\n- **Point discontinuity (hole)**: A single point where the function is undefined because a common factor cancels in the numerator and denominator.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Rational Functions with Vertical and Horizontal Asymptotes",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Rational Functions with Vertical and Horizontal Asymptotes\n\nA rational function has the form:\n\n`f(x) = a(x)/b(x)`\n\nwhere `a(x)` and `b(x)` are polynomial functions and `b(x) != 0`.\n\n### Key Concept: Vertical and Horizontal Asymptotes\n\nIf `a(x)` and `b(x)` have no common factors:\n\n* vertical asymptotes occur where `b(x) = 0`\n* there is at most one horizontal asymptote\n* if `deg a(x) > deg b(x)`, there is no horizontal asymptote\n* if `deg a(x) < deg b(x)`, the horizontal asymptote is `y = 0`\n* if `deg a(x) = deg b(x)`, the horizontal asymptote is the ratio of leading coefficients",
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
                "## Example 1 — Graph with No Horizontal Asymptotes\n\nGraph:\n\n`f(x) = x^3 / (x + 2/3)`\n\n### Step 1: Find the zeros\n\nSet the numerator equal to `0`:\n\n`x^3 = 0`\n\n`x = 0`\n\n### Step 2: Find the asymptotes\n\nSet the denominator equal to `0`:\n\n`x + 2/3 = 0`\n\n`x = -2/3`\n\nSo there is a vertical asymptote at `x = -2/3`.\n\nBecause the degree of the numerator is greater than the degree of the denominator, there is no horizontal asymptote.\n\n### Step 3: Graph\n\nUse the asymptote and a table of values to sketch the graph.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^3 / (x + 2/3)",
                steps: [
                  { expression: "x^3 = 0", explanation: "Set the numerator equal to 0 to find zeros" },
                  { expression: "x = 0", explanation: "Solve for the zero of the function" },
                  { expression: "x + 2/3 = 0", explanation: "Set the denominator equal to 0" },
                  { expression: "x = -2/3", explanation: "Find the vertical asymptote" },
                  { expression: "no horizontal asymptote", explanation: "Degree of numerator > degree of denominator" },
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
                "## Example 2 — Use Graphs of Rational Functions\n\nYoung's Rule can be modeled by:\n\n`y = Ax/(x + 12)`\n\nwhere `A` is the adult dose and `x` is the child's age.\n\nFor `A = 200`:\n\n`y = 200x/(x + 12)`\n\n### Part A: Graph the function\n\n* vertical asymptote: `x = -12`\n* horizontal asymptote: `y = 200`\n\n### Part B: Find key features\n\n* x-intercept: `0`\n* y-intercept: `0`\n* end behavior:\n  * as `x -> infinity`, `y -> 200`\n  * as `x -> -infinity`, `y -> 200`\n\n### Part C: Use the graph\n\nFor a `12`-year-old child:\n\n`y = 200(12)/(12 + 12) = 100`\n\nSo the dosage is `100` milligrams.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = 200x/(x + 12)",
                steps: [
                  { expression: "vertical asymptote: x = -12", explanation: "Set denominator x + 12 = 0" },
                  { expression: "horizontal asymptote: y = 200", explanation: "Ratio of leading coefficients (equal degrees)" },
                  { expression: "x-intercept: 0, y-intercept: 0", explanation: "Find where the graph crosses the axes" },
                  { expression: "y = 200(12)/(12 + 12) = 100", explanation: "Calculate dosage for a 12-year-old" },
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
                "## Example 3 — Compare Rational Functions\n\nConsider:\n\n`g(x) = (x - 2)/(2x + 2)`\n\nand another rational function `h(x)` from the graph.\n\n### Part A: Graph `g(x)`\n\nSet the numerator equal to `0`:\n\n`x - 2 = 0`\n\n`x = 2`\n\nSo there is a zero at `x = 2`.\n\nSet the denominator equal to `0`:\n\n`2x + 2 = 0`\n\n`x = -1`\n\nSo there is a vertical asymptote at `x = -1`.\n\nSince the numerator and denominator have the same degree, the horizontal asymptote is:\n\n`y = 1/2`\n\n### Part B: Compare y-intercepts\n\n`g(x)` has y-intercept `-1`. The graph of `h(x)` shows a lower y-intercept.\n\n### Part C: Compare the asymptotes\n\n* `g(x)`: vertical asymptote `x = -1`, horizontal asymptote `y = 1/2`\n* `h(x)`: vertical asymptote `x = 1`, horizontal asymptote `y = 1`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = (x - 2)/(2x + 2)",
                steps: [
                  { expression: "x - 2 = 0, x = 2", explanation: "Find the zero by setting the numerator equal to 0" },
                  { expression: "2x + 2 = 0, x = -1", explanation: "Find the vertical asymptote" },
                  { expression: "y = 1/2", explanation: "Horizontal asymptote is the ratio of leading coefficients" },
                  { expression: "g(x) y-intercept = -1", explanation: "Substitute x = 0 to find the y-intercept" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Graphing Rational Functions with Oblique Asymptotes",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Rational Functions with Oblique Asymptotes\n\nAn **oblique asymptote** is neither vertical nor horizontal.\n\n### Key Concept: Oblique Asymptotes\n\nA rational function has an oblique asymptote when:\n\n`deg a(x) - deg b(x) = 1`\n\nThe oblique asymptote is the quotient found by polynomial division, ignoring the remainder.\n\nIn some cases, rational functions also have a **point discontinuity**, or hole, when a common factor cancels but the original denominator still excludes that value.\n\n### Key Concept: Point Discontinuity\n\nIf `x - c` is a factor of both numerator and denominator, then there is a point discontinuity at `x = c`.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Graph with Oblique Asymptotes\n\nConsider:\n\n`f(x) = (x^2 + 2x + 1)/(x + 4)`\n\n### Part A: Find the zeros\n\n`x^2 + 2x + 1 = 0`\n\n`(x + 1)^2 = 0`\n\n`x = -1`\n\n### Part B: Find the asymptotes\n\nVertical asymptote:\n\n`x + 4 = 0`\n\n`x = -4`\n\nBecause the degree difference is `1`, there is an oblique asymptote.\n\nDivide:\n\n`(x^2 + 2x + 1) / (x + 4) = x - 2` with remainder\n\nSo the oblique asymptote is:\n\n`y = x - 2`\n\n### Part C: Graph the function\n\nGraph the vertical asymptote and the oblique asymptote, then plot the function.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = (x^2 + 2x + 1)/(x + 4)",
                steps: [
                  { expression: "(x + 1)^2 = 0, x = -1", explanation: "Find the zero by factoring the numerator" },
                  { expression: "x + 4 = 0, x = -4", explanation: "Find the vertical asymptote" },
                  { expression: "oblique asymptote: y = x - 2", explanation: "Quotient from polynomial division" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Graph with Point Discontinuity\n\nGraph:\n\n`f(x) = (x^2 - 4)/(x + 2)`\n\nFactor:\n\n`(x^2 - 4)/(x + 2) = ((x + 2)(x - 2))/(x + 2) = x - 2`\n\nBut the original denominator is `0` when:\n\n`x + 2 = 0`\n\n`x = -2`\n\nSo the graph is the line `y = x - 2` with a hole at `x = -2`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = (x^2 - 4)/(x + 2)",
                steps: [
                  { expression: "(x^2 - 4)/(x + 2) = ((x + 2)(x - 2))/(x + 2)", explanation: "Factor the numerator" },
                  { expression: "= x - 2", explanation: "Cancel the common factor" },
                  { expression: "x + 2 = 0, x = -2", explanation: "Original denominator is 0 at x = -2" },
                  { expression: "hole at (-2, -4)", explanation: "The line y = x - 2 has a point discontinuity at x = -2" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How do you find the vertical asymptote of a rational function?\n2. What determines whether a rational function has a horizontal asymptote?\n3. When does a rational function have an oblique asymptote?\n4. What is the difference between a vertical asymptote and a point discontinuity (hole)?",
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
                    question: "Where do vertical asymptotes of a rational function occur?",
                    options: ["Where the numerator equals zero", "Where the denominator equals zero (with no common factors)", "Where the function crosses the x-axis"],
                    correctIndex: 1,
                  },
                  {
                    question: "A rational function has an oblique asymptote when the degree of the numerator is how much greater than the denominator?",
                    options: ["0", "1", "2"],
                    correctIndex: 1,
                  },
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
                "## Reflection\n\nToday you learned about graphing rational functions. Consider the following:\n\n- How do you identify vertical, horizontal, and oblique asymptotes?\n- What is a point discontinuity and how do you find it?\n- How can you use asymptotes to sketch a rational function quickly?\n- What questions do you still have about rational functions?",
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
