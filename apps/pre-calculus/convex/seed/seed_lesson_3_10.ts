import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_10Result> => {
    const now = Date.now();
    const lessonSlug = "3-10-trig-equations-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Trigonometric Equations and Inequalities",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.10: Trigonometric Equations and Inequalities",
          orderIndex: 10,
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
          title: "Trigonometric Equations and Inequalities",
          description: "AP Precalculus Topic 3.10: Trigonometric Equations and Inequalities",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
  {
    "phaseNumber": 1,
    "title": "Explore",
    "phaseType": "explore",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "A radar antenna rotates so that its beam angle $\\theta$ satisfies $2\\cos(\\theta) + 1 = 0$. You need every angle where this holds. Is this the same as asking for $\\cos^{-1}(-1/2)$? No — the inverse cosine returns one value, but the equation may have many solutions. How do you find *all* solutions, and how does the period of the function determine the pattern?"
        }
      }
    ]
  },
  {
    "phaseNumber": 2,
    "title": "Vocabulary",
    "phaseType": "vocabulary",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "- **Trigonometric equation**: An equation containing one or more trigonometric functions of a variable, such as $2\\sin(x) = \\sqrt{3}$.\n- **General solution**: A formula capturing every solution, typically using $+$ $2k\\pi$ (for sin/cos) or $+$ $k\\pi$ (for tan) where $k$ is any integer.\n- **Sign chart**: A number line with solutions marked as boundary points, intervals labeled positive or negative to determine where an inequality holds.\n- **$\\sin^n x$**: Shorthand notation meaning $(\\sin x)^n$ — for example, $\\sin^2 x = (\\sin x)^2$."
        }
      }
    ]
  },
  {
    "phaseNumber": 3,
    "title": "Learn",
    "phaseType": "learn",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "To solve a trigonometric equation, follow these steps:\n\n1. **Isolate** the trigonometric function on one side of the equation.\n2. **Find** the corresponding angle measures on the unit circle.\n3. **Consider** any domain restrictions in the problem.\n4. **Write** the general solutions using the period.\n\nFor sin and cos (period $2\\pi$): solutions repeat every $2\\pi$. For tan (period $\\pi$): solutions repeat every $\\pi$.\n\n**Key distinction**: $\\sin(x) = 1/2$ and $\\sin^{-1}(1/2) = ?$ are **not** equivalent. The inverse trig function returns one value in the restricted range. The equation $\\sin(x) = 1/2$ has infinitely many solutions: $x = \\pi/6 + 2k\\pi$ or $x = 5\\pi/6 + 2k\\pi$.\n\n**No-solution cases**: If isolating the trig function gives a value outside $[-1, 1]$ (for sin or cos), there is no solution. For example, $\\cos(x) = -4/3$ has no solution since $|-4/3| > 1$.\n\nFor **trigonometric inequalities**, use a five-step sign chart method:\n1. Set $f(x) = 0$ and solve for $x$.\n2. Create a sign chart with solutions as boundary points.\n3. Test a value in one interval.\n4. Label remaining intervals positive or negative.\n5. Interpret the sign chart to answer the inequality."
        }
      }
    ]
  },
  {
    "phaseNumber": 4,
    "title": "Worked Example",
    "phaseType": "worked_example",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Example 1:** Find all solutions to $2\\cos(x) = -\\sqrt{2}$ on $[0, 2\\pi)$.\n\n**Solution:**\n- Isolate: $\\cos(x) = -\\sqrt{2}/2$\n- Unit circle: $\\cos(x) = -\\sqrt{2}/2$ at $x = 3\\pi/4$ and $x = 5\\pi/4$\n- On $[0, 2\\pi)$: $x = 3\\pi/4, 5\\pi/4$\n- General solution: $x = 3\\pi/4 + 2k\\pi$ or $x = 5\\pi/4 + 2k\\pi$\n\n**Example 2:** Find all values of $\\theta$ where $\\sin(\\theta) \\geq \\sqrt{2}/2$, $0 \\leq \\theta < 2\\pi$.\n\n**Solution:**\n- $\\sin(\\theta) = \\sqrt{2}/2$ at $\\theta = \\pi/4$ and $\\theta = 3\\pi/4$\n- Sine is above $\\sqrt{2}/2$ between these angles\n- Answer: $\\pi/4 \\leq \\theta \\leq 3\\pi/4$\n\n**Example 3:** Solve $2\\sin^2\\theta + \\sin(\\theta) < 0$ for $0 \\leq \\theta < 2\\pi$.\n\n**Solution:**\n- Factor: $\\sin(\\theta)(2\\sin(\\theta) + 1) < 0$\n- Zeros: $\\sin(\\theta) = 0 \\rightarrow \\theta = 0, \\pi$ and $\\sin(\\theta) = -1/2 \\rightarrow \\theta = 7\\pi/6, 11\\pi/6$\n- Sign chart with four intervals — product is negative where factors have opposite signs\n- Answer: $\\pi < \\theta < 7\\pi/6$ or $11\\pi/6 < \\theta < 2\\pi$"
        }
      }
    ]
  },
  {
    "phaseNumber": 5,
    "title": "Guided Practice",
    "phaseType": "guided_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Find all solutions of $\\sin(x) = -1/2$ on $[0, 2\\pi)$.\n\n**Hint:** Where is sine negative on the unit circle? Check QIII and QIV.\n\n**Problem 2:** Does $3\\cos(x) + 2 = -2$ have a solution? Explain.\n\n**Hint:** Isolate $\\cos(x)$ and check if the result is in $[-1, 1]$.\n\n**Problem 3:** Find all solutions of $\\cos^2\\theta = \\cos(\\theta) + 2$. Rewrite as a quadratic in $\\cos(\\theta)$.\n\n**Hint:** Let $u = \\cos(\\theta)$ and solve $u^2 - u - 2 = 0$. Discard solutions where $u$ falls outside $[-1, 1]$."
        }
      }
    ]
  },
  {
    "phaseNumber": 6,
    "title": "Independent Practice",
    "phaseType": "independent_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Find all solutions on $[0, 2\\pi)$: $2\\sin(x) = \\sqrt{2}$, $\\cos(x) = 1/2$, $\\tan(x) = -1$.\n\n**Problem 2:** Write the general solution for $\\cos(x) = 0$.\n\n**Hint:** Cosine is zero at $x = \\pi/2$ and $x = 3\\pi/2$ on $[0, 2\\pi)$. General solutions repeat every $2\\pi$.\n\n**Problem 3:** Find all $\\theta$ in $[0, 2\\pi)$ where $(2\\cos(\\theta) - 1)(\\sin(\\theta) + 1) < 0$.\n\n**Hint:** Find zeros of each factor, build a sign chart, and determine where the product is negative."
        }
      }
    ]
  },
  {
    "phaseNumber": 7,
    "title": "Reflection",
    "phaseType": "reflection",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Exit Ticket:** Find all solutions of $2\\sin(x) = \\sqrt{3}$ on $[0, 2\\pi)$. How many solutions are there and why?\n\n**Lesson Summary:** Solving trig equations means isolating the function, finding reference angles on the unit circle, and writing general solutions using the period ($2\\pi$ for sin/cos, $\\pi$ for tan). Inequalities add a sign chart step. The critical distinction: an inverse trig value is one answer; an equation like $\\sin(x) = k$ may have infinitely many. Always verify that isolated values are in range before solving."
        }
      }
    ]
  }
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
