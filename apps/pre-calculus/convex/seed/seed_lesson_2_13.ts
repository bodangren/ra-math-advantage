import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_13Result> => {
    const now = Date.now();
    const lessonSlug = "2-13-exp-log-equations-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential and Logarithmic Equations and Inequalities",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.13: Exponential and Logarithmic Equations and Inequalities",
          orderIndex: 13,
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
          title: "Exponential and Logarithmic Equations and Inequalities",
          description: "AP Precalculus Topic 2.13: Exponential and Logarithmic Equations and Inequalities",
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
          "markdown": "Solving equations requires undoing operations. To solve $3x + 5 = 20$, we subtract 5 and divide by 3 — undoing addition and multiplication in reverse order. Exponential and logarithmic equations follow the same principle, but now we must undo exponentiation (using logarithms) and logarithms (using exponentiation).\n\nConsider: $2^x = 32$. You might recognize $x = 5$ immediately. But what about $2^x = 30$? We need a systematic process: since $2^x = 30$, we take $\\log_2$ of both sides: $x = \\log_2(30)$. Or use common logs: $x = \\frac{\\log(30)}{\\log(2)}$.\n\nThe key insight: $b^c = a \\rightarrow \\log_b(a) = c$. We convert between exponential and logarithmic form to isolate the variable."
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
          "markdown": "- **Isolate**: Rearrange an equation so the exponential or logarithmic expression is alone on one side.\n- **Convert**: Switch between exponential form $b^c = a$ and logarithmic form $\\log_b(a) = c$ to solve for the variable.\n- **Common bases**: When two exponential expressions share a base (or can be rewritten to share a base), set exponents equal. Example: $8^x = 2^{3x}$, so $8^{2x+1} = 2^{3(2x+1)}$.\n- **Extraneous solution**: A solution that emerges algebraically but fails to satisfy the original equation — particularly common with logarithmic equations where arguments must be positive.\n- **Inverse of a general exponential/log function**: Finding $f^{-1}(x)$ when $f(x) = a \\cdot b^{cx+d} + k$ or $f(x) = a \\log_b(cx + d) + k$."
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
          "markdown": "**Four-step process for exponential equations:**\n1. **Isolate** the exponential expression.\n2. **Convert** to logarithmic form.\n3. **Solve** for the variable.\n4. **Simplify.**\n\n**Solving logarithmic equations:**\n- Single log: Isolate, then convert to exponential form.\n- Multiple logs: Use log properties to combine into one log, then convert.\n\n**Always check for extraneous solutions.** Logarithmic properties can produce solutions where the argument is non-positive. Verify every solution by substituting back into the original equation.\n\n**Common bases:** If both sides can be written with the same base, set exponents equal. For example, $9^{2x} = 27^{x+2}$ becomes $3^{4x} = 3^{3(x+2)}$, so $4x = 3x + 6$ and $x = 6$.\n\n**Inequalities:** Follow the same conversion process, preserving inequality direction."
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
          "markdown": "**Example 1:** Solve single exponential equations.\n- a) $4^{x-2} = 7$ → $x - 2 = \\log_4(7)$ → $x = 2 + \\log_4(7)$\n- b) $2^{x+3} + 5 = 26$ → $2^{x+3} = 21$ → $x + 3 = \\log_2(21)$ → $x = \\log_2(21) - 3$\n- c) $-7 = 3 - 4e^x$ → $e^x = \\frac{5}{2}$ → $x = \\ln(\\frac{5}{2})$\n\n**Example 2:** Solve single logarithmic equations.\n- a) $2 \\log_3(x+3) + 4 = 10$ → $\\log_3(x+3) = 3$ → $x + 3 = 27$ → $x = 24$\n- b) $\\ln(2-x)/5 = 1$ → $\\ln(2-x) = 5$ → $2 - x = e^5$ → $x = 2 - e^5$\n\n**Example 3:** Solve equations with multiple logs (check extraneous).\n- a) $\\log_3(x+2) + \\log_3(x-3) = \\log_3(14)$ → $(x+2)(x-3) = 14$ → $x^2 - x - 20 = 0$ → $(x-5)(x+4) = 0$. Check: $x = 5$ gives positive arguments. $x = -4$ gives $x - 3 = -7 < 0$ — extraneous. Solution: $x = 5$.\n\n**Example 4:** Solve using common bases.\n- a) $9^{2x} = 27^{x+2}$ → $3^{4x} = 3^{3x+6}$ → $4x = 3x + 6$ → $x = 6$\n- b) $(1/2)^{5x+7} = 4^x$ → $2^{-5x-7} = 2^{2x}$ → $-5x - 7 = 2x$ → $x = -1$\n\n**Example 5:** Find the inverse of $f(x) = 4^{3x+2} - 15$.\n- $y = 4^{3x+2} - 15$ → $y + 15 = 4^{3x+2}$ → $\\log_4(y+15) = 3x + 2$ → $x = \\frac{\\log_4(y+15) - 2}{3}$. So $f^{-1}(x) = \\frac{\\log_4(x+15) - 2}{3}$."
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
          "markdown": "**Problem 1:** Solve $3^{x+4} = 15$.\n\n**Hint:** Isolate the exponential (already isolated), then convert: $x + 4 = \\log_3(15)$. Solve for $x$.\n\n**Problem 2:** Solve $\\log(3) + \\log(x+4) = \\log(5x-2)$.\n\n**Hint:** Combine the left side using the product property: $\\log(3(x+4)) = \\log(5x-2)$. Then set arguments equal. Check for extraneous solutions.\n\n**Problem 3:** Solve $8^{3x-2} = 2^{x+5}$.\n\n**Hint:** Rewrite $8$ as $2^3$: $2^{3(3x-2)} = 2^{x+5}$. Set exponents equal.\n\n**Problem 4:** Find the inverse of $g(x) = 3^{x-2} + 1$.\n\n**Hint:** Swap $x$ and $y$, then isolate the exponential and convert to log form."
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
          "markdown": "**Problem 1:** Solve.\n- a) $4^{x+3} - 7 = 2$\n- b) $\\log_2(x-1) = 3$\n- c) $3 \\log_4(x) + 2 = -7$\n\n**Problem 2:** Solve and check for extraneous solutions.\n- a) $\\ln(x+1) - \\ln(3x-5) = \\ln(7)$\n- b) $\\log_3(2x-1) - \\log_3(x+3) = \\log_3(4)$\n\n**Problem 3:** Solve using common bases.\n- a) $3^{x-1} = 9^{2x+5}$\n- b) $4^{2x-3} = 2^x$\n\n**Problem 4:** Find the inverse of $k(x) = 3 \\log(x+1) - 2$."
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
          "markdown": "**Exit Ticket:** Solve $\\log_3(2x-1) - \\log_3(x+3) = \\log_3(4)$. Check for extraneous solutions.\n\n**Lesson Summary:** Solving exponential and logarithmic equations follows a systematic process: isolate, convert between forms, solve, simplify. When multiple logs appear, use log properties to combine them first. When exponential expressions share a base, set the exponents equal. Always check for extraneous solutions in logarithmic equations — the argument of every log must be positive in the original equation."
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
