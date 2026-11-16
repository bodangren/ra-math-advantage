import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_9Result> => {
    const now = Date.now();
    const lessonSlug = "1-9-rational-functions-vertical-asymptotes";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Vertical Asymptotes",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.9: Rational Functions and Vertical Asymptotes",
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
          title: "Rational Functions and Vertical Asymptotes",
          description: "AP Precalculus Topic 1.9: Rational Functions and Vertical Asymptotes",
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
          "markdown": "Graph $f(x) = 1/x$ on your calculator. What happens to the graph as $x$ approaches 0 from the left? From the right? The graph shoots toward infinity — this behavior is called a vertical asymptote. Now consider $g(x) = (x² - 4) / (x - 2)$. What happens at $x = 2$? Is it the same as $f(x)$ at $x = 0$? How can we tell the difference between a vertical asymptote and a hole?"
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
          "markdown": "- **Vertical asymptote (VA)** — A vertical line $x = c$ where the function approaches $±∞$ as $x$ approaches $c$.\n- **One-sided limit** — The value a function approaches as $x$ approaches $c$ from the left ($\\lim(x→c⁻)$) or from the right ($\\lim(x→c⁺)$).\n- **Without bound** — Describes function values increasing or decreasing infinitely ($+∞$ or $-∞$).\n- **Hole** — A point where the function is undefined but does not diverge to $±∞$ (covered in Topic 1.10)."
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
          "markdown": "**EK 1.9.A.1:** A vertical asymptote occurs at $x = c$ when a factor in the denominator of a rational function **cannot cancel** with factors in the numerator. The function is undefined at $x = c$ and the graph approaches $±∞$ as $x$ approaches $c$.\n\n**EK 1.9.A.2:** The behavior near a vertical asymptote is described using one-sided limits. As $x$ approaches $c$ from the left or right, $f(x)$ increases or decreases without bound.\n\n**EK 1.9.A.3:** The sign on each side of a VA depends on the signs of the remaining factors evaluated near $c$.\n\n### How to Identify Vertical Asymptotes\n\n1. Factor both the numerator and denominator completely.\n2. Cancel any common factors.\n3. The remaining denominator zeros are vertical asymptotes.\n4. Write one-sided limit statements for each VA by testing values on either side.\n\nFor example, $f(x) = (x - 3)(x + 2) / (x - 1)$ has a VA at $x = 1$ because $(x - 1)$ does not cancel. Testing: $\\lim(x→1⁻) f(x) = -∞$ and $\\lim(x→1⁺) f(x) = +∞$."
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
          "markdown": "**Example 1:** Find all VAs of $f(x) = (x - 2)(x + 3) / ((x + 3)(x - 5))$.\n\nFactor and cancel $(x + 3)$: simplified form is $(x - 2) / (x - 5)$.\n\nThe remaining denominator zero is $x = 5$, so there is a VA at $x = 5$. The canceled factor $(x + 3)$ produces a hole at $x = -3$ (not a VA).\n\n**Example 2:** Write one-sided limit statements for $f(x) = (x - 1)(x + 3) / (x - 2)$.\n\nVA at $x = 2$. Test values near 2:\n\n- At $x = 1.9$: numerator = $(0.9)(4.9)$ > 0, denominator = $-0.1$ < 0 → $f(1.9) < 0$.\n- At $x = 2.1$: numerator = $(1.1)(5.1)$ > 0, denominator = $0.1$ > 0 → $f(2.1) > 0$.\n\nTherefore: $\\lim(x→2⁻) f(x) = -∞$ and $\\lim(x→2⁺) f(x) = +∞$.\n\n**Example 3:** Find VAs of $g(x) = (x - 1)(x + 2) / (x - 1)²$.\n\nCancel one $(x - 1)$: simplified form is $(x + 2) / (x - 1)$. One $(x - 1)$ remains in the denominator, so VA at $x = 1$."
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
          "markdown": "**Problem 1:** Find all vertical asymptotes of $p(x) = (x² - 1) / (x + 1)²$.\n*Hint:* Factor the numerator as $(x - 1)(x + 1)$. Cancel one $(x + 1)$ and check what remains in the denominator.\n\n**Problem 2:** Write one-sided limit statements for $g(x) = (x - 2)(x + 4) / ((x - 2)(x - 3))$.\n*Hint:* First cancel $(x - 2)$ to find the VA. Then test values on either side.\n\n**Problem 3:** Find VAs of $h(x) = 1 / (x³ + 4x)$.\n*Hint:* Factor the denominator: $x(x² + 4)$. Which factor produces a real zero?"
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
          "markdown": "**Problem 1:** Find all VAs of $f(x) = (x - 1)(x - 5) / ((x - 5)(x + 2))$. State one-sided limit statements at each VA.\n\n**Problem 2:** Find all VAs of $f(x) = (2x + 6) / (x - 3)$ and write $\\lim(x→3⁻) f(x)$ and $\\lim(x→3⁺) f(x)$.\n\n**Problem 3:** Write the equation of a rational function that has a VA at $x = 1$ with $\\lim(x→1⁻) f(x) = -∞$ and $\\lim(x→1⁺) f(x) = +∞$, and a hole at $x = 3$."
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
          "markdown": "**Exit Ticket:** Find all vertical asymptotes of $g(x) = (x² - 9) / (x² - x - 6)$. Write one-sided limit statements at each VA.\n\n**Lesson Summary:** Vertical asymptotes occur where denominator factors do not cancel with the numerator. To find VAs, factor completely, cancel common factors, then identify remaining denominator zeros. Use test values on either side of each VA to determine whether the function approaches $+∞$ or $-∞$ from each direction."
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
