import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_10Result> => {
    const now = Date.now();
    const lessonSlug = "1-10-rational-functions-holes";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Holes",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.10: Rational Functions and Holes",
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
          title: "Rational Functions and Holes",
          description: "AP Precalculus Topic 1.10: Rational Functions and Holes",
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
          "markdown": "Consider $f(x) = (x² - 4) / (x - 2)$. Factor the numerator: $(x - 2)(x + 2) / (x - 2)$. After canceling, the simplified form is $x + 2$. But is $f(2)$ defined? Try evaluating on your calculator — you get an error. Yet the simplified form gives $2 + 2 = 4$. This \"missing point\" is called a hole. How is a hole different from the vertical asymptotes we studied in Topic 1.9?"
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
          "markdown": "- **Hole** — A point on the graph where the function is undefined because a factor canceled, but the graph does not diverge to $±∞$. Both one-sided limits exist and are equal.\n- **Simplified form** — The rational function after all common factors between numerator and denominator are canceled.\n- **Cancel** — Removing a common factor from both the numerator and denominator of a rational expression."
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
          "markdown": "**EK 1.10.A.1:** A hole occurs when a factor in the denominator **cancels completely** with a factor in the numerator. The function is undefined at that x-value, but the graph does not diverge to $±∞$.\n\n**EK 1.10.A.2:** At a hole, both one-sided limits exist and are equal. The y-coordinate of the hole is found by evaluating the **simplified** function at the canceled x-value.\n\n**EK 1.10.A.3:** Distinguishing holes from vertical asymptotes requires **fully factoring** both the numerator and denominator and identifying which denominator factors cancel.\n\n### Holes vs. Vertical Asymptotes\n\n| Feature | Hole | Vertical Asymptote |\n|---|---|---|\n| Denominator factor | Cancels with numerator | Does **not** cancel |\n| Limit behavior | Both sides equal (finite) | Sides diverge to $±∞$ |\n| Graph | Missing point | Graph shoots to infinity |\n\nFor $f(x) = (x - 1)(x + 2) / (x - 1)$: cancel $(x - 1)$ → hole at $x = 1$, $y = 3$. Both limits equal 3.\n\nFor $g(x) = (x - 3)(x + 2) / (x - 1)$: no cancellation → VA at $x = 1$. Limits diverge."
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
          "markdown": "**Example 1:** Classify each denominator zero as a hole or VA for $f(x) = (x - 2)(x + 3) / ((x + 3)(x - 5))$.\n\nFactor and cancel $(x + 3)$: simplified form is $(x - 2) / (x - 5)$.\n\n- $x = -3$: factor canceled → **hole**. Evaluate simplified form: $f(-3) = (-5) / (-8) = 5/8$. Hole at $(-3, 5/8)$.\n- $x = 5$: factor remains in denominator → **VA at $x = 5$**.\n\n**Example 2:** Classify denominator zeros for $y = (x + 1)(x - 2)² / ((x - 2)(x + 1)²)$.\n\nCancel one $(x - 2)$ and one $(x + 1)$: simplified form is $(x + 1)(x - 2) / (x + 1)$... wait, let's recount.\n\nAfter canceling: $(x - 2) / (x + 1)$.\n\n- $x = 2$: factor fully canceled → **hole**. Simplified value: $(0) / (3)$ = 0. Hole at $(2, 0)$.\n- $x = -1$: $(x + 1)$ remains in denominator → **VA at $x = -1$**.\n\n**Example 3:** Construct a function with a hole at $x = 3$, VAs at $x = 1$ and $x = -4$.\n\nPlace $(x - 3)$ in both numerator and denominator for the hole. Place $(x - 1)$ and $(x + 4)$ in the denominator only:\n\n$f(x) = (x - 3) / ((x - 3)(x - 1)(x + 4))$"
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
          "markdown": "**Problem 1:** Find all holes and VAs of $g(x) = (x² - 5x + 6) / (x - 2)$.\n*Hint:* Factor the numerator. What cancels? What remains?\n\n**Problem 2:** Write one-sided limit statements at $x = 2$ for $g(x) = (x - 2)(x + 4) / ((x - 2)(x - 3))$.\n*Hint:* Cancel $(x - 2)$ first. Since it canceled completely, both limits should be equal. Evaluate the simplified form at $x = 2$.\n\n**Problem 3:** Sketch a rational function with a hole at $x = 1$ and a VA at $x = 4$ where $\\lim(x→4⁻) f(x) = +∞$ and $\\lim(x→4⁺) f(x) = -∞$."
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
          "markdown": "**Problem 1:** Find all holes and VAs of $f(x) = (x - 1)(x - 5) / ((x - 5)(x + 2))$. Give the coordinates of each hole.\n\n**Problem 2:** Write the equation of a rational function with holes at $x = 2$ and $x = 5$, a VA at $x = 0$, and a zero at $x = 1$.\n\n**Problem 3:** How many VAs and holes does $f(x) = (x² - 6x + 3) / ((x² - 2)(x² - 3x - 5)²)$ have? *Hint:* Factor and look for common factors."
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
          "markdown": "**Exit Ticket:** Classify each: $f(x) = (x - 3)(x + 1) / (x - 3)$ has a ___ at $x = \\underline{\\phantom{000}}$. $g(x) = (x + 2) / (x - 3)$ has a ___ at $x = \\underline{\\phantom{000}}$.\n\n**Lesson Summary:** Holes and vertical asymptotes both arise from denominator zeros, but they behave differently. A hole occurs when a factor cancels — both sides approach the same finite value. A VA occurs when a factor remains — the function diverges to $±∞$. Always factor completely and cancel before classifying."
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
