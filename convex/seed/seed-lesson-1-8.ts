import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-8";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Solving Linear-Nonlinear Systems",
          slug: lessonSlug,
          description: "Solve systems of linear and quadratic equations.",
          orderIndex: 8,
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
          title: "Solving Linear-Nonlinear Systems",
          description: "Solve systems of linear and quadratic equations.",
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
              markdown: "## Explore: Linear-Quadratic Systems\n\nUse graphing technology to explore how many solutions a linear-quadratic system can have.\n\nConsider these systems:\n1. $y = x^2$ and $y = x + 2$\n2. $y = x^2$ and $y = x$\n3. $y = x^2$ and $y = -x + 1$\n\n**Inquiry Question**: How many solutions can a linear-quadratic system of equations have?\n\nA linear-quadratic system can have **0, 1, or 2 solutions** depending on how many times the line intersects the parabola.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                equations: ["y = x^2", "y = x + 2"],
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
              markdown: "## Key Terms\n\n- **Linear-quadratic system**: A system containing one linear equation and one quadratic equation\n- **Quadratic relation**: A relation that can be written in the form $y = ax^2 + bx + c$\n- **Substitution**: Solve for one variable in terms of the other, then substitute\n- **Elimination**: Add or subtract equations to eliminate a variable\n\n**Remember**: A line can intersect a parabola at 0, 1, or 2 points!",
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
              markdown: "## Solving Linear-Quadratic Systems\n\nLike systems of linear equations, linear-quadratic systems can be solved by **graphical** or **algebraic** methods.\n\n### Method 1: Substitution\n1. Solve the linear equation for one variable\n2. Substitute into the quadratic equation\n3. Solve the resulting quadratic equation\n4. Substitute back to find the other variable\n\n### Method 2: Graphical\n1. Graph both equations\n2. Find the intersection points\n\n### Method 3: Using a System to Solve a Quadratic Equation\n1. Write the equation as a system with $y$ on both sides\n2. Solve by substitution or graphing",
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
              markdown: "## Example 1: Solve by Substitution\n\nSolve the system:\n$$x = 2y^2 + 3y + 1$$\n$$-x + y = -1$$\n\n**Step 1**: Solve the linear equation for $x$:\n$$x = y + 1$$\n\n**Step 2**: Substitute into the quadratic:\n$$y + 1 = 2y^2 + 3y + 1$$\n\n**Step 3**: Simplify:\n$$0 = 2y^2 + 2y$$ $$0 = 2y(y + 1)$$\n\n**Step 4**: Solve: $y = 0$ or $y = -1$\n\n**Step 5**: Back-substitute:\n- If $y = 0$: $x = 1$\n- If $y = -1$: $x = 0$\n\n**Solutions**: $(1, 0)$ and $(0, -1)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system",
                equations: ["x = 2y^2 + 3y + 1", "-x + y = -1"],
                steps: [
                  { expression: "x = y + 1", explanation: "Solve linear for x" },
                  { expression: "y + 1 = 2y^2 + 3y + 1", explanation: "Substitute" },
                  { expression: "0 = 2y(y + 1)", explanation: "Simplify" },
                  { expression: "y = 0 or y = -1", explanation: "Solve for y" },
                  { expression: "(1, 0) and (0, -1)", explanation: "Solutions" },
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
              markdown: "## Example 2: Solve by Elimination\n\nSolve the system:\n$$x^2 = y + 5$$\n$$-x + y = 7$$\n\n**Step 1**: Rearrange the linear equation:\n$$y = x + 7$$\n\n**Step 2**: Substitute into the quadratic:\n$$x^2 = (x + 7) + 5$$\n\n**Step 3**: Simplify and solve:\n$$x^2 = x + 12$$ $$x^2 - x - 12 = 0$$ $$(x - 4)(x + 3) = 0$$\n\n**Step 4**: $x = 4$ or $x = -3$\n\n**Step 5**: Back-substitute:\n- If $x = 4$: $y = 11$\n- If $x = -3$: $y = 4$\n\n**Solutions**: $(4, 11)$ and $(-3, 4)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system",
                equations: ["x^2 = y + 5", "-x + y = 7"],
                steps: [
                  { expression: "y = x + 7", explanation: "Solve linear for y" },
                  { expression: "x^2 = x + 12", explanation: "Substitute" },
                  { expression: "(x-4)(x+3) = 0", explanation: "Factor" },
                  { expression: "x = 4 or x = -3", explanation: "Solve for x" },
                  { expression: "(4, 11) and (-3, 4)", explanation: "Solutions" },
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
              markdown: "## Example 3: Use a System to Solve an Equation\n\nSolve $x^2 - 2x + 6 = 4x + 1$\n\n**Step 1**: Create a system:\n$$y = x^2 - 2x + 6$$ $$y = 4x + 1$$\n\n**Step 2**: Find intersections by substituting:\n$$x^2 - 2x + 6 = 4x + 1$$ $$x^2 - 6x + 5 = 0$$ $$(x - 1)(x - 5) = 0$$\n\n**Step 3**: $x = 1$ or $x = 5$\n\n**Step 4**: Find $y$ values:\n- If $x = 1$: $y = 5$\n- If $x = 5$: $y = 21$\n\n**Solutions**: $x = 1$ or $x = 5$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system",
                equations: ["y = x^2 - 2x + 6", "y = 4x + 1"],
                steps: [
                  { expression: "x^2 - 2x + 6 = 4x + 1", explanation: "Set equal" },
                  { expression: "x^2 - 6x + 5 = 0", explanation: "Simplify" },
                  { expression: "(x-1)(x-5) = 0", explanation: "Factor" },
                  { expression: "x = 1 or x = 5", explanation: "Solutions" },
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
              markdown: "## Example 4: Real-World — Revenue Model\n\nA company's revenue is modeled by:\n$$R = -0.1x^2 + 4x$$\n\nTo determine the price for which the company earns $4.2 million, solve the system:\n$$R = -0.1x^2 + 4x$$ $$R = 42$$ (in millions)\n\n**Step 1**: Set equal:\n$$-0.1x^2 + 4x = 42$$\n\n**Step 2**: Rearrange:\n$$-0.1x^2 + 4x - 42 = 0$$\n\n**Step 3**: Multiply by -10:\n$$x^2 - 40x + 420 = 0$$\n\n**Step 4**: Calculate discriminant:\n$$D = (-40)^2 - 4(1)(420) = 1600 - 1680 = -80$$\n\n**Since $D < 0$**, there are **no real solutions**.\n\nThe graphs do not intersect, so the company cannot earn exactly $4.2 million at any price point.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system",
                equations: ["R = -0.1x^2 + 4x", "R = 42"],
                steps: [
                  { expression: "-0.1x^2 + 4x = 42", explanation: "Set equal" },
                  { expression: "x^2 - 40x + 420 = 0", explanation: "Multiply by -10" },
                  { expression: "D = -80 < 0", explanation: "Discriminant" },
                  { expression: "No real solutions", explanation: "0 intersections" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Quadratic-Quadratic Systems\n\nA quadratic-quadratic system contains two quadratic equations. To solve algebraically, set the two expressions equal to each other, move all terms to one side, and solve the resulting quadratic equation.\n\nThe solutions are the points where the parabolas intersect. A system may have two, one, or no real solutions.",
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
              markdown: "## Example 5: Solve a Quadratic-Quadratic System\n\nSolve the system:\n$$y = x^2 + 2x$$\n$$y = -x^2 + 4x + 6$$\n\n**Step 1**: Set the equations equal.\n$$x^2 + 2x = -x^2 + 4x + 6$$\n\n**Step 2**: Move all terms to one side.\n$$2x^2 - 2x - 6 = 0$$\n$$x^2 - x - 3 = 0$$\n\n**Step 3**: Solve using the quadratic formula.\n$$x = \\frac{1 \\pm \\sqrt{13}}{2}$$\n\nSubstitute each $x$-value into either equation to find the corresponding $y$-values.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system",
                equations: ["y = x^2 + 2x", "y = -x^2 + 4x + 6"],
                steps: [
                  { expression: "x^2 + 2x = -x^2 + 4x + 6", explanation: "Set equations equal" },
                  { expression: "x^2 - x - 3 = 0", explanation: "Move terms and simplify" },
                  { expression: "x = (1 ± √13)/2", explanation: "Solve the quadratic" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6: One Intersection\n\nSolve the system:\n$$y = x^2 - 4x + 7$$\n$$y = x^2 - 2x + 3$$\n\n**Step 1**: Set the expressions equal.\n$$x^2 - 4x + 7 = x^2 - 2x + 3$$\n\n**Step 2**: Subtract $x^2$ from both sides and solve.\n$$-4x + 7 = -2x + 3$$\n$$4 = 2x$$\n$$x = 2$$\n\n**Step 3**: Substitute $x = 2$.\n$$y = 2^2 - 4(2) + 7 = 3$$\n\nThe parabolas intersect at $(2, 3)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                functions: ["x^2 - 4x + 7", "x^2 - 2x + 3"],
                features: ["intersection"],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 7: No Real Intersections\n\nSolve the system:\n$$y = x^2 + 1$$\n$$y = x^2 - 5$$\n\n**Step 1**: Set the expressions equal.\n$$x^2 + 1 = x^2 - 5$$\n\n**Step 2**: Subtract $x^2$ from both sides.\n$$1 = -5$$\n\nThis statement is never true, so the system has **no solution**. The parabolas have the same shape but different vertical positions.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                functions: ["x^2 + 1", "x^2 - 5"],
                features: ["no intersection", "vertical shift"],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Can a linear-quadratic system have infinitely many solutions? Why or why not?\n2. Why is graphing still useful even when solving a system algebraically?\n3. How does the discriminant help predict the number of solutions?\n4. When might you prefer the graphical method over algebraic methods?",
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
                    question: "What is the maximum number of solutions for a linear-quadratic system?",
                    options: ["1", "2", "3", "Infinitely many"],
                    correctIndex: 1,
                  },
                  {
                    question: "When a line is tangent to a parabola, how many solutions are there?",
                    options: ["0", "1", "2", "Cannot determine"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned to solve linear-quadratic systems.\n\n- How is solving linear-quadratic systems similar to and different from solving linear systems?\n- When might a linear-quadratic system have no solution?\n- How does the discriminant help predict solution types?\n\n**Congratulations!** You've completed Module 1 on Quadratic Functions and Equations!",
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
