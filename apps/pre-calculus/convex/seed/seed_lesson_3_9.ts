import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_9Result> => {
    const now = Date.now();
    const lessonSlug = "3-9-inverse-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Inverse Trigonometric Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.9: Inverse Trigonometric Functions",
          orderIndex: 9,
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
          title: "Inverse Trigonometric Functions",
          description: "AP Precalculus Topic 3.9: Inverse Trigonometric Functions",
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
          "markdown": "Consider the equation $\\sin(\\theta) = 1/2$. On the interval $[0, 2\\pi)$, there are two solutions: $\\theta = \\pi/6$ and $\\theta = 5\\pi/6$. But a function can only return one output for each input. So if we want to *undo* the sine function — to go from $1/2$ back to an angle — we must choose which answer to return. How do mathematicians resolve this ambiguity, and what happens when we restrict the domain?"
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
          "markdown": "- **Inverse sine** $\\sin^{-1}(x)$ or $\\arcsin(x)$: The inverse of the sine function, restricted to domain $[-1, 1]$ and range $[-\\pi/2, \\pi/2]$. The output is always an angle in the fourth or first quadrant.\n- **Inverse cosine** $\\cos^{-1}(x)$ or $\\arccos(x)$: The inverse of the cosine function, restricted to domain $[-1, 1]$ and range $[0, \\pi]$. The output is always an angle in the first or second quadrant.\n- **Inverse tangent** $\\tan^{-1}(x)$ or $\\arctan(x)$: The inverse of the tangent function, with domain all reals and range $(-\\pi/2, \\pi/2)$. The output is always an angle in the fourth or first quadrant.\n- **Domain restriction**: Because trig functions are periodic (not one-to-one), we limit the input domain to a specific interval where the function is one-to-one, allowing us to define a true inverse."
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
          "markdown": "The inverse of a trigonometric function switches the input and output values. As a result, the output value of an inverse trigonometric function is always an **angle measure**.\n\nBecause trig functions are periodic, their domains must be restricted to create corresponding inverse functions:\n\n$$\\sin^{-1}(x): \\text{ domain } [-1, 1], \\text{ range } [-\\pi/2, \\pi/2]$$\n$$\\cos^{-1}(x): \\text{ domain } [-1, 1], \\text{ range } [0, \\pi]$$\n$$\\tan^{-1}(x): \\text{ domain } (-\\infty, \\infty), \\text{ range } (-\\pi/2, \\pi/2)$$\n\nWith either notation $\\sin^{-1}(x)$ or $\\arcsin(x)$, we say \"arcsine of x\" aloud.\n\n**Critical distinction**: While $\\sin(x) = 1/2$ has infinitely many solutions, $\\sin^{-1}(1/2)$ returns exactly **one** value: $\\pi/6$. The inverse function must be single-valued — that is why the domain restriction is non-negotiable.\n\n**Common error**: A student evaluates $\\sin^{-1}(-\\sqrt{3}/2)$ and answers $4\\pi/3$. But $4\\pi/3$ is outside the range $[-\\pi/2, \\pi/2]$. The correct answer is $-\\pi/3$ — always check that your output falls in the restricted range."
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
          "markdown": "**Example 1:** Evaluate $\\cos^{-1}(-\\sqrt{2}/2)$.\n\n**Solution:**\n- We need the angle $\\theta$ in $[0, \\pi]$ where $\\cos(\\theta) = -\\sqrt{2}/2$.\n- On the unit circle, $\\cos(\\theta) = -\\sqrt{2}/2$ at $\\theta = 3\\pi/4$ and $\\theta = 5\\pi/4$.\n- Only $3\\pi/4$ is in $[0, \\pi]$.\n- Answer: $\\cos^{-1}(-\\sqrt{2}/2) = 3\\pi/4$.\n\n**Example 2:** Evaluate $\\sin^{-1}(-\\sqrt{3}/2)$.\n\n**Solution:**\n- We need $\\theta$ in $[-\\pi/2, \\pi/2]$ where $\\sin(\\theta) = -\\sqrt{3}/2$.\n- On the unit circle, $\\sin(\\theta) = -\\sqrt{3}/2$ at $\\theta = -\\pi/3$ and $\\theta = 4\\pi/3$.\n- Only $-\\pi/3$ is in $[-\\pi/2, \\pi/2]$.\n- Answer: $\\sin^{-1}(-\\sqrt{3}/2) = -\\pi/3$.\n\n**Example 3:** Evaluate $\\tan^{-1}(\\sqrt{3})$.\n\n**Solution:**\n- We need $\\theta$ in $(-\\pi/2, \\pi/2)$ where $\\tan(\\theta) = \\sqrt{3}$.\n- $\\tan(\\pi/3) = \\sqrt{3}$ and $\\pi/3$ is in $(-\\pi/2, \\pi/2)$.\n- Answer: $\\tan^{-1}(\\sqrt{3}) = \\pi/3$."
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
          "markdown": "**Problem 1:** Write $\\sin^{-1}(1/2) = \\pi/6$ using arcsine notation.\n\n**Hint:** Replace $\\sin^{-1}$ with $\\arcsin$. The statement reads the same aloud.\n\n**Problem 2:** Evaluate $\\cos^{-1}(1/2)$.\n\n**Hint:** Find the angle in $[0, \\pi]$ whose cosine is $1/2$. Check both candidate angles from the unit circle.\n\n**Problem 3:** Why is $\\sin^{-1}(2)$ undefined?\n\n**Hint:** What is the domain of $\\sin^{-1}(x)$? Is $2$ in that interval?"
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
          "markdown": "**Problem 1:** Evaluate each expression:\n- $\\cos^{-1}(1/2)$\n- $\\sin^{-1}(-\\sqrt{2}/2)$\n- $\\tan^{-1}(1)$\n- $\\cos^{-1}(-\\sqrt{3}/2)$\n- $\\sin^{-1}(-1/2)$\n- $\\tan^{-1}(-1/\\sqrt{3})$\n\n**Problem 2:** Evaluate $\\sin^{-1}(1/2) - \\cos^{-1}(-1/2)$.\n\n**Hint:** Find each inverse value separately, then subtract. Check that both outputs are in their respective ranges.\n\n**Problem 3:** Angle $\\theta$ is in standard position with terminal ray hitting the unit circle at $P(x, y)$. Point $Q$ is the reflection of $P$ across the $x$-axis. Which point corresponds to the output of $\\cos^{-1}(-x)$?"
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
          "markdown": "**Exit Ticket:** Evaluate $\\cos^{-1}(-\\sqrt{2}/2)$ and $\\sin^{-1}(\\sqrt{3}/2)$. Explain why $\\sin^{-1}(2)$ is undefined.\n\n**Lesson Summary:** Inverse trig functions return angle measures, not ratios. The domain restrictions — $[-\\pi/2, \\pi/2]$ for arcsin, $[0, \\pi]$ for arccos, $(-\\pi/2, \\pi/2)$ for arctan — ensure each inverse is single-valued. Always verify that your answer falls in the correct range. The inverse function returns one specific angle; the original equation $\\sin(x) = k$ may have infinitely many solutions."
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
