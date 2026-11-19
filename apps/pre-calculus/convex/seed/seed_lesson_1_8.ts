import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_8Result> => {
    const now = Date.now();
    const lessonSlug = "1-8-rational-functions-zeros";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Zeros",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.8: Rational Functions and Zeros",
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
          title: "Rational Functions and Zeros",
          description: "AP Precalculus Topic 1.8: Rational Functions and Zeros",
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
                "Consider the rational function $f(x) = (x - 2) / ((x + 6)(x - 3))$. Before doing any algebra, predict: where is this function equal to 0? Where is it undefined? Compare your answers with a partner. Recall from Topic 1.5 how sign charts helped you solve polynomial inequalities. What changes when the expression is a fraction instead of a polynomial?",
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
                "- **Rational function** — A function of the form $f(x) = g(x) / h(x)$ where both $g(x)$ and $h(x)$ are polynomials.\n- **Zeros (of a rational function)** — The x-values where $g(x) = 0$, with $h(x) \\ne 0$, making $f(x) = 0$.\n- **Undefined values** — The x-values where $h(x) = 0$, making division by zero; these are excluded from the domain.\n- **Sign chart** — A number line diagram that tracks the sign of an expression across intervals determined by critical values.\n- **Domain restriction** — Values excluded from the domain because the denominator equals zero.",
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
                "A rational function $f(x) = g(x) / h(x)$ has two important traits when $g(x)$ and $h(x)$ have no factors in common:\n\n1. $f(x)$ has **zeros** when $g(x) = 0$.\n2. $f(x)$ is **undefined** when $h(x) = 0$.\n\n**EK 1.8.A.1:** Zeros come from the numerator; undefined values come from the denominator.\n\n**EK 1.8.A.2:** When solving rational inequalities, both the zeros and the undefined values must be identified and placed on a sign chart.\n\n**EK 1.8.A.3:** Values where the denominator equals zero are excluded from the domain and must **never** be included in the solution set of a rational inequality.\n\n### Passwater's 7-Step Method for Rational Inequalities\n\n1. Get 0 on one side of the inequality.\n2. Write as a single fraction $g(x) / h(x)$.\n3. Set $g(x) = 0$ and $h(x) = 0$ to find critical values (factor!).\n4. Create a sign chart with all critical values.\n5. Mark $h(x) = 0$ values — these are **never** included.\n6. Test a value in each interval to determine the sign.\n7. Interpret the sign chart and write the solution in interval notation.",
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
                "**Example 1:** Solve $(x - 2) / ((x + 6)(x - 3)) ≥ 0$.\n\n**Step 1:** Numerator zero: $x - 2 = 0$, so $x = 2$. Denominator zeros: $x + 6 = 0$ gives $x = -6$; $x - 3 = 0$ gives $x = 3$.\n\n**Step 2:** Build the sign chart with critical values $-6, 2, 3$. Test the intervals:\n\n- $(-∞, -6)$: test $x = -7$ → $(-)(-)(-)$ = negative\n- $(-6, 2)$: test $x = 0$ → $(-)(+)(-)$ = positive\n- $(2, 3)$: test $x = 2.5$ → $(+)(+)(-)$ = negative\n- $(3, ∞)$: test $x = 4$ → $(+)(+)(+)$ = positive\n\n**Step 3:** Include $x = 2$ (numerator zero, satisfies $≥ 0$). Exclude $x = -6$ and $x = 3$ (undefined). Solution: $(-6, 2] \\cup (3, \\infty)$.\n\n**Example 2:** Solve $(x² - 4) / (x² - 10x + 25) < 0$.\n\nFactor: $(x - 2)(x + 2) / (x - 5)² < 0$. Numerator zeros: $x = -2, 2$. Denominator zero: $x = 5$ (excluded).\n\nSign chart values: $-2, 2, 5$. Testing intervals shows the expression is negative on $(-2, 2)$. Solution: $(-2, 2)$.",
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
                "**Problem 1:** Solve $((x - 1)(x + 2)²) / (x - 2) ≥ 0$.\n*Hint:* Identify numerator zeros at $x = 1$ and $x = -2$ (even multiplicity). The denominator zero at $x = 2$ is never included. At $x = -2$, the even multiplicity means the expression equals 0 (included in $≥ 0$).\n\n**Problem 2:** Solve $1 / (x - 1)² ≤ 0$.\n*Hint:* Is $(x - 1)²$ ever negative? What does that tell you about the solution?\n\n**Problem 3:** Find the zeros of $y = (3x² + x - 2) / ((x - 1)(x + 5))$.\n*Hint:* Factor the numerator: $3x² + x - 2 = (3x - 2)(x + 1)$. Set each factor to zero and check that these values don't make the denominator zero.",
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
                "**Problem 1:** Solve $(2x) / (x + 1) < 0$. Identify all zeros and undefined values, build a sign chart, and write the solution in interval notation.\n\n**Problem 2:** Find the zeros of $f(x) = (x² - 9) / (x² - 2x - 15)$. *Hint:* Factor both numerator and denominator. Watch for factors that cancel.\n\n**Problem 3:** Solve $(x + 4) / (x - 2) ≤ 0$. Show your sign chart and explain why each endpoint is included or excluded.",
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
                "**Exit Ticket:** Solve $(x + 4) / (x - 2) ≤ 0$. Show your sign chart with all critical values marked.\n\n**Lesson Summary:** Rational functions have zeros where the numerator equals zero and are undefined where the denominator equals zero. When solving rational inequalities, both sets of values go on the sign chart — but undefined values are always excluded from the solution. Use open circles on the sign chart for undefined values and test each interval carefully.",
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
