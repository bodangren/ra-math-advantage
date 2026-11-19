import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_12Result> => {
    const now = Date.now();
    const lessonSlug = "3-12-equivalent-trig-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Equivalent Representations of Trigonometric Functions",
          slug: lessonSlug,
          description:
            "AP Precalculus Topic 3.12: Equivalent Representations of Trigonometric Functions",
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
          title: "Equivalent Representations of Trigonometric Functions",
          description:
            "AP Precalculus Topic 3.12: Equivalent Representations of Trigonometric Functions",
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
                "Is $\\tan^2\\theta - \\sec^2\\theta$ always equal to $-1$? Try $\\theta = \\pi/4$: $1 - 2 = -1$. Try $\\theta = \\pi/3$: $3 - 4 = -1$. It seems to hold. But *why*? The answer lies in a deep relationship between sine and cosine — one that constrains every angle, not just special ones. What identities govern these relationships, and how can you use them to rewrite expressions in simpler forms?",
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
                "- **Reciprocal identities**: $1/\\sin(x) = \\csc(x)$, $1/\\cos(x) = \\sec(x)$, $1/\\tan(x) = \\cot(x)$, $\\sin(x)/\\cos(x) = \\tan(x)$.\n- **Pythagorean identities**: $\\sin^2\\theta + \\cos^2\\theta = 1$, $1 + \\tan^2\\theta = \\sec^2\\theta$, $1 + \\cot^2\\theta = \\csc^2\\theta$.\n- **Sum/difference identities**: $\\sin(\\alpha \\pm \\beta) = \\sin(\\alpha)\\cos(\\beta) \\pm \\cos(\\alpha)\\sin(\\beta)$, $\\cos(\\alpha \\pm \\beta) = \\cos(\\alpha)\\cos(\\beta) \\mp \\sin(\\alpha)\\sin(\\beta)$.\n- **Double angle identities**: $\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)$, $\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1$.",
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
                "Trigonometric identities are equations that are true for every value in the domain. They let you rewrite expressions in equivalent forms — a critical skill for the AP exam.\n\n**Pythagorean identity**: $\\sin^2\\theta + \\cos^2\\theta = 1$ holds for all $\\theta$. Dividing by $\\cos^2\\theta$ yields $1 + \\tan^2\\theta = \\sec^2\\theta$. Dividing by $\\sin^2\\theta$ yields $1 + \\cot^2\\theta = \\csc^2\\theta$.\n\n**Double angle formulas** for cosine have three equivalent forms — choose strategically:\n- $\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta$ — use when both sin and cos are present\n- $\\cos(2\\theta) = 1 - 2\\sin^2\\theta$ — use when only sin appears\n- $\\cos(2\\theta) = 2\\cos^2\\theta - 1$ — use when only cos appears\n\n**Rewriting strategy**: Convert everything to sin and cos, simplify, then express in the target function. For example, to rewrite $\\tan(x) \\cdot \\csc(x)$ in terms of cos: $\\sin(x)/\\cos(x) \\cdot 1/\\sin(x) = 1/\\cos(x) = \\sec(x)$.\n\n**Inverse trigonometric functions:** $\\arccos x+\\arcsin x=\\pi/2$ for $-1\\le x\\le1$. The notation $\\cos^{-1}(x)$ means $\\arccos x$. It does not mean $1/\\cos x$. The latter is $\\sec x$.\n\n**Domain restrictions:** Keep the original domain when you simplify. The product $\\tan x\\csc x$ requires both $\\sin x\\ne0$ and $\\cos x\\ne0$. Its simplified expression $\\sec x$ must retain both restrictions.",
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
                "**Example 1:** Rewrite $f(x) = \\tan(x) \\cdot \\csc(x)$ as a fraction involving powers of $\\cos(x)$.\n\n**Solution:**\n- $\\tan(x) \\cdot \\csc(x) = \\frac{\\sin(x)}{\\cos(x)} \\cdot \\frac{1}{\\sin(x)} = \\frac{1}{\\cos(x)} = \\sec(x)$\n\n**Example 2:** Which is equivalent to $2\\sin(\\pi/14)\\cos(\\pi/14)$?\n\n**Solution:**\n- By the double angle identity: $2\\sin(\\theta)\\cos(\\theta) = \\sin(2\\theta)$\n- $2\\sin(\\pi/14)\\cos(\\pi/14) = \\sin(2 \\cdot \\pi/14) = \\sin(\\pi/7)$\n\n**Example 3:** Rewrite $k(x) = 4\\cos(2x)$ using the double angle identity.\n\n**Solution:**\n- Using $\\cos(2\\theta) = 1 - 2\\sin^2\\theta$: $4(1 - 2\\sin^2x) = 4 - 8\\sin^2x$\n- Using $\\cos(2\\theta) = 2\\cos^2\\theta - 1$: $4(2\\cos^2x - 1) = 8\\cos^2x - 4$\n- Both $4 - 8\\sin^2x$ and $8\\cos^2x - 4$ are equivalent.\n\n**Example 4:** Simplify $\\tan^2\\theta - \\sec^2\\theta$.\n\n**Solution:**\n- From $1 + \\tan^2\\theta = \\sec^2\\theta$, rearrange: $\\tan^2\\theta - \\sec^2\\theta = -1$",
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
                "**Problem 1:** If $\\sin(\\theta) = 3/5$, find $\\cos^2\\theta$.\n\n**Hint:** Use $\\sin^2\\theta + \\cos^2\\theta = 1$.\n\n**Problem 2:** Rewrite $(1 - \\cos^2x)/\\cos^2x$ in terms of $\\tan(x)$.\n\n**Hint:** Replace $1 - \\cos^2x$ with $\\sin^2x$, then simplify.\n\n**Problem 3:** Expand $(\\sin(x) + \\cos(x))^2$ and simplify using identities.\n\n**Hint:** Expand the square, then recognize $\\sin^2x + \\cos^2x = 1$.",
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
                "**Problem 1:** Rewrite each expression in terms of a single function:\n- $g(x) = \\tan(x) \\cdot \\sec(x)$ — express using powers of $\\sin(x)$\n- $h(x) = (1 - \\cos^2x)/\\cos^2x$ — simplify completely\n- $f(x) = (\\sec^2x - 1)/\\sin^2x$ — express using $\\sec(x)$\n\n**Problem 2:** Simplify each expression to a single value:\n- $\\tan^2\\theta - \\sec^2\\theta$\n- $(\\sin(\\theta) - \\cos(\\theta))^2 + (\\sin(\\theta) + \\cos(\\theta))^2$\n- $\\tan^2\\theta/(1 + \\tan^2\\theta)$\n\n**Problem 3:** $\\cos(\\pi/8)\\cos(\\pi/16) - \\sin(\\pi/8)\\sin(\\pi/16)$ equals what single trig value?\n\n**Hint:** This matches the cosine sum identity $\\cos(\\alpha)\\cos(\\beta) - \\sin(\\alpha)\\sin(\\beta)$.",
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
                "**Exit Ticket:** Simplify $\\tan^2\\theta - \\sec^2\\theta$. Rewrite $2\\sin(\\pi/10)\\cos(\\pi/10)$ using a double angle identity.\n\n**Lesson Summary:** Trigonometric identities — reciprocal, Pythagorean, sum/difference, and double angle — let you rewrite expressions in equivalent forms. The Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$ is the foundation; the other two Pythagorean identities derive from it. When simplifying, convert to sin and cos first, simplify, then express in the target function. The double angle formula for cosine has three forms — choose the one that matches your expression.",
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
