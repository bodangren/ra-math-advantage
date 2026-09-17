import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_11Result> => {
    const now = Date.now();
    const lessonSlug = "1-11-equivalent-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Equivalent Representations of Polynomial and Rational Expressions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.11: Equivalent Representations of Polynomial and Rational Expressions",
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
          title: "Equivalent Representations of Polynomial and Rational Expressions",
          description: "AP Precalculus Topic 1.11: Equivalent Representations of Polynomial and Rational Expressions",
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
          "markdown": "You can describe a rational function three ways: its **factored form** (revealing zeros, holes, and VAs), its **expanded form** (standard polynomial division), or its **graph**. Given the graph of a rational function, can you reconstruct its factored equation? Given an equation, can you identify all features and sketch the graph? Today we build fluency moving between all three representations — and learn long division to find slant asymptotes."
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
          "markdown": "- **Factored form** — A rational expression written as products of linear factors in numerator and denominator.\n- **Expanded form** — Polynomials written in standard form with all terms distributed.\n- **Long division** — A procedure for dividing polynomials: $f(x) / g(x) = q(x) + r(x) / g(x)$, where $q$ is the quotient and $r$ is the remainder with degree less than $g$.\n- **Slant asymptote** — A non-vertical, non-horizontal asymptote given by the quotient $q(x)$ when the numerator degree exceeds the denominator degree by exactly 1.\n- **Binomial Theorem** — $(a + b)ⁿ = Σ C(n, r) · aⁿ⁻ʳ · bʳ$, providing coefficients from Pascal's Triangle."
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
          "markdown": "**EK 1.11.A.1:** A rational function in factored form reveals zeros, holes, and vertical asymptotes. The same function in expanded form or as a graph conveys the same information differently.\n\n**EK 1.11.A.2:** Long division produces $f(x) / g(x) = q(x) + r(x) / g(x)$. The quotient $q(x)$ gives the **slant asymptote** when the numerator degree exceeds the denominator degree by exactly 1.\n\n### When Does a Slant Asymptote Exist?\n\nA slant asymptote exists when $deg(numerator) = deg(denominator) + 1$. Perform long division; the quotient $q(x)$ (ignoring the remainder) is the slant asymptote.\n\n### The Binomial Theorem and Pascal's Triangle\n\n$(a + b)⁰ = 1$\n$(a + b)¹ = a + b$\n$(a + b)² = a² + 2ab + b²$\n$(a + b)³ = a³ + 3a²b + 3ab² + b³$\n\nEach row of Pascal's Triangle gives the coefficients. Note: $C(n, r) = n! / (r!(n-r)!)$ — you will not need this formula on the AP exam."
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
          "markdown": "**Example 1:** Analyze $h(x) = (x² - 4) / (x² + 7x + 10)$.\n\nFactor: $(x - 2)(x + 2) / ((x + 2)(x + 5))$.\n\n- Cancel $(x + 2)$ → hole at $x = -2$. Simplified value: $(-4) / (3)$.\n- VA at $x = -5$ (remaining denominator zero).\n- Zero at $x = 2$ (remaining numerator factor).\n\n**Example 2:** Use long division to find the slant asymptote of $h(x) = (x² + 6x + 5) / (2x + 1)$.\n\nDivide $x² + 6x + 5$ by $2x + 1$:\n\n- Quotient term 1: $x² / 2x = x/2$. Multiply: $x/2 · (2x + 1) = x² + x/2$. Subtract: $6x - x/2 = 11x/2$.\n- Quotient term 2: $11x/2 / 2x = 11/4$. Multiply: $11/4 · (2x + 1) = 11x/2 + 11/4$. Subtract: $5 - 11/4 = 9/4$.\n\nResult: $h(x) = x/2 + 11/4 + (9/4) / (2x + 1)$. Slant asymptote: $y = x/2 + 11/4$.\n\n**Example 3:** Expand $(x + 2)⁵$ using Pascal's Triangle.\n\nRow 5: 1, 5, 10, 10, 5, 1.\n\n$(x + 2)⁵ = x⁵ + 5x⁴(2) + 10x³(4) + 10x²(8) + 5x(16) + 32$\n$= x⁵ + 10x⁴ + 40x³ + 80x² + 80x + 32$"
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
          "markdown": "**Problem 1:** Use long division to find the slant asymptote of $f(x) = (x² - 6x + 7) / (x - 1)$.\n*Hint:* Divide $x² - 6x + 7$ by $x - 1$. The quotient (without remainder) is your slant asymptote.\n\n**Problem 2:** What is the coefficient of the $x⁴$ term when $(x + 5)⁶$ is expanded?\n*Hint:* Use $C(6, 2) · 5²$. The $x⁴$ term pairs $a⁴$ with $b²$.\n\n**Problem 3:** Analyze $d(x) = (2x² + 4x + 1) / (2x - 1)$. Does it have a horizontal asymptote, slant asymptote, or neither? How many VAs? How many holes?\n*Hint:* Compare degrees: numerator degree 2, denominator degree 1."
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
          "markdown": "**Problem 1:** For $f(x) = (x² + x - 2) / (x² - 2x - 3)$, provide: factored form, zeros, holes, VAs, horizontal asymptotes, domain, and a sketch.\n\n**Problem 2:** Use long division to find the slant asymptote of $r(x) = (2x² + 4x + 7) / (6x - 5)$.\n\n**Problem 3:** Given a graph of a rational function with a zero at $x = -1$, a hole at $x = 3$, a VA at $x = 2$, and a horizontal asymptote at $y = 1$, write a possible equation in factored form."
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
          "markdown": "**Exit Ticket:** Use long division to find the slant asymptote of $f(x) = (2x² + 3x - 1) / (x + 4)$.\n\n**Lesson Summary:** Rational functions can be represented in factored form, expanded form, or as a graph. Long division reveals slant asymptotes when the numerator is one degree higher than the denominator. The Binomial Theorem with Pascal's Triangle provides a systematic way to expand binomials. Fluency across all representations is essential for AP Precalculus."
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
