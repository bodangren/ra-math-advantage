import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-7";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Quadratic Inequalities",
          slug: lessonSlug,
          description: "Solve quadratic inequalities using graphs and sign charts.",
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
          title: "Quadratic Inequalities",
          description: "Solve quadratic inequalities using graphs and sign charts.",
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
              markdown: "## Explore: Where Is the Parabola Above or Below the x-axis?\n\nUse graphing technology to explore how the sign of a quadratic expression changes.\n\nConsider: $y = x^2 - 5x + 6$\n\n**Inquiry Question**: How can you determine where a parabola is above or below the x-axis without graphing?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                equation: "y = x^2 - 5x + 6",
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
              markdown: "## Key Terms\n\n- **Quadratic inequality**: An inequality involving a quadratic expression (e.g., $x^2 - 5x + 6 > 0$)\n- **Sign chart**: A number line showing where an expression is positive or negative\n- **Boundary values**: The x-values where the expression equals zero\n- **Test point**: A value chosen in each interval to determine the sign of the expression\n\n**Remember**: Boundary values come from solving the related equation (= 0)!",
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
              markdown: "## Solving Quadratic Inequalities\n\n### Key Concept: Sign Chart Method\n\nTo solve inequalities like $x^2 - 5x + 6 > 0$:\n\n**Step 1**: Find the boundary values by setting the quadratic expression equal to zero.\n\n**Step 2**: Plot the boundary values on a number line. These divide the number line into intervals.\n\n**Step 3**: Choose a test point in each interval and determine the sign of the expression.\n\n**Step 4**: Determine which intervals satisfy the inequality.\n\n### Important Notes\n\n- If the inequality is $>$ or $<$, boundary values are **NOT** included\n- If the inequality is $\\geq$ or $\\leq$, boundary values **ARE** included",
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
              markdown: "## Example 1: Solve $x^2 - 5x + 6 > 0$ Graphically\n\n**Step 1**: Find zeros\n$$x^2 - 5x + 6 = 0$$ $$(x - 2)(x - 3) = 0$$ $$x = 2 \\text{ or } x = 3$$\n\n**Step 2**: Sketch the parabola\nSince $a = 1 > 0$, the parabola opens upward. The x-intercepts are at $x = 2$ and $x = 3$.\n\n**Step 3**: Identify regions\n- The parabola is **above** the x-axis when $x < 2$ or $x > 3$\n- The parabola is **below** the x-axis when $2 < x < 3$\n\n**Solution**: $x < 2$ or $x > 3$\n\nIn interval notation: $(-\\infty, 2) \\cup (3, \\infty)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "x^2 - 5x + 6 > 0",
                steps: [
                  { expression: "x^2 - 5x + 6 = 0", explanation: "Find boundary values" },
                  { expression: "(x-2)(x-3) = 0", explanation: "Factor" },
                  { expression: "x = 2 or x = 3", explanation: "Zeros" },
                  { expression: "x < 2 or x > 3", explanation: "Solution (>0 means above axis)" },
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
              markdown: "## Example 2: Solve $x^2 - 5x + 6 > 0$ Using a Sign Chart\n\n**Step 1**: Find boundary values: $x = 2$ and $x = 3$\n\n**Step 2**: Draw sign chart\nThree intervals: $x < 2$, $2 < x < 3$, $x > 3$\n\n**Step 3**: Test each interval\n- $x < 2$: Test $x = 0$: $0^2 - 5(0) + 6 = 6 > 0$ ✓\n- $2 < x < 3$: Test $x = 2.5$: $2.5^2 - 5(2.5) + 6 = -0.25 < 0$ ✗\n- $x > 3$: Test $x = 4$: $4^2 - 5(4) + 6 = 2 > 0$ ✓\n\n**Step 4**: Solution (positive intervals)\n$$x < 2 \\text{ or } x > 3$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "x^2 - 5x + 6 > 0",
                steps: [
                  { expression: "x = 2, 3", explanation: "Boundary values" },
                  { expression: "Test x=0: positive", explanation: "Interval x < 2" },
                  { expression: "Test x=2.5: negative", explanation: "Interval 2 < x < 3" },
                  { expression: "Test x=4: positive", explanation: "Interval x > 3" },
                  { expression: "x < 2 or x > 3", explanation: "Solution" },
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
              markdown: "## Example 3: Solve $2x^2 + x - 3 \\leq 0$\n\n**Step 1**: Find boundary values\n$$2x^2 + x - 3 = 0$$ $$(2x + 3)(x - 1) = 0$$ $$x = -\\frac{3}{2} \\text{ or } x = 1$$\n\n**Step 2**: Three intervals: $x < -1.5$, $-1.5 < x < 1$, $x > 1$\n\n**Step 3**: Test each interval\n- $x < -1.5$: Test $x = -2$: $2(4) + (-2) - 3 = 3 > 0$ ✗\n- $-1.5 < x < 1$: Test $x = 0$: $0 + 0 - 3 = -3 < 0$ ✓\n- $x > 1$: Test $x = 2$: $8 + 2 - 3 = 7 > 0$ ✗\n\n**Step 4**: Since $\\leq 0$, include the negative interval AND boundaries:\n$$-\\frac{3}{2} \\leq x \\leq 1$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "2x^2 + x - 3 <= 0",
                steps: [
                  { expression: "(2x+3)(x-1) = 0", explanation: "Factor" },
                  { expression: "x = -3/2 or x = 1", explanation: "Boundary values" },
                  { expression: "Test intervals", explanation: "Determine signs" },
                  { expression: "-3/2 <= x <= 1", explanation: "Solution (include boundaries)" },
                ],
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
              markdown: "## Example 4: Real-World — Height Above a Threshold\n\nA football is kicked into the air. Its height $h$ (in feet) after $t$ seconds is:\n\n$$h(t) = -16t^2 + 64t$$\n\nThe height of the goal post crossbar is 10 feet. During which time intervals is the ball **above** the crossbar?\n\n**Step 1**: Set up the inequality\n$$-16t^2 + 64t > 10$$\n\n**Step 2**: Solve the related equation\n$$-16t^2 + 64t - 10 = 0$$\n\nUsing the quadratic formula:\n$$t \\approx 0.17 \\text{ or } t \\approx 3.83$$\n\n**Step 3**: Since the parabola opens downward ($a = -16 < 0$), the ball is above 10 feet between the two roots.\n\n**Solution**: $0.17 < t < 3.83$ seconds",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "-16t^2 + 64t > 10",
                steps: [
                  { expression: "-16t^2 + 64t - 10 = 0", explanation: "Related equation" },
                  { expression: "t ≈ 0.17 or t ≈ 3.83", explanation: "Solve for t" },
                  { expression: "0.17 < t < 3.83", explanation: "Between roots (a < 0)" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why does the sign of the leading coefficient affect which intervals satisfy the inequality?\n2. When solving $x^2 + x - 6 > 0$, why can't we simply square both sides?\n3. How does the sign chart method generalize to higher-degree polynomials?\n4. What's the difference between open and closed circles on a sign chart?",
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
                    question: "If the inequality is x^2 - 4 > 0, are the boundary values included?",
                    options: ["Yes", "No", "Depends on the sign of a", "Cannot determine"],
                    correctIndex: 1,
                  },
                  {
                    question: "What divides the number line into intervals for a quadratic inequality?",
                    options: ["The y-intercept", "The boundary values", "The vertex", "The axis of symmetry"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned to solve quadratic inequalities using graphs and sign charts.\n\n- How does the sign chart method help you visualize solutions?\n- What's the key difference between $>$ and $\\geq$ inequalities?\n- How do real-world contexts change how you interpret inequality solutions?\n\n**Preview**: Next, you'll learn about linear-quadratic systems — how a line and parabola can intersect!",
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
