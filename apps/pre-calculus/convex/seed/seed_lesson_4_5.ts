import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_5Result> => {
    const now = Date.now();
    const lessonSlug = "4-5-implicit-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Implicitly Defined Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.5: Implicitly Defined Functions",
          orderIndex: 5,
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
          title: "Implicitly Defined Functions",
          description: "AP Precalculus Topic 4.5: Implicitly Defined Functions",
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
                "The equation $x^2 + y^2 = 1$ relates $x$ and $y$ but does not isolate $y$ as a function of $x$. If we solve for $y$, we get $y = pmsqrt{1 - x^2}$ — two functions, not one. Equations that relate $x$ and $y$ without solving for one variable define **implicit functions**. Many important curves, including circles and ellipses, are naturally defined this way.",
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
                "- **Implicitly defined function**: A relationship $F(x, y) = 0$ that defines $y$ in terms of $x$ without explicitly isolating $y$.\n- **Explicit function**: A function written as $y = f(x)$, where $y$ is isolated on one side.\n- **Implicit differentiation** (conceptual): Finding the slope of a tangent line to an implicit curve at a point by approximating $\\frac{\\Delta y}{\\Delta x}$.",
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
                "An **implicitly defined function** is any equation in $x$ and $y$ where neither variable is necessarily solved for. Examples:\n- $x^2 + y^2 = 25$ (a circle)\n- $x^2 - y^2 = 1$ (a hyperbola)\n- $e^x + y = xy$ (a non-standard curve)\n\n**Key distinction**: An implicit equation may define zero, one, or *multiple* functions. The circle $x^2 + y^2 = 25$ defines $y = \\sqrt{25 - x^2}$ (upper semicircle) and $y = -\\sqrt{25 - x^2}$ (lower semicircle).\n\n**Finding slope at a point**: To estimate the slope of an implicitly defined curve at a point $(a, b)$, use nearby points. If $(x_1, y_1)$ and $(x_2, y_2)$ are two close points on the curve, then $\\frac{y_2 - y_1}{x_2 - x_1}$ approximates the slope.\n\n**Domain and range**: Not all $x$-values produce real $y$-values. For $x^2 + y^2 = 25$, $x$ is restricted to $[-5, 5]$.",
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
                "**Example 1:** The curve $x^2 + y^2 = 9$ passes through $(0, 3)$. Estimate the slope at this point using nearby points.\n\n**Solution:** Choose $x = 1$: $y = pmsqrt{8} \\approx \\pm2.83$. Using the upper branch point $(1, 2.83)$:\n$$\\frac{\\Delta y}{\\Delta x} \\approx \\frac{2.83 - 3}{1 - 0} = -0.17$$\n\nUsing $x = -1$: $y \\approx 2.83$.\n$$\\frac{\\Delta y}{\\Delta x} \\approx \\frac{2.83 - 3}{-1 - 0} = 0.17$$\n\nAveraging: the slope near $(0, 3)$ is approximately 0 — the tangent is horizontal. (This is correct: the top of the circle has a horizontal tangent.)\n\n**Example 2:** Solve $x^2 + 4y^2 = 16$ explicitly for $y$.\n\n**Solution:** $4y^2 = 16 - x^2 \\implies y^2 = \\frac{16 - x^2}{4} \\implies y = pmsqrt{\\frac{16 - x^2}{4}}$.\n\nTwo explicit functions result — an upper and lower half of an ellipse.",
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
                "**Problem 1:** The curve $x^2 + y^2 = 4$ passes through $(2, 0)$. Estimate the slope at this point using $x = 1.5$.\n\n**Hint:** Find the corresponding $y$-value on the upper branch, then compute $\\frac{\\Delta y}{\\Delta x}$.\n\n**Problem 2:** Solve $x^2 + y^2 = 49$ explicitly for $y$. How many functions result?",
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
                "**Problem 1:** The curve $xy = 6$ passes through $(2, 3)$. Find a nearby point at $x = 2.1$ and estimate the slope at $(2, 3)$.\n\n**Problem 2:** The curve $x^2 - y^2 = 4$ passes through $(\\sqrt{5}, 1)$. Estimate the slope at this point using $x = 2.5$.\n\n**Problem 3:** Explain why the curve $x^2 + y^2 = -1$ has no real points. What does this tell you about when implicit equations define curves?",
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
                "**Exit Ticket:** The curve $x^2 + y^2 = 1$ passes through $(\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2})$. Estimate the slope at this point using $x = 0.6$.\n\n**Lesson Summary:** Implicitly defined functions relate $x$ and $y$ without isolating either variable. They may define multiple branches (functions). Slopes can be estimated by choosing nearby points on the curve and computing $\\frac{\\Delta y}{\\Delta x}$.",
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
