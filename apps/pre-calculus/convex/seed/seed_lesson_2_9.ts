import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_9Result> => {
    const now = Date.now();
    const lessonSlug = "2-9-logarithmic-expressions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Expressions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.9: Logarithmic Expressions",
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
          title: "Logarithmic Expressions",
          description: "AP Precalculus Topic 2.9: Logarithmic Expressions",
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
          "markdown": "Every operation has exactly one inverse. Addition is undone by subtraction. Multiplication is undone by division. But what undoes exponentiation?\n\nConsider: If $2^5 = 32$, we can ask the question **\"2 raised to what power gives 32?\"** The answer is 5. That question — *what exponent gives this result?* — is exactly what a logarithm answers.\n\nWrite each statement below in two ways — as an exponential equation and as the \"question\" form:\n\n1. $3^4 = 81$ — \"3 raised to what power gives 81?\" → Answer: 4\n2. $5^? = 125$ — \"5 raised to what power gives 125?\" → Answer: 3\n3. $10^? = 1000$ — Answer: 3\n\nA **logarithm** is the notation that captures this question. Instead of writing \"3 raised to what power gives 81?\" we write $\\log_3(81) = 4$."
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
          "markdown": "- **Logarithm**: The inverse of exponentiation. $\\log_b(c) = a$ means \"the exponent $a$ that makes $b^a = c$.\"\n- **Exponential form**: An equation written as $b^a = c$.\n- **Logarithmic form**: An equation written as $\\log_b(c) = a$. These two forms are interchangeable.\n- **Common logarithm**: A logarithm with base 10, written $\\log(x)$ without a subscript. $\\log(100) = 2$ means $10^2 = 100$.\n- **Natural logarithm**: A logarithm with base $e$, written $\\ln(x)$. $\\ln(e^3) = 3$ means $e^3 = e^3$.\n- **Change of base**: A formula for evaluating logs with non-standard bases: $\\log_b(x) = \\frac{\\log(x)}{\\log(b)}$."
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
          "markdown": "The relationship $b^a = c \\leftrightarrow \\log_b(c) = a$ is the foundation of logarithms. Converting between forms does not change the problem — it is just rewriting.\n\n**Converting exponential to logarithmic form:**\n- $7^2 = 49$ becomes $\\log_7(49) = 2$\n- $e^x = 5$ becomes $\\ln(5) = x$\n- $10^3 = 1000$ becomes $\\log(1000) = 3$\n\n**Converting logarithmic to exponential form:**\n- $\\log_2(16) = 4$ becomes $2^4 = 16$\n- $\\ln(c) = 4$ becomes $e^4 = c$\n- $\\log(y) = 2$ becomes $10^2 = y$\n\n**Evaluating without a calculator:** Ask \"what exponent gives this result?\"\n- $\\log_2(8) = 3$ because $2^3 = 8$\n- $\\log_5(1) = 0$ because $5^0 = 1$\n- $\\log_9(3) = 1/2$ because $9^{1/2} = 3$\n\n**Evaluating with a calculator:** Use the change of base formula $\\log_b(x) = \\frac{\\log(x)}{\\log(b)}$. For example, $\\log_2(10) = \\frac{\\log(10)}{\\log(2)} \\approx 3.3219$."
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
          "markdown": "**Example 1:** Convert to logarithmic form.\n- a) $5^3 = 125$ → $\\log_5(125) = 3$\n- b) $e^{3x} = y$ → $\\ln(y) = 3x$\n- c) $10^x = 6125$ → $\\log(6125) = x$\n\n**Example 2:** Convert to exponential form.\n- a) $\\log_7(x) = 2$ → $7^2 = x$, so $x = 49$\n- b) $\\ln(c) = 4$ → $e^4 = c$\n- c) $\\log(y) = -1$ → $10^{-1} = y$, so $y = 0.1$\n\n**Example 3:** Evaluate without a calculator.\n- a) $\\log_3(27) = 3$ — because $3^3 = 27$\n- b) $\\log_2(1/32) = -5$ — because $2^{-5} = 1/32$\n- c) $\\log_{16}(4) = 1/2$ — because $16^{1/2} = 4$\n- d) $\\ln(1) = 0$ — because $e^0 = 1$\n\n**Example 4:** Evaluate with a calculator.\n- a) $\\log_7(135) = \\frac{\\log(135)}{\\log(7)} \\approx 2.5208$\n- b) $\\ln(50) \\approx 3.9120$"
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
          "markdown": "**Problem 1:** Convert each to logarithmic form: $4^3 = 64$, $e^k = m$, $10^2 = 100$.\n\n**Hint:** The base becomes the log base, the exponent becomes the result, and the result becomes the argument.\n\n**Problem 2:** Evaluate without a calculator: $\\log_2(64)$, $\\log_5(125)$, $\\log_{81}(3)$, $\\log(10000)$.\n\n**Hint:** Ask \"what power of the base gives the argument?\" For $\\log_{81}(3)$, think fractional exponents.\n\n**Problem 3:** Use a calculator to evaluate $\\log_3(50)$ to four decimal places.\n\n**Hint:** $\\log_3(50) = \\frac{\\log(50)}{\\log(3)}$."
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
          "markdown": "**Problem 1:** Convert to logarithmic form: $2^6 = 64$, $e^{x+2} = 7$, $3^{-2} = 1/9$.\n\n**Problem 2:** Convert to exponential form: $\\log_4(64) = 3$, $\\ln(w) = t$, $\\log(0.01) = -2$.\n\n**Problem 3:** Evaluate without a calculator: $\\log_9(81)$, $\\log_{27}(3)$, $\\log_{1/4}(16)$, $\\log_6(1)$.\n\n**Problem 4:** Use a calculator: $\\log_2(50)$ and $\\ln(125)$ to four decimal places."
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
          "markdown": "**Exit Ticket:** Evaluate $\\log_2(32)$ without a calculator. Show your reasoning by converting to exponential form. Then evaluate $\\log_4(20)$ with a calculator using the change of base formula.\n\n**Lesson Summary:** A logarithm is the inverse of exponentiation. The forms $b^a = c$ and $\\log_b(c) = a$ are interchangeable — converting between them does not change the problem, it just rewrites it. To evaluate a logarithm without a calculator, ask \"what exponent gives this result?\" Common logarithms have base 10 (written $\\log$) and natural logarithms have base $e$ (written $\\ln$). For other bases, use the change of base formula $\\log_b(x) = \\frac{\\log(x)}{\\log(b)}$."
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
