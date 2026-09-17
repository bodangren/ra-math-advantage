import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_11Result> => {
    const now = Date.now();
    const lessonSlug = "2-11-logarithmic-properties";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.11: Logarithmic Functions",
          orderIndex: 11,
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
          title: "Logarithmic Functions",
          description: "AP Precalculus Topic 2.11: Logarithmic Functions",
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
          "markdown": "The function $f(x) = \\log(x)$ can only accept positive inputs. Try evaluating:\n- $\\log(100) = 2$ — works fine\n- $\\log(1) = 0$ — works fine\n- $\\log(0)$ — undefined! There is no power of 10 that gives 0.\n- $\\log(-5)$ — undefined! There is no power of 10 that gives a negative number.\n\nThis restriction on the domain mirrors the range of its inverse, $g(x) = 10^x$. Since $10^x$ is always positive (range is $(0, \\infty)$), the inverse $\\log(x)$ can only accept positive inputs (domain is $(0, \\infty)$).\n\nWhat about the end behavior? As $x \\to 0^+$ (approaches 0 from the right), $\\log(x)$ plunges to $-\\infty$. As $x \\to \\infty$, $\\log(x)$ climbs to $\\infty$. Write these as limit statements."
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
          "markdown": "- **Domain of a logarithmic function**: $(0, \\infty)$ — the argument of the log must be positive.\n- **Range of a logarithmic function**: All real numbers, $(-\\infty, \\infty)$.\n- **Vertical asymptote**: The line $x = 0$ for the parent function $f(x) = \\log_b(x)$. The graph approaches but never touches this line.\n- **End behavior (limit notation)**: $\\lim_{x \\to 0^+} f(x) = -\\infty$ and $\\lim_{x \\to \\infty} f(x = \\infty$ for $f(x) = \\log(x)$.\n- **Monotonicity**: Logarithmic functions are always increasing (base > 1) or always decreasing (0 < base < 1) — they never switch direction.\n- **Concavity**: Logarithmic functions are always concave down (base > 1, positive coefficient) or always concave up — no inflection points."
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
          "markdown": "Use a logarithm base $b>0$ with $b\\ne1$. Each real logarithm requires a positive argument. In expansions below, assume every variable inside a separate logarithm is positive. Without that assumption, $\\log_b(x^2)=2\\log_b|x|$ for $x\\ne0$. Keep the original domain after simplification.\n\nThe general form of a logarithmic function is $f(x) = a \\log_b(x)$, where $b > 0$, $b \\ne 1$, and $a \\ne 0$. Key characteristics:\n\n**Domain and range:**\n- Domain: solve the inequality inside the log > 0. For $f(x) = \\log(x)$, domain is $(0, \\infty)$.\n- Range: always $(-\\infty, \\infty)$ for the parent function and most transformations. Vertical shifts do not change the range since $\\infty + k = \\infty$.\n\n**End behavior using limit notation:**\n- Left end behavior: $\\lim_{x \\to 0^+} a \\log_b(x) = \\pm \\infty$ (sign depends on $a$).\n- Right end behavior: $\\lim_{x \\to \\infty} a \\log_b(x) = \\pm \\infty$.\n\n**Critical misconception:** The left end behavior is at $x \\to 0^+$, NOT $x \\to -\\infty$. The domain does not extend to negative $x$.\n\n**Monotonicity and concavity:**\n- $f(x) = \\log_b(x)$ with $b > 1$: increasing, concave down.\n- $f(x) = -\\log_b(x)$ with $b > 1$: decreasing, concave up.\n- The coefficient $a$ and the argument's behavior both affect monotonicity.\n\n**Transformed domain/range:** For $g(x) = 5 \\log(3x - 1) - 2$, set $3x - 1 > 0$, so $x > 1/3$. Domain: $(1/3, \\infty)$. Range: $(-\\infty, \\infty)$."
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
          "markdown": "**Example 1:** Write limit statements.\n- a) $f(x) = \\log(x)$: $\\lim_{x \\to 0^+} f(x) = -\\infty$, $\\lim_{x \\to \\infty} f(x) = \\infty$\n- b) $g(x) = 3 - 2 \\log(x)$: As $x \\to 0^+$, $-2 \\log(x) \\to \\infty$, so $\\lim_{x \\to 0^+} g(x) = \\infty$. As $x \\to \\infty$, $-2 \\log(x) \\to -\\infty$, so $\\lim_{x \\to \\infty} g(x) = -\\infty$.\n- c) $h(x) = -\\log(x)$: $\\lim_{x \\to 0^+} h(x) = \\infty$, $\\lim_{x \\to \\infty} h(x) = -\\infty$\n\n**Example 2:** Determine increasing/decreasing and concave up/down.\n- a) $f(x) = \\log_3(2x)$: Increasing (base > 1, positive argument coefficient), Concave Down.\n- b) $g(x) = -\\log(x)$: Decreasing (negative coefficient), Concave Up.\n- c) $h(x) = \\log_6(4 - x)$: Decreasing (inside $4 - x$ is decreasing in $x$), Concave Down.\n\n**Example 3:** Find constant $k$ from tables.\n- a) x: 1, 2, k, 8, 16 → f(x): 1, 2, 3, 4, 5. Inputs double: $k = 4$.\n- b) x: 0.3, 3, 30, k, 3000 → f(x): 2, 5, 8, 11, 14. Inputs multiply by 10: $k = 300$.\n\n**Example 4:** Find domain and range.\n- a) $f(x) = 5 \\log(3x - 1) - 2$: $3x - 1 > 0 \\to x > 1/3$. Domain: $(1/3, \\infty)$, Range: $(-\\infty, \\infty)$.\n- b) $h(x) = 8 \\log(2x + 3)$: $2x + 3 > 0 \\to x > -3/2$. Domain: $(-3/2, \\infty)$, Range: $(-\\infty, \\infty)$."
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
          "markdown": "**Problem 1:** Write limit statements for $f(x) = 2 \\log_3(x)$.\n\n**Hint:** As $x \\to 0^+$, $2 \\log_3(x) \\to -\\infty$. As $x \\to \\infty$, $2 \\log_3(x) \\to \\infty$.\n\n**Problem 2:** Is $g(x) = -2 \\log(x)$ increasing or decreasing? Concave up or down?\n\n**Hint:** The negative coefficient flips both direction and concavity.\n\n**Problem 3:** Find $k$: x: 3, k, 27, 81 → f(x): 1, 2, 3, 4.\n\n**Hint:** Outputs increase by 1. What multiplicative pattern gives equally-spaced outputs?\n\n**Problem 4:** Find the domain of $h(x) = \\log(5 - 2x)$.\n\n**Hint:** Set $5 - 2x > 0$ and solve for $x$."
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
          "markdown": "**Problem 1:** Write limit statements for $f(x) = 3 \\log(x)$, $g(x) = -\\log_2(x)$, and $h(x) = 4 - \\log_5(x)$.\n\n**Problem 2:** A graph shows $m(x)$ increasing and concave down on $(0, \\infty)$ with a vertical asymptote at $x = 0$. Which equation could represent $m$?\n- (A) $m(x) = -\\log(x)$\n- (B) $m(x) = \\log_3(x)$\n- (C) $m(x) = -2 \\log(x)$\n- (D) $m(x) = e^x$\n\n**Problem 3:** Find domain and range: $f(x) = \\log_4(2x + 7)$, $g(x) = 3 - 5 \\log(x - 1)$.\n\n**Problem 4:** Find $k$: x: 5, k, 45, 135 → f(x): 0, 3, 6, 9."
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
          "markdown": "**Exit Ticket:** Write the limit statements for $f(x) = -\\log(x)$. State the domain. Is $f$ increasing or decreasing?\n\n**Lesson Summary:** Log functions have domain $(0, \\infty)$ and range $(-\\infty, \\infty)$, with a vertical asymptote at $x = 0$. Left end behavior is at $x \\to 0^+$, not $x \\to -\\infty$. Log functions are always monotonic and always concave in one direction. For $g(x) = a \\log_b(cx + d) + k$, set the argument > 0 to find the domain."
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
