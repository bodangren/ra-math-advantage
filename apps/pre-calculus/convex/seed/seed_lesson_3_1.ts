import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_1Result> => {
    const now = Date.now();
    const lessonSlug = "3-1-periodic-phenomena";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Periodic Phenomena",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.1: Periodic Phenomena",
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
          title: "Periodic Phenomena",
          description: "AP Precalculus Topic 3.1: Periodic Phenomena",
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
          "markdown": "A large clock is mounted on a wall. The minute hand is 8 inches long, and the center of the clock is 120 inches above the floor. At time $t = 0$ minutes, the tip of the minute hand points directly upward. Now suppose the clock runs at double speed, so the hand completes one full rotation every 30 minutes.\n\nAs the hand spins, the height $h(t)$ of the tip above the floor goes up and down repeatedly. Sketch what you think the graph of $h(t)$ looks like for two full rotations. Does the graph repeat? How do you know?"
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
          "markdown": "- **Periodic relationship**: A relationship between two variables that occurs when the output values demonstrate a repeating pattern over successive equal-length intervals.\n- **Period**: The length of the input values over which the function completes one full cycle. If $f$ is periodic with period $P$, then $f(x) = f(x + P)$ for all $x$.\n- **Cycle**: One complete repetition of the pattern within a periodic function.\n\nA periodic function starts with a basic pattern and translates that pattern repeatedly over its domain. The defining property is $f(x) = f(x - P)$ for all values of $x$."
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
          "markdown": "A function is **periodic** if its output values repeat at regular intervals. The distance over which one full repetition occurs is the **period** $P$. For any periodic function $f$ with period $P$:\n\n$$f(x) = f(x + P) = f(x - P) = f(x + kP)$$\n\nfor any integer $k$. This means you can evaluate a periodic function at any input by shifting the input by multiples of the period until it falls within a known interval.\n\nTo find the period from a graph, measure the minimum horizontal distance between two points where the graph begins repeating — that is, the least positive value $P$ such that the graph on $[a, a+P]$ matches the graph on $[a+P, a+2P]$.\n\nPeriodic functions model real-world cyclical phenomena: rotating objects, oscillating motion, seasonal temperature variation, tidal patterns, and sound waves."
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
          "markdown": "**Example 1:** The function $g$ is periodic. A portion of its graph is shown on the interval $[0, 6]$. The graph rises from a minimum of $2$ at $x = 0$ to a maximum of $8$ at $x = 3$, then falls back to $2$ at $x = 6$. What is the least possible value of the period?\n\n**Solution:** The graph completes one full cycle from $x = 0$ to $x = 6$. The least possible period is $P = 6$.\n\n**Example 2:** Using $g$ from Example 1 with period 6, find $g(14)$, $g(72)$, and $g(-17)$.\n\n**Solution:**\n- $g(14)$: Shift by multiples of 6. $14 - 12 = 2$, so $g(14) = g(2)$. From the graph, $g(2) = 6$ (midpoint of the rise).\n- $g(72)$: $72 = 12 \\times 6$, so $g(72) = g(0) = 2$.\n- $g(-17)$: $-17 + 18 = 1$, so $g(-17) = g(1)$.\n\n**Example 3:** The function $h$ is periodic with period 5. Values are given: $h(1) = -2$, $h(3) = 0$, $h(4) = 3$, $h(7) = 2$. Find $h(-2)$ and $h(h(9))$.\n\n**Solution:**\n- $h(-2)$: $-2 + 5 = 3$, so $h(-2) = h(3) = 0$.\n- $h(h(9))$: First find $h(9)$. Since $9 - 5 = 4$, $h(9) = h(4) = 3$. Then $h(3) = 0$. So $h(h(9)) = 0$."
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
          "markdown": "**Problem 1:** The function $f$ is periodic with period 4. A portion of the graph is shown on $[0, 4]$. Draw two additional periods — one to the right and one to the left.\n\n**Hint:** Copy the shape of the graph on $[0, 4]$ and paste it on $[4, 8]$ and $[-4, 0]$.\n\n**Problem 2:** Using the periodic function $g$ with period 8, and the table: $g(2) = 5$, $g(5) = -3$, $g(7) = 1$. Find $g(18)$, $g(-6)$, and $g(g(10))$.\n\n**Hint:** Reduce each input by subtracting multiples of 8. For $g(g(10))$, evaluate the inner $g(10)$ first by reducing to $g(2)$.\n\n**Problem 3:** A periodic function $p$ has period 6 and $p(3) = 11$. Find $p(21)$ and $p(-9)$.\n\n**Hint:** Use $p(x) = p(x - kP)$ with $k$ chosen so the result lands on a known input."
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
          "markdown": "**Problem 1:** The graph of periodic function $q$ shows one complete cycle on $[0, 10]$ with a minimum value of $0$ and maximum of $12$. State the period. Find $q(25)$, $q(-5)$, and $q(33)$.\n\n**Problem 2:** The function $w$ is periodic with period 7. A table gives: $w(1) = 4$, $w(3) = -2$, $w(5) = 6$, $w(6) = 1$. Find $w(15)$, $w(-3)$, $w(w(8))$, and $w(7k + 3)$ for any integer $k$.\n\n**Problem 3 (FRQ 3 Model):** A toy car travels on a circular track whose center is 20 inches from a wall. At $t = 0$ seconds, the car is closest to the wall (distance 0 inches). The car completes one lap every 8 seconds. The maximum distance from the wall is 40 inches.\n\nPart (A): Determine coordinates $(t, d(t))$ for five labeled points F, G, J, K, P on one full period of the graph.\nPart (B): On the interval between G and J, is $d$ positive or negative and increasing or decreasing?"
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
          "markdown": "**Exit Ticket:** The function $f$ is periodic with period 6 and $f(2) = 5$. Find $f(14)$ and $f(-4)$.\n\n**Lesson Summary:** Periodic functions repeat their output pattern at regular intervals. The period $P$ is the minimum distance for one full cycle, and the key property $f(x) = f(x + P)$ lets you evaluate at any input by shifting to a known interval. Real-world rotating, oscillating, and seasonal phenomena are all modeled by periodic functions."
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
