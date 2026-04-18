import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Solving Quadratic Equations by Graphing",
          slug: lessonSlug,
          description: "Students interpret x-intercepts as solutions.",
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
          title: "Solving Quadratic Equations by Graphing",
          description: "Students interpret x-intercepts as solutions.",
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
            sectionType: "text" as const,
            content: {
              markdown: "## Explore: Finding Zeros Graphically\n\nIn this lesson, you'll learn how to find the solutions to quadratic equations by looking at their graphs. The **x-intercepts** of the graph are the solutions!\n\n**Key Idea**: When $f(x) = 0$, the point $(x, 0)$ lies on the x-axis. These are the x-intercepts.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 4",
                title: "Find the Zeros",
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
              markdown: "## Key Terms\n\n- **Zero (or root)**: A value of $x$ where $f(x) = 0$\n- **X-intercept**: The point $(x, 0)$ where the graph crosses the x-axis\n- **Solution**: A value that makes the equation true\n- **Parabola**: The U-shaped graph of a quadratic function\n\n**Remember**: The zeros of a function are the x-intercepts of its graph!",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving $f(x) = 0$ by Graphing\n\nTo find the solutions of a quadratic equation graphically:\n\n1. **Rewrite** the equation in the form $f(x) = 0$\n2. **Graph** the related function $y = f(x)$\n3. **Identify** the x-intercepts (where the graph crosses the x-axis)\n4. **Read** the solutions from the x-intercepts\n\n### Types of Solutions\n\n- **Two real solutions**: The parabola crosses the x-axis at two points\n- **One real solution**: The parabola touches the x-axis at its vertex (tangent)\n- **No real solutions**: The parabola lies entirely above or below the x-axis",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 1: One Real Solution\n\nSolve $x^2 = 0$ by graphing.\n\n**Step 1**: Rewrite as $f(x) = x^2$\n**Step 2**: Graph $y = x^2$\n**Step 3**: Find where $y = 0$ (the x-intercept)\n\nThe graph touches the x-axis at the origin. The only solution is $x = 0$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 = 0",
                steps: [
                  { expression: "x^2 = 0", explanation: "Write in standard form" },
                  { expression: "y = x^2", explanation: "Related function" },
                  { expression: "Vertex at (0, 0)", explanation: "The parabola touches x-axis at origin" },
                  { expression: "Solution: x = 0", explanation: "One repeated root" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2: Two Real Solutions\n\nSolve $x^2 - 4 = 0$ by graphing.\n\n**Step 1**: $f(x) = x^2 - 4$\n**Step 2**: Graph $y = x^2 - 4$\n**Step 3**: The parabola crosses the x-axis at $x = -2$ and $x = 2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 - 4 = 0",
                steps: [
                  { expression: "x^2 - 4 = 0", explanation: "Write in standard form" },
                  { expression: "y = x^2 - 4", explanation: "Related function" },
                  { expression: "y = (x+2)(x-2)", explanation: "Factor to find intercepts" },
                  { expression: "x = -2 or x = 2", explanation: "Two x-intercepts" },
                  { expression: "Solutions: x = -2, 2", explanation: "Two real solutions" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Estimate Roots from a Graph\n\nWhen the intercepts aren't integers, we estimate from the graph.\n\nFor $x^2 - 2x - 3 = 0$, the graph shows intercepts at approximately $x = -1$ and $x = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 2x - 3",
                title: "Estimate Zeros Graphically",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Using a Table to Confirm\n\nUse the TABLE feature on your calculator to confirm the zeros.\n\nFor $y = x^2 - 2x - 3$, check values near your estimated zeros.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 - 2x - 3 = 0",
                steps: [
                  { expression: "f(-1) = (-1)^2 - 2(-1) - 3 = 0", explanation: "Check x = -1" },
                  { expression: "f(3) = 3^2 - 2(3) - 3 = 0", explanation: "Check x = 3" },
                  { expression: "Solutions confirmed: x = -1, 3", explanation: "Zeros verified" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Solve by Using a Calculator\n\nUse a graphing calculator to solve a quadratic equation when exact intercepts are difficult to read.\n\n**Step 1**: Enter the related function.\n\n**Step 2**: Graph the function and locate where it crosses the x-axis.\n\n**Step 3**: Use the calculator's zero feature to approximate each solution.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 3x - 1",
                title: "Use Technology to Approximate Zeros",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why is it called \"solving by graphing\"?\n2. When might graphing be preferable to factoring?\n3. What does it mean when a quadratic has \"no real solutions\"?\n4. How can you check your graphical solution?",
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
                    question: "The x-intercepts of y = f(x) are also called:",
                    options: ["the zeros", "the vertex", "the axis", "the domain"],
                    correctIndex: 0,
                  },
                  {
                    question: "A parabola that doesn't cross the x-axis has:",
                    options: ["two real solutions", "one real solution", "no real solutions", "infinitely many solutions"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned to solve quadratic equations by finding x-intercepts on a graph.\n\n- What did you find challenging about reading solutions from a graph?\n- How does the discriminant (from the quadratic formula) relate to the number of x-intercepts?\n- When might you prefer algebraic methods over graphing?",
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
