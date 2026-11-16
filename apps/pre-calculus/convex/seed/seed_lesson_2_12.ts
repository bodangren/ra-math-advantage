import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_12Result> => {
    const now = Date.now();
    const lessonSlug = "2-12-logarithmic-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Function Manipulation",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.12: Logarithmic Function Manipulation",
          orderIndex: 12,
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
          title: "Logarithmic Function Manipulation",
          description: "AP Precalculus Topic 2.12: Logarithmic Function Manipulation",
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
          "markdown": "Since logarithmic expressions can be written in exponential form, the properties of exponents translate directly into properties of logarithms.\n\nRecall: $b^m \\cdot b^n = b^{m+n}$. Now let $x = b^m$ and $y = b^n$, so $m = \\log_b(x)$ and $n = \\log_b(y)$. Then $b^m \\cdot b^n = b^{m+n}$ becomes $xy = b^{m+n}$, which means $\\log_b(xy) = m + n = \\log_b(x) + \\log_b(y)$.\n\nUse the same reasoning with $\\frac{x}{y} = b^{m-n}$ and $x^n = b^{mn}$ to derive:\n- $\\log_b(\\frac{x}{y}) = \\log_b(x) - \\log_b(y)$\n- $\\log_b(x^n) = n \\cdot \\log_b(x)$\n\nThese are the **Product**, **Quotient**, and **Power** properties of logarithms."
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
          "markdown": "- **Product Property**: $\\log_b(xy) = \\log_b(x) + \\log_b(y)$ — the log of a product equals the sum of the logs.\n- **Quotient Property**: $\\log_b(\\frac{x}{y}) = \\log_b(x) - \\log_b(y)$ — the log of a quotient equals the difference of the logs.\n- **Power Property**: $\\log_b(x^n) = n \\cdot \\log_b(x)$ — the exponent comes out front as a coefficient.\n- **Change of Base**: $\\log_a(x) = \\frac{\\log_b(x)}{\\log_b(a)}$ — all logarithmic functions are vertical dilations of each other.\n- **Horizontal dilation / vertical translation equivalence**: $\\log(cx) = \\log(c) + \\log(x)$ — a horizontal dilation of a log function is equivalent to a vertical translation."
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
          "markdown": "Use a logarithm base $b>0$ with $b\\ne1$. Each real logarithm requires a positive argument. In expansions below, assume every variable inside a separate logarithm is positive. Without that assumption, $\\log_b(x^2)=2\\log_b|x|$ for $x\\ne0$. Keep the original domain after simplification.\n\n**Expanding** a logarithm means writing it as a sum or difference of simpler logarithms. **Condensing** means combining multiple logarithms into a single expression.\n\n**Condensing rules:**\n- Sums of logs become logs of products: $\\log_b(x) + \\log_b(y) = \\log_b(xy)$\n- Differences of logs become logs of quotients: $\\log_b(x) - \\log_b(y) = \\log_b(\\frac{x}{y})$\n- Coefficients become exponents: $n \\cdot \\log_b(x) = \\log_b(x^n)$\n\n**Common misconceptions:**\n- $\\log(a + b) \\ne \\log(a) + \\log(b)$ — you can only split **products**, not sums.\n- $\\log(x^2) = 2 \\log(x)$, NOT $(\\log x)^2$.\n\n**Change of base and vertical dilation:** Since $\\log_a(x) = \\frac{\\log_b(x)}{\\log_b(a)}$, every log function is a vertical scaling of every other. For example, $\\log_4(x) = \\frac{\\log_9(x)}{\\log_9(4)}$, so $\\log_4$ is $\\log_9$ scaled by $\\frac{1}{\\log_9(4)} = \\log_4(9)$.\n\n**Horizontal dilation as vertical translation:** $\\log(6x) = \\log(6) + \\log(x)$, so the function $f(x) = \\log(6x)$ is just $g(x) = \\log(x)$ shifted up by $\\log(6) \\approx 0.778$."
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
          "markdown": "**Example 1:** Condense to a single logarithm.\n- a) $\\log_4(x) + \\log_4(y) = \\log_4(xy)$\n- b) $\\log_3(5) - \\log_3(z) = \\log_3(\\frac{5}{z})$\n- c) $2 \\log_2(x) - 3 \\log_2(y) = \\log_2(\\frac{x^2}{y^3})$\n- d) $2 \\log_7(a) - 5 \\log_7(b) + \\log_7(4) = \\log_7(\\frac{4a^2}{b^5})$\n- e) $6 + 2 \\log(x) = \\log(10^6 x^2)$\n\n**Example 2:** Which is equivalent to $\\log_3(\\frac{x^2}{y})$?\n- (A) $\\log_3(2x) - \\log_3(y)$ — No. $\\log_3(2x) = \\log_3(2) + \\log_3(x)$\n- (B) $2(\\log_3(x) - \\log_3(y))$ — No. This equals $2 \\log_3(x) - 2 \\log_3(y)$\n- (C) $2 \\log_3(x) - \\log_3(y)$ — Yes. Power then quotient property.\n- (D) $\\log_3(x) + \\log_3(2) - \\log_3(y)$ — No.\n\n**Example 3:** Show that $f(x) = \\log(6x)$ is a vertical translation of $g(x) = \\log(x)$.\n- $\\log(6x) = \\log(6) + \\log(x) = g(x) + \\log(6)$. Vertical shift of $\\log(6) \\approx 0.778$.\n\n**Example 4:** Which is equivalent to $3 \\ln(x) - 4 \\ln(y)$?\n- (A) $\\ln(\\frac{x^3}{y^4})$ — Yes.\n- (B) $\\ln(\\frac{x^3}{4y})$ — No.\n- (C) $\\ln(3x - 4y)$ — No. You cannot take the log of a difference.\n- (D) $\\ln(3x) - \\ln(4y)$ — No."
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
          "markdown": "**Problem 1:** Condense each to a single logarithm.\n- a) $\\log_3(4) + \\log_3(z)$\n- b) $\\ln(x) - \\ln(w)$\n- c) $4 \\log_4(6) + 3 \\log_4(x)$\n\n**Hint:** Product property for sums, quotient for differences, power property for coefficients.\n\n**Problem 2:** Which is equivalent to $\\log(\\frac{3x}{5})$?\n- (A) $\\log(3x) - \\log(5)$\n- (B) $\\log(3) + \\log(x) - \\log(5)$\n- (C) $\\frac{\\log(3x)}{\\log(5)}$\n- (D) Both (A) and (B)\n\n**Hint:** Expand using quotient and product properties. (C) uses change of base, which is different.\n\n**Problem 3:** Explain why $\\log(4x)$ is a vertical translation of $\\log(x)$.\n\n**Hint:** Apply the product property to $\\log(4 \\cdot x)$."
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
          "markdown": "**Problem 1:** Condense each: $5 \\ln(2) + \\ln(x) - 2 \\ln(y) - \\ln(w)$, $\\log_{10}(3x) - \\log_{10}(5)$, $3 \\log_3(4) + \\log_3(z)$.\n\n**Problem 2:** Which is NOT equivalent to $2 \\log(x) - \\log(y)$?\n- (A) $\\log(\\frac{x^2}{y})$\n- (B) $\\log(x^2) - \\log(y)$\n- (C) $\\log(2x - y)$\n- (D) $\\log(x^2/y)$\n\n**Problem 3:** Let $f(x) = \\ln(x)$ and $k(x) = \\ln(8x)$. Explain the relationship using both a horizontal dilation interpretation and a vertical translation interpretation.\n\n**Problem 4:** Show that $\\log_4(x)$ is a vertical dilation of $\\log_9(x)$. What is the scale factor?"
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
          "markdown": "**Exit Ticket:** Condense $2 \\log_7(a) - 5 \\log_7(b) + \\log_7(4)$ to a single logarithm. Why is $\\log(a + b) \\neq \\log(a) + \\log(b)$?\n\n**Lesson Summary:** Log properties — Product, Quotient, Power — derive from exponent properties. Use them to expand or condense expressions. Change of base shows all log functions are vertical dilations of each other. Key error: $\\log(a + b) \\neq \\log(a) + \\log(b)$."
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
