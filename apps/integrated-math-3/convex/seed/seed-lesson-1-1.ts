import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Graphing Quadratic Functions",
          slug: lessonSlug,
          description: "Students analyze vertex form, standard form, and intercept form.",
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
          title: "Graphing Quadratic Functions",
          description: "Students analyze vertex form, standard form, and intercept form.",
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
                equation: "y = x^2",
                title: "Explore Quadratic Graphs",
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
              markdown: "## Key Terms\n\n- **Quadratic function**: A function of the form $f(x) = ax^2 + bx + c$ where $a \\neq 0$\n- **Parabola**: The U-shaped graph of a quadratic function\n- **Vertex**: The highest or lowest point of a parabola\n- **Axis of symmetry**: The vertical line that divides the parabola into mirror images\n- **Standard form**: $f(x) = ax^2 + bx + c$\n- **Vertex form**: $f(x) = a(x-h)^2 + k$ where $(h,k)$ is the vertex\n- **Intercept form**: $f(x) = a(x-p)(x-q)$ where $p$ and $q$ are x-intercepts",
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
              markdown: "## Understanding Quadratic Functions\n\nA **quadratic function** is a polynomial function of degree 2. Its graph is a parabola.\n\n### Three Forms of Quadratic Functions\n\n**Standard Form:** $f(x) = ax^2 + bx + c$\n- The coefficients $a$, $b$, and $c$ reveal different information\n- $a$ determines the direction (up if $a > 0$, down if $a < 0$) and width\n- $c$ is the y-intercept\n\n**Vertex Form:** $f(x) = a(x-h)^2 + k$\n- The vertex is at $(h, k)$\n- Easy to identify the maximum or minimum value\n- The axis of symmetry is $x = h$\n\n**Intercept Form:** $f(x) = a(x-p)(x-q)$\n- $p$ and $q$ are the x-intercepts\n- The axis of symmetry is $x = \\frac{p+q}{2}$",
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
              markdown: "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "f(x) = x^2",
                steps: [
                  { expression: "x = -2", explanation: "Evaluate at x = -2" },
                  { expression: "f(-2) = (-2)^2 = 4", explanation: "Calculate f(-2)" },
                  { expression: "x = -1", explanation: "Evaluate at x = -1" },
                  { expression: "f(-1) = (-1)^2 = 1", explanation: "Calculate f(-1)" },
                  { expression: "x = 0", explanation: "Evaluate at x = 0" },
                  { expression: "f(0) = 0^2 = 0", explanation: "Calculate f(0) — the vertex" },
                  { expression: "x = 1", explanation: "Evaluate at x = 1" },
                  { expression: "f(1) = 1^2 = 1", explanation: "Calculate f(1)" },
                  { expression: "x = 2", explanation: "Evaluate at x = 2" },
                  { expression: "f(2) = 2^2 = 4", explanation: "Calculate f(2)" },
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
              markdown: "## Example 2: Compare $f(x) = x^2$ and $g(x) = 2x^2$\n\nHow does multiplying by 2 affect the graph?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "g(x) = 2x^2",
                steps: [
                  { expression: "f(x) = x^2 (base parabola)", explanation: "Original function" },
                  { expression: "g(x) = 2x^2", explanation: "Vertical stretch by factor of 2" },
                  { expression: "Vertex remains at (0, 0)", explanation: "The vertex doesn't change" },
                  { expression: "Points are twice as far from vertex", explanation: "f(1) = 1, g(1) = 2" },
                  { expression: "Parabola is narrower", explanation: "a > 1 causes vertical stretch" },
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
              markdown: "## Example 3: Real-World Application — Modeling with Quadratics\n\nA baseball is hit with an initial height of 4 feet and an initial velocity of 80 feet per second. The height is modeled by $h(t) = -16t^2 + 80t + 4$.\n\nFind the maximum height and when it occurs.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "h(t) = -16t^2 + 80t + 4",
                steps: [
                  { expression: "h(t) = -16t^2 + 80t + 4", explanation: "Write the function" },
                  { expression: "a = -16, b = 80", explanation: "Identify coefficients" },
                  { expression: "t = -b/(2a) = -80/(2·-16) = 80/32 = 2.5", explanation: "Find the axis of symmetry" },
                  { expression: "h(2.5) = -16(2.5)^2 + 80(2.5) + 4", explanation: "Substitute to find maximum height" },
                  { expression: "h(2.5) = -100 + 200 + 4 = 104", explanation: "Calculate maximum height" },
                  { expression: "Maximum height: 104 feet at t = 2.5 seconds", explanation: "Interpret the result" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Finding Key Features from Different Forms\n\n### From Standard Form $f(x) = ax^2 + bx + c$\n\n- **Y-intercept**: $(0, c)$\n- **Axis of symmetry**: $x = \\frac{-b}{2a}$\n- **Vertex**: $\\left(\\frac{-b}{2a}, f\\left(\\frac{-b}{2a}\\right)\\right)$\n\n### From Vertex Form $f(x) = a(x-h)^2 + k$\n\n- **Vertex**: $(h, k)$\n- **Axis of symmetry**: $x = h$\n- **Opens**: Up if $a > 0$, down if $a < 0$\n\n### From Intercept Form $f(x) = a(x-p)(x-q)$\n\n- **X-intercepts**: $(p, 0)$ and $(q, 0)$\n- **Axis of symmetry**: $x = \\frac{p+q}{2}$",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Find Average Rate of Change from an Equation\n\nFind the average rate of change of $f(x) = x^2 + 3x - 4$ from $x = 1$ to $x = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "f(x) = x^2 + 3x - 4",
                steps: [
                  { expression: "f(1) = 1^2 + 3(1) - 4 = 0", explanation: "Evaluate at x = 1" },
                  { expression: "f(3) = 3^2 + 3(3) - 4 = 14", explanation: "Evaluate at x = 3" },
                  { expression: "Average rate of change = [f(3) - f(1)] / (3 - 1)", explanation: "Use the formula" },
                  { expression: "= (14 - 0) / 2 = 7", explanation: "Calculate the result" },
                  { expression: "The function increases by 7 units per unit increase in x", explanation: "Interpret the result" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Find Average Rate of Change from a Table\n\nGiven the table, find the average rate of change from $x = 2$ to $x = 5$.\n\n| x | f(x) |\n|---|------|\n| 2 | 7    |\n| 3 | 12   |\n| 4 | 19   |\n| 5 | 28   |",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "(table data)",
                steps: [
                  { expression: "f(5) = 28, f(2) = 7", explanation: "Identify values from table" },
                  { expression: "Average rate of change = [28 - 7] / [5 - 2]", explanation: "Apply the formula" },
                  { expression: "= 21 / 3 = 7", explanation: "Calculate" },
                  { expression: "The function increases by 7 units for each unit of x", explanation: "Interpretation" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6: Estimate Rate of Change from a Graph\n\nUsing the graph of $f(x)$, estimate the average rate of change from $x = 1$ to $x = 4$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "rate_of_change",
                equation: "f(x) = (x-2)^2 + 1",
                title: "Estimate Rate of Change from Graph",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How does the value of $a$ in $f(x) = ax^2$ affect the width of the parabola?\n2. Why is the vertex form useful for identifying the maximum or minimum of a quadratic function?\n3. When might you prefer to use the intercept form over the vertex form?\n4. How is the average rate of change of a quadratic function related to its shape?",
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
                    question: "If $a > 1$ in $f(x) = ax^2$, the parabola becomes:",
                    options: ["Wider", "Narrower", "Shifts up", "Shifts down"],
                    correctIndex: 1,
                  },
                  {
                    question: "The vertex of $f(x) = (x-3)^2 + 5$ is:",
                    options: ["(3, 5)", "(-3, 5)", "(3, -5)", "(-3, -5)"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about quadratic functions and their graphs. Consider the following:\n\n- What did you find most challenging about graphing quadratic functions?\n- How do the three forms (standard, vertex, intercept) help you understand different aspects of a quadratic function?\n- What questions do you still have about quadratic functions?\n\n**Tip**: Being aware of what you understand well and what needs more practice helps you study more effectively.",
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
