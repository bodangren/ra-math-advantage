import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_1Result> => {
    const now = Date.now();
    const lessonSlug = "4-1-parametric-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.1: Parametric Functions",
          orderIndex: 1,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Parametric Functions",
          description: "AP Precalculus Topic 4.1: Parametric Functions",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "A drone launches from the ground and flies in a straight path. Its horizontal position is $x(t) = 4t$ and its vertical position is $y(t) = -16t^2 + 32t$, where $t$ is time in seconds. Neither equation alone tells the full story — we need *both* to describe the drone's path. This is the power of parametric functions: each output coordinate is its own function of a shared parameter.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "- **Parametric function**: A pair of equations $x = f(t)$ and $y = g(t)$ that define both coordinates in terms of a third variable $t$, called the **parameter**.\n- **Parameter**: The independent variable $t$ that controls both $x$ and $y$ simultaneously. Often represents time, but can represent any quantity.\n- **Parametric curve**: The set of all points $(x(t), y(t))$ traced as $t$ varies over an interval.\n- **Eliminate the parameter**: Algebraically combine the two equations to produce a single equation in $x$ and $y$, removing $t$ entirely.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "A **parametric function** defines a curve using two equations, one for each coordinate:\n\n$$x = f(t), \\quad y = g(t)$$\n\nwhere $t$ is the **parameter**. As $t$ changes, both $x$ and $y$ change, tracing a path through the plane.\n\n**Reading a parametric function**: To plot the curve, create a table of values for $t$, compute $x(t)$ and $y(t)$ for each value, then plot the resulting $(x, y)$ points in order.\n\n**Eliminating the parameter**: Solve one equation for $t$ and substitute into the other. For example, if $x = t + 1$ and $y = t^2$, then $t = x - 1$, so $y = (x - 1)^2$. This recovers a familiar Cartesian equation but may lose information about the direction or timing of motion.\n\n**Key distinctions from Cartesian functions**:\n- Parametric curves can loop, backtrack, and cross themselves — behaviors impossible for $y = f(x)$ functions.\n- The parameter $t$ adds a sense of *process* — the curve is traced over time, not just statically defined.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Example 1:** Given $x = 2t + 1$ and $y = t^2 - 3$, make a table for $t = -1, 0, 1, 2, 3$ and plot the points.\n\n| $t$ | $x = 2t + 1$ | $y = t^2 - 3$ | Point |\n|-----|--------------|----------------|-------|\n| -1 | -1 | -2 | (-1, -2) |\n| 0 | 1 | -3 | (1, -3) |\n| 1 | 3 | -2 | (3, -2) |\n| 2 | 5 | 1 | (5, 1) |\n| 3 | 7 | 6 | (7, 6) |\n\n**Example 2:** Eliminate the parameter from $x = 2t + 1$ and $y = t^2 - 3$.\n\n**Solution:** Solve $x = 2t + 1$ for $t$: $t = \\frac{x - 1}{2}$. Substitute into $y$:\n\n$$y = \\left(\\frac{x - 1}{2}\\right)^2 - 3 = \\frac{(x - 1)^2}{4} - 3$$\n\nThis is a parabola with vertex $(1, -3)$ opening upward.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Guided Practice",
        phaseType: "guided_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Given $x = 3 - t$ and $y = t^2 + 1$, find $(x, y)$ when $t = -2, 0, 3$.\n\n**Hint:** Substitute each value of $t$ into both equations.\n\n**Problem 2:** Eliminate the parameter from $x = 3 - t$ and $y = t^2 + 1$.\n\n**Hint:** Solve the $x$ equation for $t$, then substitute into the $y$ equation.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Create a table of values and sketch the parametric curve $x = \\cos(t)$, $y = \\sin(t)$ for $t = 0, \\frac{\\pi}{2}, \\pi, \\frac{3\\pi}{2}, 2\\pi$. What shape do the points form?\n\n**Problem 2:** Eliminate the parameter from $x = 5 - 2t$ and $y = 3t + 1$. Write the result as a function of $x$.\n\n**Problem 3:** Is the curve from Problem 1 a function of $x$? Why or why not?",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Exit Ticket:** Eliminate the parameter from $x = t - 4$ and $y = t^2$.\n\n**Lesson Summary:** A parametric function uses a parameter $t$ to define $x$ and $y$ separately. By creating tables or eliminating the parameter, we can understand the curve's shape. Parametric curves can represent paths that Cartesian functions $y = f(x)$ cannot, including loops and self-intersections.",
            },
          },
        ],
      },
    ] as const;

    const activitiesCreated = 0;

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
