import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_4Result> => {
    const now = Date.now();
    const lessonSlug = "2-4-exponential-manipulation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Function Manipulation",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.4: Exponential Function Manipulation",
          orderIndex: 4,
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
          title: "Exponential Function Manipulation",
          description: "AP Precalculus Topic 2.4: Exponential Function Manipulation",
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
          "markdown": "Consider $f(x) = 2^{(x+4)}$. Does this function produce different outputs than $g(x) = 8 \\cdot 2^x$? Evaluate both at $x = 0$, $x = 1$, and $x = 3$. What do you notice? Is there a way to convert every horizontal shift of an exponential function into a vertical stretch?"
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
          "markdown": "- **Product Property**: $b^m \\cdot b^n = b^{(m+n)}$\n- **Power Property**: $(b^m)^n = b^{mn}$\n- **Negative Exponent Property**: $b^{-n} = 1/b^n$\n- **Horizontal translation**: Shifting the graph left or right. For exponential functions, $f(x) = b^{(x+h)}$ shifts left by $h$.\n- **Horizontal dilation**: Stretching or compressing horizontally. For $f(x) = b^{cx}$, the graph compresses by factor $1/c$ when $c > 1$.\n- **Vertical dilation**: Multiplying the function by a constant. $f(x) = a \\cdot b^x$ stretches vertically by factor $a$."
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
          "markdown": "Exponential functions have a unique property: every horizontal transformation can be rewritten as a combination of vertical dilation and base change. This works because of the exponent rules.\n\n**Horizontal translation to vertical dilation:**\n$$b^{(x+h)} = b^h \\cdot b^x$$\n\nSo $f(x) = 2^{(x+3)} = 2^3 \\cdot 2^x = 8 \\cdot 2^x$. The horizontal shift left 3 is identical to multiplying by 8.\n\n**Horizontal dilation to base change:**\n$$b^{cx} = (b^c)^x$$\n\nSo $f(x) = 3^{2x} = (3^2)^x = 9^x$. The horizontal compression by $1/2$ is identical to changing the base from 3 to 9.\n\nThis equivalence is unique to exponential functions — it does not work for quadratic, polynomial, or other function families. It is a consequence of the fact that $b^{(x+h)}$ factors cleanly into $b^x \\cdot b^h$."
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
          "markdown": "**Example 1:** Rewrite $f(x) = 2^{(x+3)}$ as $y = a \\cdot b^x$.\n\n**Solution:**\n$$f(x) = 2^{(x+3)} = 2^3 \\cdot 2^x = 8 \\cdot 2^x$$\n\nSo $a = 8$ and $b = 2$.\n\n**Example 2:** Rewrite $g(x) = 3^{(x-2)}$ as $y = a \\cdot b^x$.\n\n**Solution:**\n$$g(x) = 3^{(x-2)} = 3^{-2} \\cdot 3^x = \\frac{1}{9} \\cdot 3^x$$\n\nSo $a = 1/9$ and $b = 3$.\n\n**Example 3:** Which is equivalent to $y = 2^{9x}$?\n\n(A) $f(x) = 3^x$ \\quad (B) $f(x) = 9 \\cdot 3^x$ \\quad (C) $f(x) = 18^x$ \\quad (D) $f(x) = 512^x$\n\n**Solution:**\n$$2^{9x} = (2^9)^x = 512^x$$\n\nThe answer is **(D)**."
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
          "markdown": "**Problem 1:** Rewrite each function in the form $y = a \\cdot b^x$.\n\na) $f(x) = 2^{(x+7)}$\n\nb) $g(x) = 5^{(x-1)}$\n\nc) $p(x) = (1/2)^{(4x-1)}$\n\n**Hint:** Use $b^{(x+h)} = b^h \\cdot b^x$ for translations and $b^{cx} = (b^c)^x$ for dilations.\n\n**Problem 2:** Which is equivalent to $p(x) = 2^{-3x}$?\n\n(A) $p(x) = (-9)^x$ \\quad (B) $p(x) = (1/8)^x$ \\quad (C) $p(x) = (1/9)^x$ \\quad (D) $p(x) = -8^x$\n\n**Hint:** Apply $b^{-3x} = (b^{-3})^x$."
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
          "markdown": "**Problem 1:** Rewrite in the form $y = a \\cdot b^x$: $h(x) = 3^{(x+2)}$\n\n**Problem 2:** Rewrite in the form $y = a \\cdot b^x$: $s(x) = (3/5)^{2x}$\n\n**Problem 3:** Which is equivalent to $f(x) = 4 \\cdot 36^x$?\n\n**Problem 4:** Which is equivalent to $g(x) = 25 \\cdot 3^x$?\n\n**Problem 5:** Rewrite in the form $y = a \\cdot b^x$: $m(x) = 2^{3x}$. Identify $a$ and $b$."
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
          "markdown": "**Exit Ticket:** Rewrite $f(x) = 3^{(x+2)}$ in the form $y = a \\cdot b^x$.\n\n**Lesson Summary:** Exponent rules — Product, Power, and Negative Exponent properties — allow any exponential expression to be rewritten. The key insight is that horizontal translations $b^{(x+h)}$ equal $b^h \\cdot b^x$ (a vertical dilation) and horizontal dilations $b^{cx}$ equal $(b^c)^x$ (a base change). This equivalence is unique to exponential functions and is essential for comparing and manipulating exponential models."
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
