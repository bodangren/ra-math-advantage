import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_8Result> => {
    const now = Date.now();
    const lessonSlug = "2-8-inverse-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Inverse Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.8: Inverse Functions",
          orderIndex: 8,
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
          title: "Inverse Functions",
          description: "AP Precalculus Topic 2.8: Inverse Functions",
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
          "markdown": "Consider the function represented by this table:\n\n| x | -3 | -2 | 0 | 1 | 4 | 6 |\n|---|---|---|---|---|---|---|\n| f(x) | 6 | 3 | 1 | -1 | -3 | -7 |\n\nIf you switch every $x$ and $y$ value, does the resulting relation still pass the vertical line test? What happens to the domain and range?"
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
          "markdown": "- **Inverse relation**: A relation formed by switching every $x$ and $y$ value in the original. The graph of an inverse is a reflection over the line $y = x$.\n- **Inverse function** ($f^{-1}(x)$): The inverse is itself a function only if the original is strictly increasing or strictly decreasing on its entire domain. Note: $f^{-1}(x)$ does NOT mean $1/f(x)$.\n- **Verification by composition**: Functions $f$ and $g$ are inverses if and only if $f(g(x)) = x$ and $g(f(x)) = x$ for all $x$ in the appropriate domains.\n- **Domain-range swap**: The domain of $f$ equals the range of $f^{-1}$, and the range of $f$ equals the domain of $f^{-1}$."
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
          "markdown": "An inverse undoes a function's operation. Three ways to find and verify inverses:\n\n**Numerical:** Switch each $x$-$y$ pair. If any $x$-value repeats in the inverse, the inverse is a relation, not a function.\n\n**Graphical:** Reflect the graph over the line $y = x$. A function has a function inverse only if it is strictly increasing or strictly decreasing everywhere — a horizontal line test.\n\n**Analytical (3-step procedure):**\n1. Replace $f(x)$ with $y$.\n2. Switch $x$ and $y$.\n3. Solve for $y$ and write as $f^{-1}(x)$.\n\nFor rational functions like $f(x) = (x - 2)/(x + 3)$, the procedure requires multiplying both sides to clear denominators and factoring to isolate $y$.\n\n**Verification**: Show both $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$. Proving only one direction is insufficient."
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
          "markdown": "**Example 1:** Find $f^{-1}(x)$ for $f(x) = 3x - 7$.\n\n**Solution:**\n$$y = 3x - 7$$\n$$\\text{Switch: } x = 3y - 7$$\n$$x + 7 = 3y$$\n$$y = \\frac{x + 7}{3}$$\n$$f^{-1}(x) = \\frac{x + 7}{3}$$\n\n**Verification:**\n$$f(f^{-1}(x)) = 3\\left(\\frac{x+7}{3}\\right) - 7 = x + 7 - 7 = x \\quad \\checkmark$$\n\n**Example 2:** Find the inverse of $f(x) = (x - 2)/(x + 3)$.\n\n**Solution:**\n$$y = \\frac{x - 2}{x + 3}$$\n$$\\text{Switch: } x = \\frac{y - 2}{y + 3}$$\n$$x(y + 3) = y - 2$$\n$$xy + 3x = y - 2$$\n$$xy - y = -2 - 3x$$\n$$y(x - 1) = -2 - 3x$$\n$$y = \\frac{-2 - 3x}{x - 1} = \\frac{3x + 2}{1 - x}$$\n\n**Example 3:** Are $f(x) = 2x - 3$ and $g(x) = \\frac{1}{2}x + \\frac{3}{2}$ inverses?\n\n**Solution:**\n$$f(g(x)) = 2\\left(\\frac{1}{2}x + \\frac{3}{2}\\right) - 3 = x + 3 - 3 = x \\quad \\checkmark$$\n$$g(f(x)) = \\frac{1}{2}(2x - 3) + \\frac{3}{2} = x - \\frac{3}{2} + \\frac{3}{2} = x \\quad \\checkmark$$\n\nYes, they are inverses."
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
          "markdown": "**Problem 1:** Find the inverse of $f(x) = 3x + 5$. Verify your answer by composition.\n\n**Hint:** Follow the 3-step procedure: write as $y$, switch $x$ and $y$, solve for $y$.\n\n**Problem 2:** A table gives $f$: -3 \\to 6, -2 \\to 3, 0 \\to 1, 1 \\to -1, 4 \\to -3, 6 \\to -7. Let $g = f^{-1}$.\n\na) Find $g(-3)$.\n\nb) Find $g(6)$.\n\nc) Find $(f^{-1} \\circ f)(-2)$.\n\n**Hint:** For (a), find which input of $f$ produces output -3. For (c), $f^{-1}(f(x)) = x$ always."
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
          "markdown": "**Problem 1:** Find the inverse of $y = -2x + 7$.\n\n**Problem 2:** Find the inverse of $f(x) = (x - 3)/(x + 2)$.\n\n**Problem 3:** Show that $n(x) = 6/(x - 4)$ and $p(x) = 6/x + 4$ are inverses by verifying both compositions.\n\n**Problem 4:** A graph of $k$ on $[-4, 11]$ has minimum value -2 and maximum value 8. What are the domain and range of $k^{-1}$?"
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
          "markdown": "**Exit Ticket:** Find the inverse of $f(x) = 2x - 3$. Verify it is correct.\n\n**Lesson Summary:** Inverse functions undo each other — $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$. Finding an inverse means switching $x$ and $y$ and solving for $y$. Graphically, inverses are reflections over $y = x$. A function has a function inverse only if it passes the horizontal line test (strictly increasing or strictly decreasing). The domain of $f$ becomes the range of $f^{-1}$ and vice versa. Note: $f^{-1}(x)$ is not a reciprocal — it is a completely different function."
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
